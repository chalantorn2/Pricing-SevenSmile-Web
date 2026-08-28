<?php
// api/transfer-manage.php
// Create / update / delete the three transfer resources. Mirrors the shape of
// api/restaurant-manage.php, but takes a ?resource= selector because transfers
// are three small tables rather than one big one.
//
// POST   ?resource=locations|vehicles|routes         -> create   (JSON body)
// PUT    ?resource=locations|vehicles|routes&id=123  -> update   (JSON body)
// DELETE ?resource=locations|vehicles|routes&id=123  -> delete
//
// A route carries a price set for ONE supplier: `supplier_id` plus
// `prices`: [{ vehicle_id, price }]. Routes themselves are shared — every supplier
// drives the same journeys — so saving replaces only that supplier's prices on the
// route and leaves the other rate sheets alone. The form always sends the full set
// for its supplier, so blank cells simply disappear.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS');
require_once __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

authRequire();

$host = 'localhost';
$dbname = 'sevensmile_contactrate';
$username = 'sevensmile_contactrate';
$password = 'contactrate2025';

$TABLES = array(
    'locations' => 'transfer_locations',
    'vehicles' => 'transfer_vehicles',
    'routes' => 'transfer_routes',
);

function fail($code, $message)
{
    http_response_code($code);
    echo json_encode(array('success' => false, 'error' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

function body()
{
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);
    return is_array($json) ? $json : array();
}

function str_field($b, $key, $default = null)
{
    return (isset($b[$key]) && trim((string) $b[$key]) !== '') ? trim((string) $b[$key]) : $default;
}

// Reject a duplicate name up front so the caller gets a readable message instead
// of a raw unique-key violation.
function requireUniqueName($pdo, $table, $name, $exceptId = null)
{
    $stmt = $pdo->prepare("SELECT id FROM $table WHERE name = ? AND (? IS NULL OR id <> ?) LIMIT 1");
    $stmt->execute(array($name, $exceptId, $exceptId));
    if ($stmt->fetchColumn()) {
        fail(409, 'Another entry already uses the name "' . $name . '"');
    }
}

function locationFields($b)
{
    $name = str_field($b, 'name');
    if ($name === null) {
        fail(400, 'Location name is required');
    }
    return array(
        ':name' => $name,
        ':province' => str_field($b, 'province', 'Phuket'),
        ':is_active' => (isset($b['is_active']) && !$b['is_active']) ? 0 : 1,
        ':sort_order' => isset($b['sort_order']) ? (int) $b['sort_order'] : 0,
    );
}

function vehicleFields($b)
{
    $name = str_field($b, 'name');
    if ($name === null) {
        fail(400, 'Vehicle name is required');
    }
    return array(
        ':name' => $name,
        ':max_passengers' => isset($b['max_passengers']) ? max(1, (int) $b['max_passengers']) : 1,
        ':max_luggage' => isset($b['max_luggage']) ? max(0, (int) $b['max_luggage']) : 0,
        ':image_url' => str_field($b, 'image_url'),
        ':description' => str_field($b, 'description'),
        ':is_active' => (isset($b['is_active']) && !$b['is_active']) ? 0 : 1,
        ':sort_order' => isset($b['sort_order']) ? (int) $b['sort_order'] : 0,
    );
}

function routeFields($b)
{
    $origin = isset($b['origin_id']) ? (int) $b['origin_id'] : 0;
    $destination = isset($b['destination_id']) ? (int) $b['destination_id'] : 0;
    if ($origin <= 0 || $destination <= 0) {
        fail(400, 'Both an origin and a destination are required');
    }
    if ($origin === $destination) {
        fail(400, 'Origin and destination must be different locations');
    }
    return array(
        ':origin_id' => $origin,
        ':destination_id' => $destination,
        ':category' => str_field($b, 'category', 'transfer'),
        ':label' => str_field($b, 'label'),
        // '' rather than NULL: `note` is part of uniq_pair, and MariaDB counts
        // every NULL as distinct, which would let the same journey in twice.
        ':note' => str_field($b, 'note', ''),
        ':is_active' => (isset($b['is_active']) && !$b['is_active']) ? 0 : 1,
        ':sort_order' => isset($b['sort_order']) ? (int) $b['sort_order'] : 0,
    );
}

// The supplier whose rate sheet a price set belongs to. Required whenever prices
// are sent: a price with nobody behind it is not a rate, and guessing one would
// quietly overwrite somebody else's.
function priceSupplierId($pdo, $b)
{
    $supplierId = isset($b['supplier_id']) ? (int) $b['supplier_id'] : 0;
    if ($supplierId <= 0) {
        fail(400, 'A supplier is required to save transfer prices');
    }
    $stmt = $pdo->prepare('SELECT id FROM suppliers WHERE id = ? LIMIT 1');
    $stmt->execute(array($supplierId));
    if (!$stmt->fetchColumn()) {
        fail(404, 'That supplier does not exist');
    }
    return $supplierId;
}

// Replace one supplier's price rows on a route; every other supplier's prices for
// the same route are untouched. Blank / zero / non-numeric entries are dropped
// rather than stored as 0, which would read as "free" in the UI.
function replaceRoutePrices($pdo, $routeId, $supplierId, $prices)
{
    $pdo->prepare('DELETE FROM transfer_route_prices WHERE route_id = ? AND supplier_id = ?')
        ->execute(array($routeId, $supplierId));
    if (!is_array($prices) || count($prices) === 0) {
        return;
    }
    $stmt = $pdo->prepare(
        'INSERT INTO transfer_route_prices (route_id, supplier_id, vehicle_id, price, currency)
         VALUES (?, ?, ?, ?, ?)'
    );
    $seen = array();
    foreach ($prices as $p) {
        if (!isset($p['vehicle_id'])) {
            continue;
        }
        $vehicleId = (int) $p['vehicle_id'];
        $price = isset($p['price']) ? (float) $p['price'] : 0;
        if ($vehicleId <= 0 || $price <= 0 || isset($seen[$vehicleId])) {
            continue;
        }
        $seen[$vehicleId] = true;
        $currency = isset($p['currency']) && $p['currency'] !== '' ? substr($p['currency'], 0, 3) : 'THB';
        $stmt->execute(array($routeId, $supplierId, $vehicleId, $price, $currency));
    }
}

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    $resource = isset($_GET['resource']) ? $_GET['resource'] : '';
    if (!isset($TABLES[$resource])) {
        fail(400, 'Unknown resource. Use ?resource=locations, vehicles or routes');
    }
    $table = $TABLES[$resource];

    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    // --- CREATE ---
    if ($method === 'POST') {
        $b = body();

        // Checked before the route is written so a bad supplier cannot leave a
        // route behind with no rates on it.
        $priceSupplier = ($resource === 'routes' && array_key_exists('prices', $b))
            ? priceSupplierId($pdo, $b)
            : null;

        if ($resource === 'locations') {
            $fields = locationFields($b);
            requireUniqueName($pdo, $table, $fields[':name']);
            $sql = 'INSERT INTO transfer_locations (name, province, is_active, sort_order)
                    VALUES (:name, :province, :is_active, :sort_order)';
        } elseif ($resource === 'vehicles') {
            $fields = vehicleFields($b);
            requireUniqueName($pdo, $table, $fields[':name']);
            $sql = 'INSERT INTO transfer_vehicles
                        (name, max_passengers, max_luggage, image_url, description, is_active, sort_order)
                    VALUES
                        (:name, :max_passengers, :max_luggage, :image_url, :description, :is_active, :sort_order)';
        } else {
            $fields = routeFields($b);
            $sql = 'INSERT INTO transfer_routes
                        (origin_id, destination_id, category, label, note, is_active, sort_order)
                    VALUES
                        (:origin_id, :destination_id, :category, :label, :note, :is_active, :sort_order)';
        }

        try {
            $pdo->prepare($sql)->execute($fields);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                fail(409, $resource === 'routes'
                    ? 'That origin, destination and category combination already exists'
                    : 'That name is already taken');
            }
            throw $e;
        }
        $newId = (int) $pdo->lastInsertId();

        if ($priceSupplier !== null) {
            replaceRoutePrices($pdo, $newId, $priceSupplier, $b['prices']);
        }

        echo json_encode(array('success' => true, 'data' => array('id' => $newId)), JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Everything below needs an existing row.
    if ($id <= 0) {
        fail(400, 'Missing id');
    }
    $check = $pdo->prepare("SELECT id FROM $table WHERE id = ? LIMIT 1");
    $check->execute(array($id));
    if (!$check->fetch()) {
        fail(404, 'Not found');
    }

    // --- UPDATE ---
    if ($method === 'PUT') {
        $b = body();

        $priceSupplier = ($resource === 'routes' && array_key_exists('prices', $b))
            ? priceSupplierId($pdo, $b)
            : null;

        if ($resource === 'locations') {
            $fields = locationFields($b);
            requireUniqueName($pdo, $table, $fields[':name'], $id);
            $sql = 'UPDATE transfer_locations SET
                        name = :name, province = :province,
                        is_active = :is_active, sort_order = :sort_order
                    WHERE id = :id';
        } elseif ($resource === 'vehicles') {
            $fields = vehicleFields($b);
            requireUniqueName($pdo, $table, $fields[':name'], $id);
            $sql = 'UPDATE transfer_vehicles SET
                        name = :name, max_passengers = :max_passengers, max_luggage = :max_luggage,
                        image_url = :image_url, description = :description,
                        is_active = :is_active, sort_order = :sort_order
                    WHERE id = :id';
        } else {
            $fields = routeFields($b);
            $sql = 'UPDATE transfer_routes SET
                        origin_id = :origin_id, destination_id = :destination_id,
                        category = :category, label = :label, note = :note,
                        is_active = :is_active, sort_order = :sort_order
                    WHERE id = :id';
        }
        $fields[':id'] = $id;

        try {
            $pdo->prepare($sql)->execute($fields);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                fail(409, $resource === 'routes'
                    ? 'That origin, destination and category combination already exists'
                    : 'That name is already taken');
            }
            throw $e;
        }

        if ($priceSupplier !== null) {
            replaceRoutePrices($pdo, $id, $priceSupplier, $b['prices']);
        }

        echo json_encode(array('success' => true, 'data' => array('id' => $id)), JSON_UNESCAPED_UNICODE);
        exit;
    }

    // --- DELETE ---
    // Prices and dependent routes go with the row through the foreign keys, so
    // deleting a location really does remove every route that touched it.
    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM $table WHERE id = ?")->execute(array($id));
        echo json_encode(array('success' => true, 'data' => array('id' => $id)));
        exit;
    }

    fail(405, 'Method not allowed');
} catch (PDOException $e) {
    fail(500, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    fail(500, 'Failed: ' . $e->getMessage());
}
