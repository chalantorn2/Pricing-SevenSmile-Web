<?php
// api/hotels.php
// Read-only list/detail of the hotels this site owns. Staff-only: the payload carries
// net (cost) rates, so a login is required. Partner sites read api/public/hotels.php
// with an API key instead.
// GET ?slug=xxx  -> single hotel
// GET (list)     -> filters: destination, province, stars, featured, search,
//                   active, page, limit, sort_by, sort_order
// JSON columns (amenities, images, room_types) are decoded back into arrays.

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

// Decode JSON columns and normalise types for a single hotel row.
function shapeHotel($row)
{
    $row['amenities']  = $row['amenities']  ? json_decode($row['amenities'], true) : array();
    $row['images']     = $row['images']     ? json_decode($row['images'], true) : array();
    $row['room_types'] = $row['room_types'] ? json_decode($row['room_types'], true) : array();
    $row['stars']        = $row['stars'] !== null ? (int) $row['stars'] : null;
    $row['review_count'] = (int) $row['review_count'];
    $row['is_featured']  = (int) $row['is_featured'];
    $row['is_active']    = (int) $row['is_active'];
    return $row;
}

// Fetch active rate rows for one hotel, ordered for display.
// Returns [] if the hotel_rates table doesn't exist yet (pre-migration).
function fetchRates($pdo, $hotelId)
{
    try {
        $stmt = $pdo->prepare(
            'SELECT id, room_type, period_label, period_start, period_end, meal_plan,
                    price, currency, sort_order
             FROM hotel_rates
             WHERE hotel_id = ? AND is_active = 1
             ORDER BY sort_order ASC, id ASC'
        );
        $stmt->execute(array($hotelId));
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['price'] = (float) $r['price'];
            $r['sort_order'] = (int) $r['sort_order'];
        }
        return $rows;
    } catch (PDOException $e) {
        return array(); // table not migrated yet — degrade gracefully
    }
}

// Fetch active Stop Sale / Promotion notices for one hotel that haven't ended
// yet (date_end today or later). Returns [] if the table isn't migrated.
function fetchNotices($pdo, $hotelId)
{
    try {
        $today = date('Y-m-d');
        $stmt = $pdo->prepare(
            'SELECT id, type, room_type, date_start, date_end, title, detail,
                    promo_price, currency
             FROM hotel_notices
             WHERE hotel_id = ? AND is_active = 1 AND date_end >= ?
             ORDER BY date_start ASC, id ASC'
        );
        $stmt->execute(array($hotelId, $today));
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['promo_price'] = $r['promo_price'] !== null ? (float) $r['promo_price'] : null;
        }
        return $rows;
    } catch (PDOException $e) {
        return array();
    }
}

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    // --- Single hotel by slug or id ---
    if (isset($_GET['slug']) && $_GET['slug'] !== '') {
        $stmt = $pdo->prepare('SELECT * FROM hotels WHERE slug = ? LIMIT 1');
        $stmt->execute(array($_GET['slug']));
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(array('success' => false, 'error' => 'Hotel not found'));
            exit;
        }
        $hotel = shapeHotel($row);
        $hotel['rates'] = fetchRates($pdo, $row['id']);
        $hotel['notices'] = fetchNotices($pdo, $row['id']);
        echo json_encode(array('success' => true, 'data' => $hotel), JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $stmt = $pdo->prepare('SELECT * FROM hotels WHERE id = ? LIMIT 1');
        $stmt->execute(array($_GET['id']));
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(array('success' => false, 'error' => 'Hotel not found'));
            exit;
        }
        $hotel = shapeHotel($row);
        $hotel['rates'] = fetchRates($pdo, $row['id']);
        $hotel['notices'] = fetchNotices($pdo, $row['id']);
        echo json_encode(array('success' => true, 'data' => $hotel), JSON_UNESCAPED_UNICODE);
        exit;
    }

    // --- List with filters ---
    $where = array();
    $params = array();

    if (isset($_GET['destination']) && $_GET['destination'] !== '') {
        $where[] = 'destination LIKE ?';
        $params[] = '%' . $_GET['destination'] . '%';
    }
    // province is just a substring match on destination text
    if (isset($_GET['province']) && $_GET['province'] !== '') {
        $where[] = 'destination LIKE ?';
        $params[] = '%' . $_GET['province'] . '%';
    }
    if (isset($_GET['stars']) && $_GET['stars'] !== '') {
        $where[] = 'stars = ?';
        $params[] = (int) $_GET['stars'];
    }
    if (isset($_GET['featured']) && $_GET['featured'] !== '') {
        $where[] = 'is_featured = ?';
        $params[] = (int) (!!$_GET['featured']);
    }
    if (isset($_GET['active']) && $_GET['active'] !== '') {
        $where[] = 'is_active = ?';
        $params[] = (int) (!!$_GET['active']);
    }
    if (isset($_GET['search']) && $_GET['search'] !== '') {
        $where[] = '(name LIKE ? OR destination LIKE ? OR short_description LIKE ?)';
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
    }

    $whereSql = count($where) > 0 ? ' WHERE ' . implode(' AND ', $where) : '';

    // Sorting (whitelist to avoid injection)
    $sortable = array('name', 'stars', 'rating', 'review_count', 'updated_at', 'created_at', 'synced_at');
    $sortBy = (isset($_GET['sort_by']) && in_array($_GET['sort_by'], $sortable)) ? $_GET['sort_by'] : 'updated_at';
    $sortOrder = (isset($_GET['sort_order']) && strtoupper($_GET['sort_order']) === 'ASC') ? 'ASC' : 'DESC';

    // Total count
    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM hotels' . $whereSql);
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    // Pagination
    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
    if ($limit < 1) $limit = 1;
    if ($limit > 500) $limit = 500;
    $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
    if ($page < 1) $page = 1;
    $offset = ($page - 1) * $limit;

    $sql = 'SELECT * FROM hotels' . $whereSql . " ORDER BY $sortBy $sortOrder LIMIT $limit OFFSET $offset";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $data = array();
    foreach ($rows as $r) {
        $data[] = shapeHotel($r);
    }

    echo json_encode(array(
        'success' => true,
        'data' => $data,
        'pagination' => array(
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => $total,
            'total_pages' => $limit > 0 ? (int) ceil($total / $limit) : 1,
        ),
        'timestamp' => date('c'),
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch hotels'));
}
