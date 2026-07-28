<?php
// api/hotel-notices.php
// CRUD for hotel Stop Sale / Promotion notices (date-range overlays).
//   GET    ?hotel_id=1              -> all notices for a hotel
//   POST   {hotel_id, ...notice}    -> create one, returns new id
//   PUT    {id, ...notice}          -> update one
//   DELETE ?id=5                    -> delete one

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

function fail($code, $msg)
{
    http_response_code($code);
    echo json_encode(array('success' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

// Coerce/whitelist one incoming notice into safe values.
function cleanNotice($n)
{
    $emptyToNull = function ($v) {
        return ($v === '' || $v === null) ? null : $v;
    };
    $type = ($n['type'] ?? '') === 'promotion' ? 'promotion' : 'stop_sale';
    $promo = $n['promo_price'] ?? null;
    return array(
        'type'        => $type,
        'room_type'   => $emptyToNull($n['room_type'] ?? null),
        'date_start'  => $emptyToNull($n['date_start'] ?? null),
        'date_end'    => $emptyToNull($n['date_end'] ?? null),
        'title'       => $emptyToNull($n['title'] ?? null),
        'detail'      => $emptyToNull($n['detail'] ?? null),
        // promo price only meaningful for promotions
        'promo_price' => ($type === 'promotion' && $promo !== '' && $promo !== null && is_numeric($promo))
            ? (float) $promo : null,
        'currency'    => substr((string) ($n['currency'] ?? 'THB'), 0, 3) ?: 'THB',
        'is_active'   => isset($n['is_active']) ? (int) (!!$n['is_active']) : 1,
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
            'SELECT id, hotel_id, type, room_type, date_start, date_end,
                    title, detail, promo_price, currency, is_active
             FROM hotel_notices WHERE hotel_id = ?
             ORDER BY date_start ASC, id ASC'
        );
        $stmt->execute(array($hotelId));
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['promo_price'] = $r['promo_price'] !== null ? (float) $r['promo_price'] : null;
            $r['is_active'] = (int) $r['is_active'];
        }
        unset($r);

        echo json_encode(array('success' => true, 'data' => $rows), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) fail(400, 'Invalid JSON body');
        $hotelId = (int) ($body['hotel_id'] ?? 0);
        if ($hotelId < 1) fail(400, 'hotel_id is required');

        $chk = $pdo->prepare('SELECT id FROM hotels WHERE id = ?');
        $chk->execute(array($hotelId));
        if (!$chk->fetch()) fail(404, 'Hotel not found');

        $n = cleanNotice($body);
        if (!$n['date_start'] || !$n['date_end']) fail(400, 'date_start and date_end are required');
        if ($n['date_end'] < $n['date_start']) fail(400, 'date_end must be on or after date_start');

        $ins = $pdo->prepare(
            'INSERT INTO hotel_notices
               (hotel_id, type, room_type, date_start, date_end, title, detail,
                promo_price, currency, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $ins->execute(array(
            $hotelId, $n['type'], $n['room_type'], $n['date_start'], $n['date_end'],
            $n['title'], $n['detail'], $n['promo_price'], $n['currency'], $n['is_active'],
        ));
        echo json_encode(array('success' => true, 'id' => (int) $pdo->lastInsertId()), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'PUT') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) fail(400, 'Invalid JSON body');
        $id = (int) ($body['id'] ?? 0);
        if ($id < 1) fail(400, 'id is required');
        $n = cleanNotice($body);
        if (!$n['date_start'] || !$n['date_end']) fail(400, 'date_start and date_end are required');
        if ($n['date_end'] < $n['date_start']) fail(400, 'date_end must be on or after date_start');

        $stmt = $pdo->prepare(
            'UPDATE hotel_notices SET type = ?, room_type = ?, date_start = ?, date_end = ?,
                    title = ?, detail = ?, promo_price = ?, currency = ?, is_active = ?
             WHERE id = ?'
        );
        $stmt->execute(array(
            $n['type'], $n['room_type'], $n['date_start'], $n['date_end'],
            $n['title'], $n['detail'], $n['promo_price'], $n['currency'], $n['is_active'], $id,
        ));
        echo json_encode(array('success' => true, 'updated' => $stmt->rowCount()), JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($method === 'DELETE') {
        if (!isset($_GET['id'])) fail(400, 'id is required');
        $stmt = $pdo->prepare('DELETE FROM hotel_notices WHERE id = ?');
        $stmt->execute(array((int) $_GET['id']));
        echo json_encode(array('success' => true, 'deleted' => $stmt->rowCount()));
        exit;
    }

    fail(405, 'Method not allowed');
} catch (PDOException $e) {
    fail(500, 'Database error: ' . $e->getMessage());
}
