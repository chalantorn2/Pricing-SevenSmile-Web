<?php
// api/stats.php - Counts and province lists for the home screen and the sidebar.
//
// The landing page needs one number per module plus the distinct provinces each
// module covers. Pulling full tables for that (the sidebar used to load every tour
// just to list destinations) is wasteful, so everything is answered here with
// COUNT/DISTINCT in one call:
//
//   { success: true, data: {
//       counts:    { tours, expiredTours, hotels, restaurants,
//                    transferRoutes, suppliers, packages },
//       provinces: { tours: [...], hotels: [...], restaurants: [...],
//                    transfers: [...] }
//   } }
//
// Hotels/restaurants/transfer routes are narrowed to is_active = 1; tours and
// suppliers keep their plain totals so the numbers match the list screens.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
require_once __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

authRequire();

/** Distinct non-empty values of $column in $table, alphabetically sorted. */
function statsProvinces($pdo, $table, $column)
{
    $stmt = $pdo->query(
        "SELECT DISTINCT `$column` FROM `$table`
          WHERE `$column` IS NOT NULL AND TRIM(`$column`) <> ''
          ORDER BY `$column`"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
    return array_values(array_map('strval', $rows));
}

try {
    $pdo = authDB();
    $counts = array();
    $provinces = array();

    $counts['tours'] = (int) $pdo->query('SELECT COUNT(*) FROM tours')->fetchColumn();

    // Match TourList.jsx, where a tour is expired once its end_date has started:
    // end_date sorts to midnight, so "today" is already past — hence < tomorrow.
    $counts['expiredTours'] = (int) $pdo->query(
        "SELECT COUNT(*) FROM tours
          WHERE end_date IS NOT NULL AND end_date <> '0000-00-00'
            AND end_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)"
    )->fetchColumn();
    $provinces['tours'] = statsProvinces($pdo, 'tours', 'destination');

    $counts['hotels'] = (int) $pdo->query(
        'SELECT COUNT(*) FROM hotels WHERE is_active = 1'
    )->fetchColumn();
    $provinces['hotels'] = statsProvinces($pdo, 'hotels', 'destination');

    $counts['restaurants'] = (int) $pdo->query(
        'SELECT COUNT(*) FROM restaurants WHERE is_active = 1'
    )->fetchColumn();
    $provinces['restaurants'] = statsProvinces($pdo, 'restaurants', 'destination');

    $counts['transferRoutes'] = (int) $pdo->query(
        'SELECT COUNT(*) FROM transfer_routes WHERE is_active = 1'
    )->fetchColumn();
    // A transfer route spans two provinces, so the province list is the pickup /
    // dropoff master list rather than a filter value.
    $provinces['transfers'] = statsProvinces($pdo, 'transfer_locations', 'province');

    $counts['suppliers'] = (int) $pdo->query('SELECT COUNT(*) FROM suppliers')->fetchColumn();
    $counts['packages'] = (int) $pdo->query('SELECT COUNT(*) FROM package_tours')->fetchColumn();

    echo json_encode(
        array(
            'success' => true,
            'data' => array('counts' => $counts, 'provinces' => $provinces),
        ),
        JSON_UNESCAPED_UNICODE
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(
        array('success' => false, 'error' => 'Failed to load stats'),
        JSON_UNESCAPED_UNICODE
    );
}
