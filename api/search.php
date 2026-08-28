<?php
// api/search.php - One search box for everything on the home screen.
//
// GET ?q=keyword   ->  { success: true, data: { q, groups: { tours, hotels,
//                          restaurants, suppliers, transfers } } }
//
// Each group is { items: [{ id, name, sub }], total } — six rows are enough for
// the dropdown panel; `total` tells the UI whether to offer "see all", which
// simply opens the module list with the same keyword seeded (?q=).
//
// Matching is a plain LIKE on the fields staff actually type: names, provinces,
// hotel/restaurant cuisine, tour departure points, and the transfer route label
// plus both end-point names.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
require_once __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'error' => 'Method not allowed. This endpoint is read-only.'));
    exit;
}

authRequire();

const SEARCH_LIMIT = 6;

/**
 * Run one grouped search. $sql selects id, name, sub for every match; the tables
 * here hold hundreds of rows at most, so fetching all matches and slicing in PHP
 * is cheaper than a second COUNT query per group.
 */
function searchGroup($pdo, $sql, $params)
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $items = array();
    foreach (array_slice($rows, 0, SEARCH_LIMIT) as $row) {
        $items[] = array(
            'id' => (string) $row['id'],
            'name' => $row['name'],
            'sub' => $row['sub'],
        );
    }

    return array('items' => $items, 'total' => count($rows));
}

try {
    $pdo = authDB();

    $q = isset($_GET['q']) ? trim($_GET['q']) : '';
    // Character count without depending on the mbstring extension
    $charCount = preg_match_all('/./u', $q, $m);
    if ($charCount === false) {
        $charCount = strlen($q);
    }
    if ($charCount < 2) {
        echo json_encode(
            array('success' => true, 'data' => array('q' => $q, 'groups' => new stdClass())),
            JSON_UNESCAPED_UNICODE
        );
        exit;
    }
    $like = '%' . $q . '%';

    $groups = array();

    // Tours — name, either province field
    $groups['tours'] = searchGroup(
        $pdo,
        "SELECT id, tour_name AS name,
                TRIM(BOTH ', ' FROM CONCAT_WS(', ', NULLIF(destination, ''), NULLIF(departure_from, ''))) AS sub
         FROM tours
         WHERE tour_name LIKE ? OR destination LIKE ? OR departure_from LIKE ?
         ORDER BY tour_name",
        array($like, $like, $like)
    );

    // Hotels — active ones only, matching the list screen
    $groups['hotels'] = searchGroup(
        $pdo,
        "SELECT slug AS id, name, NULLIF(destination, '') AS sub
         FROM hotels
         WHERE is_active = 1 AND (name LIKE ? OR destination LIKE ?)
         ORDER BY name",
        array($like, $like)
    );

    // Restaurants — cuisine in the subtitle when set
    $groups['restaurants'] = searchGroup(
        $pdo,
        "SELECT slug AS id, name, NULLIF(CONCAT_WS(' · ', NULLIF(destination, ''), NULLIF(cuisine, '')), '') AS sub
         FROM restaurants
         WHERE is_active = 1 AND (name LIKE ? OR destination LIKE ? OR cuisine LIKE ?)
         ORDER BY name",
        array($like, $like, $like)
    );

    // Suppliers
    $groups['suppliers'] = searchGroup(
        $pdo,
        "SELECT id, name, NULLIF(type, '') AS sub
         FROM suppliers
         WHERE name LIKE ?
         ORDER BY name",
        array($like)
    );

    // Transfer routes — a route has no detail page, so id carries nothing;
    // the UI links the group header to /transfer?q= instead of per row.
    $groups['transfers'] = searchGroup(
        $pdo,
        "SELECT r.id,
                COALESCE(NULLIF(r.label, ''), CONCAT(o.name, ' → ', d.name)) AS name,
                CONCAT(o.province, ' → ', d.province) AS sub
         FROM transfer_routes r
         JOIN transfer_locations o ON o.id = r.origin_id
         JOIN transfer_locations d ON d.id = r.destination_id
         WHERE r.is_active = 1
           AND (r.label LIKE ? OR o.name LIKE ? OR d.name LIKE ? OR o.province LIKE ? OR d.province LIKE ?)
         ORDER BY r.sort_order, r.id",
        array($like, $like, $like, $like, $like)
    );

    echo json_encode(
        array('success' => true, 'data' => array('q' => $q, 'groups' => $groups)),
        JSON_UNESCAPED_UNICODE
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(
        array('success' => false, 'error' => 'Search failed'),
        JSON_UNESCAPED_UNICODE
    );
}
