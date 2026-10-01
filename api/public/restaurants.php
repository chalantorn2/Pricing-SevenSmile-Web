<?php
// api/public/restaurants.php - Read-only public API: restaurants with their gallery,
// set menus and net rates. Same shape and rules as hotels.php.
//
// GET                       -> list (paginated)
// GET ?id=42                -> one restaurant by our id
// GET ?slug=some-slug       -> one restaurant by slug
// GET ?since=2026-07-01     -> only restaurants changed on/after that date (incremental sync)
//
// Other filters: destination, cuisine, search, featured, active, page, limit,
// sort_by, sort_order.
//
// NOTE ON NET RATES: `rates` carries our NET (cost) prices. A consumer may store
// them, but must never render them on a customer-facing page.

require __DIR__ . '/_config.php';
publicApiInit($VALID_API_KEY);

// Columns sent for each restaurant. Listed explicitly so a future internal column
// cannot leak by accident.
$RESTAURANT_COLUMNS = 'id, name, slug, destination, cuisine, description,
    short_description, rating, review_count, main_image, logo, facilities, open_time,
    close_time, seating_capacity, address, map_url, contact_phone, contact_email,
    website, is_featured, is_active, images, menu_types, rate_validity, rate_terms,
    created_at, updated_at';

// Decode the JSON columns and normalise numeric/boolean types.
function shapeRestaurant($row)
{
    foreach (array('facilities', 'images', 'menu_types') as $col) {
        $row[$col] = !empty($row[$col]) ? json_decode($row[$col], true) : array();
        if (!is_array($row[$col])) {
            $row[$col] = array();
        }
    }
    $row['id']               = (int) $row['id'];
    $row['rating']           = $row['rating'] !== null ? (float) $row['rating'] : null;
    $row['review_count']     = (int) $row['review_count'];
    $row['seating_capacity'] = $row['seating_capacity'] !== null ? (int) $row['seating_capacity'] : null;
    $row['is_featured']      = (int) $row['is_featured'];
    $row['is_active']        = (int) $row['is_active'];
    $row['rates']            = array();
    return $row;
}

// Attach every rate row to a list of already-shaped restaurants in one query.
function attachRates($pdo, &$restaurants)
{
    $ids = array();
    foreach ($restaurants as $r) {
        $ids[] = $r['id'];
    }
    if (count($ids) === 0) {
        return;
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $map = array();
    try {
        $stmt = $pdo->prepare(
            "SELECT id, restaurant_id, menu_name, period_label, period_start, period_end,
                    price, price_unit, min_pax, currency, note, sort_order, is_active,
                    created_at, updated_at
             FROM restaurant_rates
             WHERE restaurant_id IN ($placeholders)
             ORDER BY restaurant_id ASC, sort_order ASC, id ASC"
        );
        $stmt->execute($ids);
        foreach ($stmt->fetchAll() as $row) {
            $rid = (int) $row['restaurant_id'];
            $row['id']            = (int) $row['id'];
            $row['restaurant_id'] = $rid;
            $row['price']         = (float) $row['price'];
            $row['min_pax']       = $row['min_pax'] !== null ? (int) $row['min_pax'] : null;
            $row['sort_order']    = (int) $row['sort_order'];
            $row['is_active']     = (int) $row['is_active'];
            $map[$rid][] = $row;
        }
    } catch (PDOException $e) {
        return; // table not migrated yet - degrade gracefully
    }

    foreach ($restaurants as &$r) {
        if (isset($map[$r['id']])) {
            $r['rates'] = $map[$r['id']];
        }
    }
    unset($r);
}

try {
    $pdo = publicApiDB($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
    $pdo->exec("SET NAMES utf8mb4");

    // --- Single restaurant by id or slug ---
    foreach (array('id' => 'id', 'slug' => 'slug') as $param => $column) {
        if (isset($_GET[$param]) && $_GET[$param] !== '') {
            $stmt = $pdo->prepare("SELECT $RESTAURANT_COLUMNS FROM restaurants WHERE $column = ? LIMIT 1");
            $stmt->execute(array($_GET[$param]));
            $row = $stmt->fetch();
            if (!$row) {
                http_response_code(404);
                echo json_encode(array('success' => false, 'error' => 'Restaurant not found'));
                exit;
            }
            $restaurants = array(shapeRestaurant($row));
            attachRates($pdo, $restaurants);
            echo json_encode(array(
                'success' => true,
                'data' => $restaurants[0],
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
    if (isset($_GET['cuisine']) && $_GET['cuisine'] !== '') {
        $where[] = 'cuisine LIKE ?';
        $params[] = '%' . $_GET['cuisine'] . '%';
    }
    if (isset($_GET['search']) && $_GET['search'] !== '') {
        $where[] = '(name LIKE ? OR destination LIKE ? OR cuisine LIKE ? OR short_description LIKE ?)';
        for ($i = 0; $i < 4; $i++) {
            $params[] = '%' . $_GET['search'] . '%';
        }
    }
    if (isset($_GET['featured']) && $_GET['featured'] !== '') {
        $where[] = 'is_featured = ?';
        $params[] = (int) (!!$_GET['featured']);
    }
    // Omit `active` to get both, so a consumer can mirror inactive rows.
    if (isset($_GET['active']) && $_GET['active'] !== '') {
        $where[] = 'is_active = ?';
        $params[] = (int) (!!$_GET['active']);
    }
    if (isset($_GET['since']) && $_GET['since'] !== '') {
        $where[] = 'updated_at >= ?';
        $params[] = $_GET['since'];
    }

    $whereSql = count($where) > 0 ? ' WHERE ' . implode(' AND ', $where) : '';

    $sortable = array('id', 'name', 'rating', 'updated_at', 'created_at');
    $sortBy = (isset($_GET['sort_by']) && in_array($_GET['sort_by'], $sortable, true))
        ? $_GET['sort_by'] : 'updated_at';
    $sortOrder = (isset($_GET['sort_order']) && strtoupper($_GET['sort_order']) === 'ASC')
        ? 'ASC' : 'DESC';

    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM restaurants' . $whereSql);
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 100;
    if ($limit < 1) $limit = 1;
    if ($limit > 200) $limit = 200;
    $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
    if ($page < 1) $page = 1;
    $offset = ($page - 1) * $limit;

    $stmt = $pdo->prepare(
        "SELECT $RESTAURANT_COLUMNS FROM restaurants$whereSql ORDER BY $sortBy $sortOrder LIMIT $limit OFFSET $offset"
    );
    $stmt->execute($params);

    $restaurants = array();
    foreach ($stmt->fetchAll() as $row) {
        $restaurants[] = shapeRestaurant($row);
    }
    attachRates($pdo, $restaurants);

    echo json_encode(array(
        'success' => true,
        'data' => $restaurants,
        'count' => count($restaurants),
        'pagination' => array(
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => $total,
            'total_pages' => (int) ceil($total / $limit),
        ),
        'timestamp' => date('c'),
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch restaurants'));
}
