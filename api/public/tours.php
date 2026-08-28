<?php
// api/public/tours.php - Read-only public API: tours + full supplier contact info.
//
// GET                        -> every tour (no pagination unless `limit` is passed,
//                               so an existing consumer keeps getting the full list)
// GET ?id=19                 -> one tour
// GET ?supplier_id=7         -> one supplier's tours
// GET ?since=2026-08-01      -> only tours changed on/after that date (incremental sync)
//
// Other filters: search, destination, departure_from, tour_type, duration_type,
// vessel_type, active, frequent, limit, page.
//
// NOTE ON NET RATES: `adult_price`, `child_price`, `infant_price` and
// `single_supplement` are our NET (cost) prices from the supplier, not selling
// prices. A consumer may store them, but must never render them on a
// customer-facing page - add your own markup first.

require __DIR__ . '/_config.php';
publicApiInit($VALID_API_KEY);

// Columns sent for each tour. Listed explicitly so a future internal column cannot
// leak by accident - `updated_by` holds a staff username and stays out.
$TOUR_COLUMNS = "
              t.id,
              t.supplier_id,
              t.tour_name,
              t.departure_from,
              t.destination,
              t.pier,
              t.tour_type,
              t.adult_price,
              t.child_price,
              t.start_date,
              t.end_date,
              t.notes,
              t.park_fee_included,
              t.park_fee_adult,
              t.park_fee_child,
              t.map_url,
              t.duration_type,
              t.duration_hours,
              t.start_time,
              t.end_time,
              t.time_note,
              t.price_mode,
              t.child_age_min,
              t.child_age_max,
              t.infant_price,
              t.infant_age_max,
              t.single_supplement,
              t.min_pax,
              t.max_pax,
              t.meals_included,
              t.meal_style,
              t.meal_venue,
              t.halal_available,
              t.vegetarian_available,
              t.meal_note,
              t.vessel_type,
              t.vessel_name,
              t.vessel_capacity,
              t.vessel_detail,
              t.guide_included,
              t.guide_languages,
              t.transfer_included,
              t.transfer_type,
              t.pickup_time_from,
              t.pickup_time_to,
              t.meeting_point,
              t.operating_days,
              t.booking_lead_hours,
              t.is_active,
              t.last_verified_at,
              t.is_frequent,
              t.created_at,
              t.updated_at,
              sa.name AS supplier_name,
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
              sa.email";

// The three list columns are stored as JSON text. Hand them over as real arrays so a
// consumer never has to parse JSON inside JSON. We never store an empty array, so
// `[]` in the response means the field was simply never filled in.
function shapeTour($row)
{
    foreach (array('meals_included', 'guide_languages', 'operating_days') as $col) {
        $decoded = !empty($row[$col]) ? json_decode($row[$col], true) : array();
        $row[$col] = is_array($decoded) ? $decoded : array();
    }
    return $row;
}

try {
    $pdo = publicApiDB($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
    $pdo->exec("SET NAMES utf8mb4");

    $sql = "SELECT $TOUR_COLUMNS
            FROM tours t
            LEFT JOIN suppliers sa ON t.supplier_id = sa.id";

    $where = array();
    $params = array();

    if (isset($_GET['supplier_id']) && $_GET['supplier_id'] !== '') {
        $where[] = "t.supplier_id = ?";
        $params[] = $_GET['supplier_id'];
    }
    if (isset($_GET['search']) && $_GET['search'] !== '') {
        $where[] = "(t.tour_name LIKE ? OR sa.name LIKE ? OR t.vessel_name LIKE ?)";
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
    }
    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $where[] = "t.id = ?";
        $params[] = $_GET['id'];
    }
    if (isset($_GET['destination']) && $_GET['destination'] !== '') {
        $where[] = "t.destination = ?";
        $params[] = $_GET['destination'];
    }
    if (isset($_GET['departure_from']) && $_GET['departure_from'] !== '') {
        $where[] = "t.departure_from LIKE ?";
        $params[] = '%' . $_GET['departure_from'] . '%';
    }
    // The columns that make a tour filterable at all: what kind of trip it is, how
    // long it runs, and what it sails on.
    foreach (array('tour_type', 'duration_type', 'vessel_type', 'price_mode') as $column) {
        if (isset($_GET[$column]) && $_GET[$column] !== '') {
            $where[] = "t.$column = ?";
            $params[] = $_GET[$column];
        }
    }
    // Omit `active` to get both, so a consumer can mirror inactive tours rather than
    // silently losing them - same rule as hotels.php.
    if (isset($_GET['active']) && $_GET['active'] !== '') {
        $where[] = "t.is_active = ?";
        $params[] = (int) (!!$_GET['active']);
    }
    if (isset($_GET['frequent']) && $_GET['frequent'] !== '') {
        $where[] = "t.is_frequent = ?";
        $params[] = (int) (!!$_GET['frequent']);
    }
    // Incremental sync: only what changed since a timestamp.
    if (isset($_GET['since']) && $_GET['since'] !== '') {
        $where[] = "t.updated_at >= ?";
        $params[] = $_GET['since'];
    }

    if (count($where) > 0) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }
    // Pinned tours first, then most recently updated.
    $sql .= " ORDER BY t.is_frequent DESC, t.frequent_order ASC, t.updated_at DESC";

    // Pagination is opt-in: without `limit` the endpoint returns everything, the way
    // it always has.
    $paginated = isset($_GET['limit']) && $_GET['limit'] !== '';
    $limit = 0;
    $page = 1;
    $total = null;
    if ($paginated) {
        $limit = (int) $_GET['limit'];
        if ($limit < 1) $limit = 1;
        if ($limit > 500) $limit = 500;
        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        if ($page < 1) $page = 1;

        $countSql = "SELECT COUNT(*) FROM tours t LEFT JOIN suppliers sa ON t.supplier_id = sa.id";
        if (count($where) > 0) {
            $countSql .= " WHERE " . implode(' AND ', $where);
        }
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $sql .= " LIMIT $limit OFFSET " . (($page - 1) * $limit);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $tours = array();
    foreach ($stmt->fetchAll() as $row) {
        $tours[] = shapeTour($row);
    }

    $response = array(
        'success' => true,
        'data' => $tours,
        'count' => count($tours),
    );
    if ($paginated) {
        $response['pagination'] = array(
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => $total,
            'total_pages' => (int) ceil($total / $limit),
        );
    }
    $response['timestamp'] = date('c');

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch tours'));
}
