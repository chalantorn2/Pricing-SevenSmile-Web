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

                    $sql = "INSERT INTO tours (supplier_id, tour_name, departure_from, destination, pier, tour_type, adult_price, child_price, start_date, end_date, notes, park_fee_included, park_fee_adult, park_fee_child, map_url, updated_by)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                    $stmt = $pdo->prepare($sql);
                    $result = $stmt->execute(array(
                        $supplier_id,
                        $tour['tour_name'],
                        isset($tour['departure_from']) ? $tour['departure_from'] : null,
                        isset($tour['destination']) ? $tour['destination'] : null,
                        isset($tour['pier']) ? $tour['pier'] : null,
                        isset($tour['tour_type']) ? $tour['tour_type'] : null,
                        isset($tour['adult_price']) ? $tour['adult_price'] : 0,
                        isset($tour['child_price']) ? $tour['child_price'] : 0,
                        isset($tour['start_date']) && $tour['start_date'] ? $tour['start_date'] : null,
                        isset($tour['end_date']) && $tour['end_date'] && !$tour['no_end_date'] ? $tour['end_date'] : null,
                        isset($tour['notes']) ? $tour['notes'] : null,
                        isset($tour['park_fee_included']) && $tour['park_fee_included'] ? 1 : 0,
                        isset($tour['park_fee_adult']) && $tour['park_fee_adult'] !== '' ? $tour['park_fee_adult'] : null,
                        isset($tour['park_fee_child']) && $tour['park_fee_child'] !== '' ? $tour['park_fee_child'] : null,
                        isset($tour['map_url']) ? $tour['map_url'] : null, // New field
                        $updated_by
                    ));

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

            // Update tour
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ID not found");
            }

            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            // ✅ Add this line to support map_url
            $sql = "UPDATE tours
           SET supplier_id=?, tour_name=?, departure_from=?, destination=?, pier=?, tour_type=?, adult_price=?, child_price=?, start_date=?, end_date=?, notes=?, park_fee_included=?, park_fee_adult=?, park_fee_child=?, map_url=?, updated_by=?, updated_at=NOW()
           WHERE id=?";

            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array(
                isset($data['supplier_id']) ? $data['supplier_id'] : null,
                $data['tour_name'],
                isset($data['departure_from']) ? $data['departure_from'] : null,
                isset($data['destination']) ? $data['destination'] : null,
                isset($data['pier']) ? $data['pier'] : null,
                isset($data['tour_type']) ? $data['tour_type'] : null,
                isset($data['adult_price']) ? $data['adult_price'] : 0,
                isset($data['child_price']) ? $data['child_price'] : 0,
                isset($data['start_date']) && $data['start_date'] ? $data['start_date'] : null,
                isset($data['end_date']) && $data['end_date'] && !$data['no_end_date'] ? $data['end_date'] : null,
                isset($data['notes']) ? $data['notes'] : null,
                isset($data['park_fee_included']) && $data['park_fee_included'] ? 1 : 0,
                isset($data['park_fee_adult']) && $data['park_fee_adult'] !== '' ? $data['park_fee_adult'] : null,
                isset($data['park_fee_child']) && $data['park_fee_child'] !== '' ? $data['park_fee_child'] : null,
                isset($data['map_url']) ? $data['map_url'] : null, // ✅ Add this line
                isset($data['updated_by']) ? $data['updated_by'] : 'Unknown',
                $id
            ));

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
