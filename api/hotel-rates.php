<?php
// api/hotel-rates.php
// CRUD for hotel net rates (table `hotel_rates`) plus the free-text rate
// conditions stored on `hotels` (rate_validity / child_policy / rate_terms).
//
//   GET  ?hotel_id=ID            -> { rates:[...], conditions:{...} }
//   POST  body { hotel_id, rates:[...], conditions:{...} }
//                                -> bulk replace all rates for the hotel (and,
//                                   if `conditions` is present, update them too)
//   PUT   body { id, ...fields } -> update a single rate row
//   DELETE ?id=ID  | ?hotel_id=ID-> delete one row, or all rows for a hotel
//
// A rate item: { room_type, period_label, period_start, period_end, meal_plan,
//                price, currency, sort_order, is_active }

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = 'localhost';
$dbname = 'sevensmile_contactrate';
$username = 'sevensmile_contactrate';
$password = 'contactrate2025';

function fail($code, $msg)
{
    http_response_code($code);
    echo json_encode(array('success' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

// Coerce/whitelist one incoming rate item into safe values.
function cleanRate($r)
{
    $emptyToNull = function ($v) {
        return ($v === '' || $v === null) ? null : $v;
    };
    return array(
        'room_type'    => trim((string) ($r['room_type'] ?? '')),
        'period_label' => $emptyToNull($r['period_label'] ?? null),
        'period_start' => $emptyToNull($r['period_start'] ?? null),
        'period_end'   => $emptyToNull($r['period_end'] ?? null),
        'meal_plan'    => $emptyToNull($r['meal_plan'] ?? null),
        'price'        => (float) ($r['price'] ?? 0),
        'currency'     => substr((string) ($r['currency'] ?? 'THB'), 0, 3) ?: 'THB',
        'sort_order'   => (int) ($r['sort_order'] ?? 0),
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
        $hotelId = isset($_GET['hotel_id']) ? (int) $_GET['hotel_id'] : 0;
        if ($hotelId < 1) fail(400, 'hotel_id is required');

        $stmt = $pdo->prepare(
            'SELECT id, hotel_id, room_type, period_label, period_start, period_end,
                    meal_plan, price, currency, sort_order, is_active
             FROM hotel_rates WHERE hotel_id = ?
             ORDER BY sort_order ASC, id ASC'
        );
        $stmt->execute(array($hotelId));
        $rates = $stmt->fetchAll();
        foreach ($rates as &$r) {
            $r['price'] = (float) $r['price'];
            $r['sort_order'] = (int) $r['sort_order'];
            $r['is_active'] = (int) $r['is_active'];
        }
        unset($r);

        $cstmt = $pdo->prepare('SELECT rate_validity, child_policy, rate_terms FROM hotels WHERE id = ?');
        $cstmt->execute(array($hotelId));
        $conditions = $cstmt->fetch() ?: array('rate_validity' => null, 'child_policy' => null, 'rate_terms' => null);

        echo json_encode(array('success' => true, 'data' => array(
            'rates' => $rates,
            'conditions' => $conditions,
        )), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) fail(400, 'Invalid JSON body');
        $hotelId = (int) ($body['hotel_id'] ?? 0);
        if ($hotelId < 1) fail(400, 'hotel_id is required');

        // hotel must exist
        $chk = $pdo->prepare('SELECT id FROM hotels WHERE id = ?');
        $chk->execute(array($hotelId));
        if (!$chk->fetch()) fail(404, 'Hotel not found');

        $rates = isset($body['rates']) && is_array($body['rates']) ? $body['rates'] : array();

        $pdo->beginTransaction();
        // Bulk replace: clear then insert.
        $del = $pdo->prepare('DELETE FROM hotel_rates WHERE hotel_id = ?');
        $del->execute(array($hotelId));

        $ins = $pdo->prepare(
            'INSERT INTO hotel_rates
               (hotel_id, room_type, period_label, period_start, period_end,
                meal_plan, price, currency, sort_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $count = 0;
        foreach ($rates as $idx => $raw) {
            // skip rows without a room type or a usable numeric price
            if (!isset($raw['price']) || $raw['price'] === '' || !is_numeric($raw['price'])) continue;
            $r = cleanRate($raw);
            if ($r['room_type'] === '') continue;
            if ($r['sort_order'] === 0) $r['sort_order'] = $idx;
            $ins->execute(array(
                $hotelId,
                $r['room_type'],
                $r['period_label'],
                $r['period_start'],
                $r['period_end'],
                $r['meal_plan'],
                $r['price'],
                $r['currency'],
                $r['sort_order'],
                $r['is_active'],
            ));
            $count++;
        }

        // Optional: update free-text conditions on the hotel row.
        if (isset($body['conditions']) && is_array($body['conditions'])) {
            $c = $body['conditions'];
            $norm = function ($v) {
                return ($v === '' || $v === null) ? null : (string) $v;
            };
            $upd = $pdo->prepare(
                'UPDATE hotels SET rate_validity = ?, child_policy = ?, rate_terms = ? WHERE id = ?'
            );
            $upd->execute(array(
                $norm($c['rate_validity'] ?? null),
                $norm($c['child_policy'] ?? null),
                $norm($c['rate_terms'] ?? null),
                $hotelId,
            ));
        }

        $pdo->commit();
        echo json_encode(array('success' => true, 'inserted' => $count), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) fail(400, 'Invalid JSON body');
        $id = (int) ($body['id'] ?? 0);
        if ($id < 1) fail(400, 'id is required');
        $r = cleanRate($body);
        if ($r['room_type'] === '') fail(400, 'room_type is required');

        $stmt = $pdo->prepare(
            'UPDATE hotel_rates SET room_type = ?, period_label = ?, period_start = ?,
                    period_end = ?, meal_plan = ?, price = ?, currency = ?,
                    sort_order = ?, is_active = ?
             WHERE id = ?'
        );
        $stmt->execute(array(
            $r['room_type'],
            $r['period_label'],
            $r['period_start'],
            $r['period_end'],
            $r['meal_plan'],
            $r['price'],
            $r['currency'],
            $r['sort_order'],
            $r['is_active'],
            $id,
        ));
        echo json_encode(array('success' => true, 'updated' => $stmt->rowCount()), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'DELETE') {
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('DELETE FROM hotel_rates WHERE id = ?');
            $stmt->execute(array((int) $_GET['id']));
            echo json_encode(array('success' => true, 'deleted' => $stmt->rowCount()));
            exit;
        }
        if (isset($_GET['hotel_id'])) {
            $stmt = $pdo->prepare('DELETE FROM hotel_rates WHERE hotel_id = ?');
            $stmt->execute(array((int) $_GET['hotel_id']));
            echo json_encode(array('success' => true, 'deleted' => $stmt->rowCount()));
            exit;
        }
        fail(400, 'id or hotel_id is required');
    }

    fail(405, 'Method not allowed');
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    fail(500, 'Database error: ' . $e->getMessage());
}
