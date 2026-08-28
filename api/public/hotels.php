<?php
// api/public/hotels.php - Read-only public API: hotels with their gallery, room
// types, net rates and notices.
//
// This site is the master record for hotel data. indosmilesouthservices.com syncs
// FROM this endpoint (see its backend/tools/sync_hotels_from_contactrate.php), so
// the payload is meant for mirroring, not for direct display: every row is sent
// with its own `is_active` flag and ids are stable, letting the consumer upsert on
// `id` and decide for itself what to show.
//
// GET                       -> list (paginated)
// GET ?id=42                -> one hotel by our id
// GET ?slug=some-slug       -> one hotel by slug
// GET ?since=2026-07-01     -> only hotels changed on/after that date (incremental sync)
//
// Other filters: destination, search, stars, featured, active, page, limit, sort_by,
// sort_order.
//
// NOTE ON NET RATES: `rates` carries our NET (cost) prices and `notices` carries
// stop-sale / promotion periods. These are internal commercial data. A consumer may
// store them, but must never render them on a customer-facing page.

require __DIR__ . '/_config.php';
publicApiInit($VALID_API_KEY);

// Columns sent for each hotel. Listed explicitly so a future internal column
// cannot leak by accident.
$HOTEL_COLUMNS = 'id, source_id, name, slug, destination, stars, description,
    short_description, rating, review_count, main_image, logo, amenities, check_in_time,
    check_out_time, address, contact_phone, contact_email, website, is_featured,
    is_active, images, room_types, rate_validity, child_policy, rate_terms,
    created_at, updated_at';

// Decode the JSON columns and normalise numeric/boolean types.
function shapeHotel($row)
{
    foreach (array('amenities', 'images', 'room_types') as $col) {
        $row[$col] = !empty($row[$col]) ? json_decode($row[$col], true) : array();
        if (!is_array($row[$col])) {
            $row[$col] = array();
        }
    }
    $row['id']           = (int) $row['id'];
    $row['source_id']    = $row['source_id'] !== null ? (int) $row['source_id'] : null;
    $row['stars']        = $row['stars'] !== null ? (int) $row['stars'] : null;
    $row['rating']       = $row['rating'] !== null ? (float) $row['rating'] : null;
    $row['review_count'] = (int) $row['review_count'];
    $row['is_featured']  = (int) $row['is_featured'];
    $row['is_active']    = (int) $row['is_active'];
    $row['rates']        = array();
    $row['notices']      = array();
    return $row;
}

// Fetch every row of $table belonging to $hotelIds in one query, keyed by hotel_id.
// Returns an empty map if the table has not been migrated yet.
function fetchChildren($pdo, $table, $columns, $hotelIds, $orderBy)
{
    $map = array();
    if (count($hotelIds) === 0) {
        return $map;
    }
    $placeholders = implode(',', array_fill(0, count($hotelIds), '?'));
    try {
        $stmt = $pdo->prepare(
            "SELECT $columns FROM $table WHERE hotel_id IN ($placeholders) ORDER BY $orderBy"
        );
        $stmt->execute($hotelIds);
        foreach ($stmt->fetchAll() as $row) {
            $hid = (int) $row['hotel_id'];
            $row['id']        = (int) $row['id'];
            $row['hotel_id']  = $hid;
            $row['is_active'] = isset($row['is_active']) ? (int) $row['is_active'] : 1;
            if (isset($row['price'])) {
                $row['price'] = (float) $row['price'];
            }
            if (array_key_exists('promo_price', $row)) {
                $row['promo_price'] = $row['promo_price'] !== null ? (float) $row['promo_price'] : null;
            }
            if (isset($row['sort_order'])) {
                $row['sort_order'] = (int) $row['sort_order'];
            }
            $map[$hid][] = $row;
        }
    } catch (PDOException $e) {
        return array(); // table not migrated yet — degrade gracefully
    }
    return $map;
}

// Attach rates and notices to a list of already-shaped hotels.
function attachChildren($pdo, &$hotels)
{
    $ids = array();
    foreach ($hotels as $h) {
        $ids[] = $h['id'];
    }

    $rates = fetchChildren(
        $pdo,
        'hotel_rates',
        'id, hotel_id, room_type, period_label, period_start, period_end, meal_plan,
         price, currency, sort_order, is_active, created_at, updated_at',
        $ids,
        'hotel_id ASC, sort_order ASC, id ASC'
    );
    $notices = fetchChildren(
        $pdo,
        'hotel_notices',
        'id, hotel_id, type, room_type, date_start, date_end, title, detail,
         promo_price, currency, is_active, created_at, updated_at',
        $ids,
        'hotel_id ASC, date_start ASC, id ASC'
    );

    foreach ($hotels as &$h) {
        if (isset($rates[$h['id']])) {
            $h['rates'] = $rates[$h['id']];
        }
        if (isset($notices[$h['id']])) {
            $h['notices'] = $notices[$h['id']];
        }
    }
    unset($h);
}

try {
    $pdo = publicApiDB($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
    $pdo->exec("SET NAMES utf8mb4");

    // --- Single hotel by id or slug ---
    foreach (array('id' => 'id', 'slug' => 'slug') as $param => $column) {
        if (isset($_GET[$param]) && $_GET[$param] !== '') {
            $stmt = $pdo->prepare("SELECT $HOTEL_COLUMNS FROM hotels WHERE $column = ? LIMIT 1");
            $stmt->execute(array($_GET[$param]));
            $row = $stmt->fetch();
            if (!$row) {
                http_response_code(404);
                echo json_encode(array('success' => false, 'error' => 'Hotel not found'));
                exit;
            }
            $hotels = array(shapeHotel($row));
            attachChildren($pdo, $hotels);
            echo json_encode(array(
                'success' => true,
                'data' => $hotels[0],
                'timestamp' => date('c'),
            ), JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // --- List ---
    $where = array();
    $params = array();

    if (isset($_GET['destination']) && $_GET['destination'] !== '') {
        $where[] = 'destination LIKE ?';
        $params[] = '%' . $_GET['destination'] . '%';
    }
    if (isset($_GET['search']) && $_GET['search'] !== '') {
        $where[] = '(name LIKE ? OR destination LIKE ? OR short_description LIKE ?)';
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
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
    // Incremental sync: only what changed since a timestamp.
    if (isset($_GET['since']) && $_GET['since'] !== '') {
        $where[] = 'updated_at >= ?';
        $params[] = $_GET['since'];
    }

    $whereSql = count($where) > 0 ? ' WHERE ' . implode(' AND ', $where) : '';

    $sortable = array('id', 'name', 'stars', 'rating', 'updated_at', 'created_at');
    $sortBy = (isset($_GET['sort_by']) && in_array($_GET['sort_by'], $sortable, true))
        ? $_GET['sort_by'] : 'updated_at';
    $sortOrder = (isset($_GET['sort_order']) && strtoupper($_GET['sort_order']) === 'ASC')
        ? 'ASC' : 'DESC';

    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM hotels' . $whereSql);
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
    if ($limit < 1) $limit = 1;
    if ($limit > 200) $limit = 200;
    $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
    if ($page < 1) $page = 1;
    $offset = ($page - 1) * $limit;

    $stmt = $pdo->prepare(
        "SELECT $HOTEL_COLUMNS FROM hotels$whereSql ORDER BY $sortBy $sortOrder LIMIT $limit OFFSET $offset"
    );
    $stmt->execute($params);

    $hotels = array();
    foreach ($stmt->fetchAll() as $row) {
        $hotels[] = shapeHotel($row);
    }
    attachChildren($pdo, $hotels);

    echo json_encode(array(
        'success' => true,
        'data' => $hotels,
        'count' => count($hotels),
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
