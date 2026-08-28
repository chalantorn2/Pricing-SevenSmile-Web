<?php
// api/transfers.php
// Read-only view of the transfer price matrix. Staff-only, same as hotels.php.
//
// GET                      -> everything the Transfers screen needs in one call:
//                             { locations, vehicles, routes, suppliers }
// GET ?resource=locations  -> locations only
// GET ?resource=vehicles   -> vehicles only
// GET ?resource=routes     -> routes only, each with its prices nested
// GET ?resource=suppliers  -> suppliers only, with a count of the routes each prices
//
// Routes are shared by every supplier; the price is what differs. A route's
// `prices` therefore names the supplier on every row, and ?supplier= narrows them
// to one rate sheet.
//
// Filters (applied to whichever resources they make sense for):
//   province  a route matches when EITHER end sits in that province, so a
//             Phuket-to-Krabi transfer is listed under both
//   category  route category (airport_transfer, city_tour, ...)
//   supplier  supplier id; keeps only that supplier's prices. Routes they do not
//             price still come back, with an empty `prices` — that is how an
//             unsold journey is offered to be filled in
//   active    1 / 0
//   search    matches route label, origin name or destination name

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

$host = 'localhost';
$dbname = 'sevensmile_contactrate';
$username = 'sevensmile_contactrate';
$password = 'contactrate2025';

function param($key)
{
    return (isset($_GET[$key]) && $_GET[$key] !== '') ? $_GET[$key] : null;
}

function fetchLocations($pdo, $filters = array())
{
    $where = array();
    $params = array();
    if (isset($filters['province'])) {
        $where[] = 'province = ?';
        $params[] = $filters['province'];
    }
    if (isset($filters['active'])) {
        $where[] = 'is_active = ?';
        $params[] = (int) (!!$filters['active']);
    }
    $sql = 'SELECT * FROM transfer_locations';
    if (count($where) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY sort_order ASC, name ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int) $r['id'];
        $r['is_active'] = (int) $r['is_active'];
        $r['sort_order'] = (int) $r['sort_order'];
    }
    return $rows;
}

function fetchVehicles($pdo, $filters = array())
{
    $sql = 'SELECT * FROM transfer_vehicles';
    $params = array();
    if (isset($filters['active'])) {
        $sql .= ' WHERE is_active = ?';
        $params[] = (int) (!!$filters['active']);
    }
    $sql .= ' ORDER BY sort_order ASC, name ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int) $r['id'];
        $r['max_passengers'] = (int) $r['max_passengers'];
        $r['max_luggage'] = (int) $r['max_luggage'];
        $r['is_active'] = (int) $r['is_active'];
        $r['sort_order'] = (int) $r['sort_order'];
    }
    return $rows;
}

// Transfer companies are not the same companies as the tour vendors, so only
// suppliers of type 'transfer' can hold a rate sheet here. The route count says
// how much of one each has — enough for the screen to pick a sensible supplier to
// open on without a second round trip.
function fetchSuppliers($pdo)
{
    $stmt = $pdo->query(
        "SELECT s.id, s.name, COUNT(DISTINCT p.route_id) AS priced_routes
         FROM suppliers s
         LEFT JOIN transfer_route_prices p ON p.supplier_id = s.id
         WHERE s.type = 'transfer'
         GROUP BY s.id, s.name
         ORDER BY priced_routes DESC, s.name ASC"
    );
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id'] = (int) $r['id'];
        $r['priced_routes'] = (int) $r['priced_routes'];
    }
    return $rows;
}

// Routes come back joined to both location names, with the price rows attached as
// `prices`. One extra query for all prices beats one query per route.
function fetchRoutes($pdo, $filters = array())
{
    $where = array();
    $params = array();

    if (isset($filters['province'])) {
        $where[] = '(o.province = ? OR d.province = ?)';
        $params[] = $filters['province'];
        $params[] = $filters['province'];
    }
    if (isset($filters['category'])) {
        $where[] = 'r.category = ?';
        $params[] = $filters['category'];
    }
    if (isset($filters['active'])) {
        $where[] = 'r.is_active = ?';
        $params[] = (int) (!!$filters['active']);
    }
    if (isset($filters['search'])) {
        $where[] = '(r.label LIKE ? OR o.name LIKE ? OR d.name LIKE ?)';
        $params[] = '%' . $filters['search'] . '%';
        $params[] = '%' . $filters['search'] . '%';
        $params[] = '%' . $filters['search'] . '%';
    }

    $sql = 'SELECT r.*,
                   o.name AS origin_name, o.province AS origin_province,
                   d.name AS destination_name, d.province AS destination_province
            FROM transfer_routes r
            JOIN transfer_locations o ON o.id = r.origin_id
            JOIN transfer_locations d ON d.id = r.destination_id';
    if (count($where) > 0) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY r.sort_order ASC, r.id ASC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $routes = $stmt->fetchAll();
    if (count($routes) === 0) {
        return array();
    }

    $ids = array();
    foreach ($routes as $r) {
        $ids[] = (int) $r['id'];
    }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $priceSql = 'SELECT p.route_id, p.supplier_id, p.vehicle_id, p.price, p.currency,
                        s.name AS supplier_name,
                        v.name AS vehicle_name, v.max_passengers
                 FROM transfer_route_prices p
                 JOIN transfer_vehicles v ON v.id = p.vehicle_id
                 JOIN suppliers s ON s.id = p.supplier_id
                 WHERE p.route_id IN (' . $placeholders . ')';
    $priceParams = $ids;
    if (isset($filters['supplier'])) {
        $priceSql .= ' AND p.supplier_id = ?';
        $priceParams[] = (int) $filters['supplier'];
    }
    $priceSql .= ' ORDER BY s.name ASC, v.sort_order ASC, v.id ASC';

    $priceStmt = $pdo->prepare($priceSql);
    $priceStmt->execute($priceParams);

    $byRoute = array();
    foreach ($priceStmt->fetchAll() as $p) {
        $rid = (int) $p['route_id'];
        if (!isset($byRoute[$rid])) {
            $byRoute[$rid] = array();
        }
        $byRoute[$rid][] = array(
            'supplier_id' => (int) $p['supplier_id'],
            'supplier_name' => $p['supplier_name'],
            'vehicle_id' => (int) $p['vehicle_id'],
            'vehicle_name' => $p['vehicle_name'],
            'max_passengers' => (int) $p['max_passengers'],
            'price' => (float) $p['price'],
            'currency' => $p['currency'],
        );
    }

    foreach ($routes as &$r) {
        $r['id'] = (int) $r['id'];
        $r['origin_id'] = (int) $r['origin_id'];
        $r['destination_id'] = (int) $r['destination_id'];
        $r['sort_order'] = (int) $r['sort_order'];
        $r['is_active'] = (int) $r['is_active'];
        $r['prices'] = isset($byRoute[$r['id']]) ? $byRoute[$r['id']] : array();
    }
    return $routes;
}

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    $filters = array();
    foreach (array('province', 'category', 'supplier', 'active', 'search') as $key) {
        $value = param($key);
        if ($value !== null) {
            $filters[$key] = $value;
        }
    }

    $resource = param('resource');

    if ($resource === 'locations') {
        $data = fetchLocations($pdo, $filters);
    } elseif ($resource === 'vehicles') {
        $data = fetchVehicles($pdo, $filters);
    } elseif ($resource === 'routes') {
        $data = fetchRoutes($pdo, $filters);
    } elseif ($resource === 'suppliers') {
        $data = fetchSuppliers($pdo);
    } elseif ($resource === null) {
        // The Transfers screen shows three tabs off one payload. Locations,
        // vehicles and suppliers come back unfiltered: the route form needs the
        // full master lists even when the page itself is narrowed to one province
        // or one supplier's rate sheet.
        $data = array(
            'locations' => fetchLocations($pdo),
            'vehicles' => fetchVehicles($pdo),
            'suppliers' => fetchSuppliers($pdo),
            'routes' => fetchRoutes($pdo, $filters),
        );
    } else {
        http_response_code(400);
        echo json_encode(array('success' => false, 'error' => 'Unknown resource: ' . $resource), JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode(array(
        'success' => true,
        'data' => $data,
        'timestamp' => date('c'),
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch transfers'));
}
