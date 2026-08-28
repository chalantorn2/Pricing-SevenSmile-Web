<?php
// api/tours.php - Updated to support map_url field
//
// GET stays open to anyone: /share/tour/:id is a public page with no signed-in user,
// and every link already handed to a customer depends on it. Writes need a login.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
require_once __DIR__ . '/_auth.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

authRequireForWrites();

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Database connection using correct credentials
    $host = 'localhost';
    $dbname = 'sevensmile_contactrate';
    $username = 'sevensmile_contactrate';
    $password = 'contactrate2025';

    // Create PDO connection with error handling
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    $method = $_SERVER['REQUEST_METHOD'];

    // ---------------------------------------------------------------------
    // Writable columns on `tours`, with how a posted value is normalised.
    //
    //   str   trimmed string, '' -> NULL
    //   text  string kept verbatim (newlines matter), '' -> NULL
    //   num   decimal, '' -> NULL
    //   num0  decimal that must never be NULL (the two headline prices)
    //   int   integer, '' -> NULL
    //   int0  integer that must never be NULL (a NOT NULL column with a default)
    //   bool  1/0, never NULL
    //   flag  tri-state 1/0/NULL - NULL means "nobody recorded this yet" and
    //         must not be shown as "no"
    //   date  YYYY-MM-DD, '' -> NULL
    //   time  HH:MM[:SS], '' -> NULL
    //   json  array (or comma list) -> JSON text, empty -> NULL
    //
    // Both INSERT and UPDATE are built from this list, so adding a column here
    // is the only edit needed to make it writable.
    // ---------------------------------------------------------------------
    $TOUR_FIELDS = array(
        'tour_name'            => 'str',
        'departure_from'       => 'str',
        'destination'          => 'str',
        'pier'                 => 'str',
        'tour_type'            => 'str',
        'adult_price'          => 'num0',
        'child_price'          => 'num0',
        'start_date'           => 'date',
        'end_date'             => 'date',
        'notes'                => 'text',
        'park_fee_included'    => 'bool',
        'park_fee_adult'       => 'num',
        'park_fee_child'       => 'num',
        'map_url'              => 'str',
        // Duration
        'duration_type'        => 'str',
        'duration_hours'       => 'num',
        'start_time'           => 'time',
        'end_time'             => 'time',
        'time_note'            => 'str',
        // Pricing detail (all net rates)
        'price_mode'           => 'str',
        'child_age_min'        => 'int',
        'child_age_max'        => 'int',
        'infant_price'         => 'num',
        'infant_age_max'       => 'int',
        'single_supplement'    => 'num',
        'min_pax'              => 'int',
        'max_pax'              => 'int',
        // Meals
        'meals_included'       => 'json',
        'meal_style'           => 'str',
        'meal_venue'           => 'str',
        'halal_available'      => 'flag',
        'vegetarian_available' => 'flag',
        'meal_note'            => 'str',
        // Vessel / vehicle
        'vessel_type'          => 'str',
        'vessel_name'          => 'str',
        'vessel_capacity'      => 'int',
        'vessel_detail'        => 'str',
        'guide_included'       => 'flag',
        'guide_languages'      => 'json',
        // Pickup / transfer
        'transfer_included'    => 'flag',
        'transfer_type'        => 'str',
        'pickup_time_from'     => 'time',
        'pickup_time_to'       => 'time',
        'meeting_point'        => 'str',
        // Availability
        'operating_days'       => 'json',
        'booking_lead_hours'   => 'int',
        'is_active'            => 'bool',
        'last_verified_at'     => 'date',
        // Frequently used
        'is_frequent'          => 'bool',
        'frequent_order'       => 'int0',
    );

    function normalizeTourValue($kind, $value)
    {
        switch ($kind) {
            case 'str':
                $v = is_string($value) ? trim($value) : $value;
                return ($v === '' || $v === null) ? null : $v;

            case 'text':
                return ($value === '' || $value === null) ? null : $value;

            case 'num':
                if ($value === '' || $value === null) return null;
                return is_numeric($value) ? (float) $value : null;

            case 'num0':
                return is_numeric($value) ? (float) $value : 0;

            case 'int':
                if ($value === '' || $value === null) return null;
                return is_numeric($value) ? (int) $value : null;

            case 'int0':
                return is_numeric($value) ? (int) $value : 0;

            case 'bool':
                return ($value === true || $value === 1 || $value === '1' || $value === 'true') ? 1 : 0;

            case 'flag':
                if ($value === '' || $value === null) return null;
                return ($value === true || $value === 1 || $value === '1' || $value === 'true') ? 1 : 0;

            case 'date':
                if ($value === '' || $value === null || $value === '0000-00-00') return null;
                return substr($value, 0, 10);

            case 'time':
                if ($value === '' || $value === null) return null;
                // Accept "08:00" and "08:00:00"; anything else is dropped.
                return preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $value) ? substr($value, 0, 5) . ':00' : null;

            case 'json':
                if (is_string($value)) {
                    $value = trim($value);
                    if ($value === '') return null;
                    $decoded = json_decode($value, true);
                    $value = is_array($decoded)
                        ? $decoded
                        : array_values(array_filter(array_map('trim', explode(',', $value)), 'strlen'));
                }
                if (!is_array($value) || count($value) === 0) return null;
                return json_encode(array_values($value), JSON_UNESCAPED_UNICODE);
        }
        return $value;
    }

    /**
     * Turn a posted payload into [column => value] pairs.
     *
     * $onlyProvided keeps an UPDATE to the keys the client actually sent, so a
     * screen that edits a handful of columns (the bulk editor) cannot blank out
     * the ones it knows nothing about.
     */
    function collectTourFields($data, $fields, $onlyProvided)
    {
        $out = array();
        foreach ($fields as $column => $kind) {
            if ($onlyProvided && !array_key_exists($column, $data)) {
                continue;
            }
            $raw = array_key_exists($column, $data) ? $data[$column] : null;
            $out[$column] = normalizeTourValue($kind, $raw);
        }
        // "No end date" wins over whatever sits in the end_date box.
        if (array_key_exists('end_date', $out) && !empty($data['no_end_date'])) {
            $out['end_date'] = null;
        }
        return $out;
    }

    switch ($method) {
        case 'GET':
            // Get a single tour by id
            if (isset($_GET['id']) && $_GET['id'] !== '') {
                $sql = "SELECT t.*,
                  sa.name as supplier_name,
                  sa.address,
                  sa.phone,
                  sa.phone_2,
                  sa.phone_3,
                  sa.phone_4,
                  sa.phone_5,
                  sa.line,
                  sa.facebook,
                  sa.whatsapp,
                  sa.website,
                  sa.created_at as sub_agent_created_at,
                  sa.updated_at as sub_agent_updated_at
                FROM tours t
                LEFT JOIN suppliers sa ON t.supplier_id = sa.id
                WHERE t.id = ?";

                $stmt = $pdo->prepare($sql);
                $stmt->execute(array($_GET['id']));
                $tour = $stmt->fetch();

                if (!$tour) {
                    http_response_code(404);
                    echo json_encode(array(
                        'success' => false,
                        'message' => 'Tour not found',
                        'timestamp' => date('c')
                    ));
                    break;
                }

                echo json_encode(array(
                    'success' => true,
                    'data' => $tour,
                    'timestamp' => date('c')
                ));
                break;
            }

            // Get all tours with supplier information
            $sql = "SELECT t.*,
              sa.name as supplier_name,
              sa.address,
              sa.phone,
              sa.phone_2,
              sa.phone_3,
              sa.phone_4,
              sa.phone_5,
              sa.line,
              sa.facebook,
              sa.whatsapp,
              sa.website,
              sa.created_at as sub_agent_created_at,
              sa.updated_at as sub_agent_updated_at
            FROM tours t
            LEFT JOIN suppliers sa ON t.supplier_id = sa.id
            ORDER BY t.updated_at DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $tours = $stmt->fetchAll();

            if (isset($_GET['search_gallery']) && $_GET['search_gallery']) {
                $search_term = $_GET['search_gallery'];

                $sql = "SELECT DISTINCT t.*, sa.name as supplier_name,
                   COUNT(tf.id) as gallery_count
            FROM tours t
            LEFT JOIN suppliers sa ON t.supplier_id = sa.id
            INNER JOIN tour_files tf ON t.id = tf.tour_id 
            WHERE tf.file_category = 'gallery' 
            AND (t.tour_name LIKE ? OR sa.name LIKE ?)
            GROUP BY t.id
            HAVING gallery_count > 0
            ORDER BY t.updated_at DESC";

                $stmt = $pdo->prepare($sql);
                $search_param = '%' . $search_term . '%';
                $stmt->execute(array($search_param, $search_param));
                $tours = $stmt->fetchAll();

                echo json_encode(array(
                    'success' => true,
                    'data' => $tours,
                    'count' => count($tours),
                    'search_term' => $search_term,
                    'timestamp' => date('c')
                ));
            } else {
                echo json_encode(array(
                    'success' => true,
                    'data' => $tours,
                    'count' => count($tours),
                    'timestamp' => date('c')
                ));
            }
            break;

        case 'POST':
            // Add new tour(s) - supports both single and multiple tours
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            // Check if it's multiple tours (array) or single tour (object)
            $tours = isset($data['tours']) ? $data['tours'] : array($data);
            $supplier_id = isset($data['supplier_id']) ? $data['supplier_id'] : null;
            $updated_by = isset($data['updated_by']) ? $data['updated_by'] : 'Unknown';

            // Validate supplier_id if provided
            if ($supplier_id) {
                $stmt = $pdo->prepare("SELECT id FROM suppliers WHERE id = ?");
                $stmt->execute(array($supplier_id));
                if (!$stmt->fetch()) {
                    throw new Exception("Supplier was not found in the system");
                }
            }

            $created_tours = array();

            // Start transaction for multiple tours
            $pdo->beginTransaction();

            try {
                foreach ($tours as $tour) {
                    // Validate required fields
                    if (empty($tour['tour_name'])) {
                        throw new Exception("Please enter a tour name");
                    }

                    // Only the columns the client sent are written, so a payload
                    // that says nothing about is_active / is_frequent gets the
                    // table's default rather than a blanket 0.
                    $values = collectTourFields($tour, $TOUR_FIELDS, true);
                    $values['supplier_id'] = $supplier_id;
                    $values['updated_by']  = $updated_by;

                    $columns      = array_keys($values);
                    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
                    $sql = "INSERT INTO tours (`" . implode('`, `', $columns) . "`) VALUES ($placeholders)";

                    $stmt = $pdo->prepare($sql);
                    $result = $stmt->execute(array_values($values));

                    if ($result) {
                        $id = $pdo->lastInsertId();

                        // Get the created tour with supplier info
                        $stmt = $pdo->prepare("
                            SELECT t.*, 
                                  sa.name as supplier_name,
                                  sa.address, sa.phone, sa.line, sa.facebook, sa.whatsapp, sa.website
                            FROM tours t
                            LEFT JOIN suppliers sa ON t.supplier_id = sa.id
                            WHERE t.id = ?
                        ");
                        $stmt->execute(array($id));
                        $created_tour = $stmt->fetch();

                        $created_tours[] = $created_tour;
                    } else {
                        throw new Exception("Unable to save the tour");
                    }
                }

                // Commit transaction
                $pdo->commit();

                echo json_encode(array(
                    'success' => true,
                    'data' => count($created_tours) === 1 ? $created_tours[0] : $created_tours,
                    'message' => 'Tours added successfully (' . count($created_tours) . ' items)',
                    'count' => count($created_tours)
                ));
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'PUT':
            // Bulk update destination (migration tool) - one request for many tours
            if (isset($_GET['action']) && $_GET['action'] === 'bulk_destination') {
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);

                $ids = isset($data['ids']) && is_array($data['ids']) ? $data['ids'] : array();
                $destination = isset($data['destination']) ? $data['destination'] : null;
                $updated_by = isset($data['updated_by']) ? $data['updated_by'] : 'Unknown';

                // Keep only valid integer IDs
                $ids = array_values(array_filter(array_map('intval', $ids), function ($v) {
                    return $v > 0;
                }));

                if (empty($ids)) {
                    throw new Exception("No tours selected");
                }
                if ($destination === null || $destination === '') {
                    throw new Exception("Destination is required");
                }

                // Parameterized IN clause from the selected IDs
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $sql = "UPDATE tours SET destination = ?, updated_by = ?, updated_at = NOW() WHERE id IN ($placeholders)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_merge(array($destination, $updated_by), $ids));

                echo json_encode(array(
                    'success' => true,
                    'message' => 'Destination updated for ' . $stmt->rowCount() . ' tour(s)',
                    'updated' => $stmt->rowCount()
                ));
                break;
            }

            // Bulk update tour_type (migration tool) - one request for many tours
            if (isset($_GET['action']) && $_GET['action'] === 'bulk_type') {
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);

                $ids = isset($data['ids']) && is_array($data['ids']) ? $data['ids'] : array();
                $tour_type = isset($data['tour_type']) ? $data['tour_type'] : null;
                $updated_by = isset($data['updated_by']) ? $data['updated_by'] : 'Unknown';

                // Keep only valid integer IDs
                $ids = array_values(array_filter(array_map('intval', $ids), function ($v) {
                    return $v > 0;
                }));

                if (empty($ids)) {
                    throw new Exception("No tours selected");
                }

                // Only allow known tour_type values
                $allowed_types = array('one_day_trip', 'private', 'show_ticket', 'activity', 'package');
                if ($tour_type === null || !in_array($tour_type, $allowed_types, true)) {
                    throw new Exception("Invalid tour type");
                }

                // Parameterized IN clause from the selected IDs
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $sql = "UPDATE tours SET tour_type = ?, updated_by = ?, updated_at = NOW() WHERE id IN ($placeholders)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_merge(array($tour_type, $updated_by), $ids));

                echo json_encode(array(
                    'success' => true,
                    'message' => 'Tour type updated for ' . $stmt->rowCount() . ' tour(s)',
                    'updated' => $stmt->rowCount()
                ));
                break;
            }

            // Bulk update departure_from (migration tool) - one request for many tours
            if (isset($_GET['action']) && $_GET['action'] === 'bulk_departure') {
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);

                $ids = isset($data['ids']) && is_array($data['ids']) ? $data['ids'] : array();
                $departure = isset($data['departure']) ? $data['departure'] : null;
                $updated_by = isset($data['updated_by']) ? $data['updated_by'] : 'Unknown';

                // Keep only valid integer IDs
                $ids = array_values(array_filter(array_map('intval', $ids), function ($v) {
                    return $v > 0;
                }));

                if (empty($ids)) {
                    throw new Exception("No tours selected");
                }
                if ($departure === null || $departure === '') {
                    throw new Exception("Departure is required");
                }

                // Parameterized IN clause from the selected IDs
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $sql = "UPDATE tours SET departure_from = ?, updated_by = ?, updated_at = NOW() WHERE id IN ($placeholders)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_merge(array($departure, $updated_by), $ids));

                echo json_encode(array(
                    'success' => true,
                    'message' => 'Departure updated for ' . $stmt->rowCount() . ' tour(s)',
                    'updated' => $stmt->rowCount()
                ));
                break;
            }

            // Pin / unpin a tour as one the office uses often (the star in the list)
            if (isset($_GET['action']) && $_GET['action'] === 'toggle_frequent') {
                $input = file_get_contents('php://input');
                $data = json_decode($input, true);

                $id = isset($data['id']) ? (int) $data['id'] : 0;
                if ($id <= 0) {
                    throw new Exception("ID not found");
                }
                $is_frequent = !empty($data['is_frequent']) ? 1 : 0;

                $stmt = $pdo->prepare("UPDATE tours SET is_frequent = ? WHERE id = ?");
                $stmt->execute(array($is_frequent, $id));

                echo json_encode(array(
                    'success' => true,
                    'data' => array('id' => $id, 'is_frequent' => $is_frequent),
                    'message' => $is_frequent ? 'Pinned as frequently used' : 'Unpinned'
                ));
                break;
            }

            // Update tour
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ID not found");
            }

            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            // Only the columns the client actually sent are written, so a screen
            // that edits a subset (the bulk editor) leaves the rest untouched.
            $values = collectTourFields($data, $TOUR_FIELDS, true);
            if (array_key_exists('tour_name', $values) && $values['tour_name'] === null) {
                throw new Exception("Please enter a tour name");
            }
            if (count($values) === 0) {
                throw new Exception("Nothing to update");
            }
            if (array_key_exists('supplier_id', $data)) {
                $values['supplier_id'] = $data['supplier_id'] !== '' ? $data['supplier_id'] : null;
            }
            $values['updated_by'] = isset($data['updated_by']) ? $data['updated_by'] : 'Unknown';

            $assignments = array();
            foreach (array_keys($values) as $column) {
                $assignments[] = "`$column` = ?";
            }
            $sql = "UPDATE tours SET " . implode(', ', $assignments) . ", updated_at = NOW() WHERE id = ?";

            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array_merge(array_values($values), array($id)));

            if ($result) {
                // Get updated tour with supplier info
                $stmt = $pdo->prepare("
                    SELECT t.*, 
                          sa.name as supplier_name,
                          sa.address, sa.phone, sa.line, sa.facebook, sa.whatsapp, sa.website
                    FROM tours t
                    LEFT JOIN suppliers sa ON t.supplier_id = sa.id
                    WHERE t.id = ?
                ");
                $stmt->execute(array($id));
                $tour = $stmt->fetch();

                echo json_encode(array(
                    'success' => true,
                    'data' => $tour,
                    'message' => 'Updated successfully'
                ));
            } else {
                throw new Exception("Unable to update data");
            }
            break;

        case 'DELETE':
            // Delete tour
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ID not found");
            }

            $stmt = $pdo->prepare("DELETE FROM tours WHERE id = ?");
            $result = $stmt->execute(array($id));

            if ($result) {
                echo json_encode(array(
                    'success' => true,
                    'message' => 'Deleted successfully'
                ));
            } else {
                throw new Exception("Unable to delete data");
            }
            break;

        default:
            throw new Exception("Method not allowed");
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => 'Database connection failed',
        'details' => $e->getMessage(),
        'debug' => array(
            'host' => $host,
            'database' => $dbname,
            'user' => $username
        )
    ));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ));
}
