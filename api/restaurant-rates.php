<?php
// api/restaurant-rates.php
// CRUD for restaurant net rates (table `restaurant_rates`) plus the free-text
// rate conditions stored on `restaurants` (rate_validity / rate_terms).
// Mirrors api/hotel-rates.php.
//
//   GET  ?restaurant_id=ID          -> { rates:[...], conditions:{...} }
//   POST  body { restaurant_id, rates:[...], conditions:{...} }
//                                   -> bulk replace all rates for the restaurant
//   PUT   body { id, ...fields }    -> update a single rate row
//   DELETE ?id=ID | ?restaurant_id=ID
//                                   -> delete one row, or all rows for a restaurant
//
// A rate item: { menu_name, period_label, period_start, period_end, price,
//                price_unit, min_pax, currency, note, sort_order, is_active }

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
require_once __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Net cost prices - staff only, on reads as well as writes.
authRequire();

$host = 'localhost';
$dbname = 'sevensmile_contactrate';
$username = 'sevensmile_contactrate';
$password = 'contactrate2025';

$PRICE_UNITS = array('per_person', 'per_set', 'per_table');

function fail($code, $msg)
{
    http_response_code($code);
    echo json_encode(array('success' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

// Coerce/whitelist one incoming rate item into safe values.
function cleanRate($r)
{
    global $PRICE_UNITS;
    $emptyToNull = function ($v) {
        return ($v === '' || $v === null) ? null : $v;
    };
    $unit = (string) (isset($r['price_unit']) ? $r['price_unit'] : 'per_person');
    if (!in_array($unit, $PRICE_UNITS)) {
        $unit = 'per_person';
    }
    $minPax = $emptyToNull(isset($r['min_pax']) ? $r['min_pax'] : null);
    return array(
        'menu_name'    => trim((string) (isset($r['menu_name']) ? $r['menu_name'] : '')),
        'period_label' => $emptyToNull(isset($r['period_label']) ? $r['period_label'] : null),
        'period_start' => $emptyToNull(isset($r['period_start']) ? $r['period_start'] : null),
        'period_end'   => $emptyToNull(isset($r['period_end']) ? $r['period_end'] : null),
        'price'        => (float) (isset($r['price']) ? $r['price'] : 0),
        'price_unit'   => $unit,
        'min_pax'      => $minPax === null ? null : (int) $minPax,
        'currency'     => substr((string) (isset($r['currency']) ? $r['currency'] : 'THB'), 0, 3) ?: 'THB',
        'note'         => $emptyToNull(isset($r['note']) ? $r['note'] : null),
        'sort_order'   => (int) (isset($r['sort_order']) ? $r['sort_order'] : 0),
        'is_active'    => isset($r['is_active']) ? (int) (!!$r['is_active']) : 1,
    );
}

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $restaurantId = isset($_GET['restaurant_id']) ? (int) $_GET['restaurant_id'] : 0;
        if ($restaurantId < 1) fail(400, 'restaurant_id is required');

        $stmt = $pdo->prepare(
            'SELECT id, restaurant_id, menu_name, period_label, period_start, period_end,
                    price, price_unit, min_pax, currency, note, sort_order, is_active
             FROM restaurant_rates WHERE restaurant_id = ?
             ORDER BY sort_order ASC, id ASC'
        );
        $stmt->execute(array($restaurantId));
        $rates = $stmt->fetchAll();
        foreach ($rates as &$r) {
            $r['price'] = (float) $r['price'];
            $r['min_pax'] = $r['min_pax'] !== null ? (int) $r['min_pax'] : null;
            $r['sort_order'] = (int) $r['sort_order'];
            $r['is_active'] = (int) $r['is_active'];
        }
        unset($r);

        $cstmt = $pdo->prepare('SELECT rate_validity, rate_terms FROM restaurants WHERE id = ?');
        $cstmt->execute(array($restaurantId));
        $conditions = $cstmt->fetch() ?: array('rate_validity' => null, 'rate_terms' => null);

        echo json_encode(array('success' => true, 'data' => array(
            'rates' => $rates,
            'conditions' => $conditions,
        )), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) fail(400, 'Invalid JSON body');
        $restaurantId = (int) (isset($body['restaurant_id']) ? $body['restaurant_id'] : 0);
        if ($restaurantId < 1) fail(400, 'restaurant_id is required');

        // restaurant must exist
        $chk = $pdo->prepare('SELECT id FROM restaurants WHERE id = ?');
        $chk->execute(array($restaurantId));
        if (!$chk->fetch()) fail(404, 'Restaurant not found');

        $rates = isset($body['rates']) && is_array($body['rates']) ? $body['rates'] : array();

        $pdo->beginTransaction();
        // Bulk replace: clear then insert.
        $del = $pdo->prepare('DELETE FROM restaurant_rates WHERE restaurant_id = ?');
        $del->execute(array($restaurantId));

        $ins = $pdo->prepare(
            'INSERT INTO restaurant_rates
               (restaurant_id, menu_name, period_label, period_start, period_end,
                price, price_unit, min_pax, currency, note, sort_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $count = 0;
        foreach ($rates as $idx => $raw) {
            // skip rows without a menu name or a usable numeric price
            if (!isset($raw['price']) || $raw['price'] === '' || !is_numeric($raw['price'])) continue;
            $r = cleanRate($raw);
            if ($r['menu_name'] === '') continue;
            if ($r['sort_order'] === 0) $r['sort_order'] = $idx;
            $ins->execute(array(
                $restaurantId,
                $r['menu_name'],
                $r['period_label'],
                $r['period_start'],
                $r['period_end'],
                $r['price'],
                $r['price_unit'],
                $r['min_pax'],
                $r['currency'],
                $r['note'],
                $r['sort_order'],
                $r['is_active'],
            ));
            $count++;
        }

        // Optional: update free-text conditions on the restaurant row.
        if (isset($body['conditions']) && is_array($body['conditions'])) {
            $c = $body['conditions'];
            $norm = function ($v) {
                return ($v === '' || $v === null) ? null : (string) $v;
            };
            $upd = $pdo->prepare(
                'UPDATE restaurants SET rate_validity = ?, rate_terms = ? WHERE id = ?'
            );
            $upd->execute(array(
                $norm(isset($c['rate_validity']) ? $c['rate_validity'] : null),
                $norm(isset($c['rate_terms']) ? $c['rate_terms'] : null),
                $restaurantId,
            ));
        }

        $pdo->commit();
        echo json_encode(array('success' => true, 'inserted' => $count), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) fail(400, 'Invalid JSON body');
        $id = (int) (isset($body['id']) ? $body['id'] : 0);
        if ($id < 1) fail(400, 'id is required');
        $r = cleanRate($body);
        if ($r['menu_name'] === '') fail(400, 'menu_name is required');

        $stmt = $pdo->prepare(
            'UPDATE restaurant_rates SET menu_name = ?, period_label = ?, period_start = ?,
                    period_end = ?, price = ?, price_unit = ?, min_pax = ?, currency = ?,
                    note = ?, sort_order = ?, is_active = ?
             WHERE id = ?'
        );
        $stmt->execute(array(
            $r['menu_name'],
            $r['period_label'],
            $r['period_start'],
            $r['period_end'],
            $r['price'],
            $r['price_unit'],
            $r['min_pax'],
            $r['currency'],
            $r['note'],
            $r['sort_order'],
            $r['is_active'],
            $id,
        ));
        echo json_encode(array('success' => true, 'updated' => $stmt->rowCount()), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'DELETE') {
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('DELETE FROM restaurant_rates WHERE id = ?');
            $stmt->execute(array((int) $_GET['id']));
            echo json_encode(array('success' => true, 'deleted' => $stmt->rowCount()));
            exit;
        }
        if (isset($_GET['restaurant_id'])) {
            $stmt = $pdo->prepare('DELETE FROM restaurant_rates WHERE restaurant_id = ?');
            $stmt->execute(array((int) $_GET['restaurant_id']));
            echo json_encode(array('success' => true, 'deleted' => $stmt->rowCount()));
            exit;
        }
        fail(400, 'id or restaurant_id is required');
    }

    fail(405, 'Method not allowed');
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    fail(500, 'Database error: ' . $e->getMessage());
}
