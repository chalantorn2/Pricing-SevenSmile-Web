<?php
// api/public/transfers.php - Read-only public API: the transfer price matrix.
//
// Transfers are not a catalogue like hotels: a route (origin -> destination, in a
// category) is shared by every supplier, and only the price differs. So one call
// returns the two master lists plus the routes, each route carrying its prices:
//
//   { locations: [...], vehicles: [...], routes: [{ ..., prices: [...] }] }
//
// GET                         -> everything
// GET ?province=Krabi         -> routes with EITHER end in that province
// GET ?category=airport_transfer
// GET ?supplier_id=7          -> keep only that supplier's prices; routes it does
//                                not price are dropped
// GET ?active=1               -> only active routes / locations / vehicles
// GET ?since=2026-08-01       -> only routes whose row or any price changed on/after
//                                that date (incremental sync)
//
// NOTE ON NET RATES: `price` is our NET (cost) price from the supplier. A consumer
// may store it, but must never render it on a customer-facing page.

require __DIR__ . '/_config.php';
publicApiInit($VALID_API_KEY);

function getParam($key)
{
    return (isset($_GET[$key]) && $_GET[$key] !== '') ? $_GET[$key] : null;
}

try {
    $pdo = publicApiDB($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
    $pdo->exec("SET NAMES utf8mb4");

    $active = getParam('active');
    $activeFlag = $active !== null ? (int) (!!$active) : null;

    // --- Master lists ---
    $sql = "SELECT id, name, province, is_active, sort_order, created_at, updated_at
            FROM transfer_locations";
    $params = array();
    if ($activeFlag !== null) {
        $sql .= " WHERE is_active = ?";
        $params[] = $activeFlag;
    }
    $stmt = $pdo->prepare($sql . " ORDER BY province ASC, sort_order ASC, name ASC");
    $stmt->execute($params);
    $locations = $stmt->fetchAll();

    $sql = "SELECT id, name, max_passengers, max_luggage, image_url, description,
                   is_active, sort_order, created_at, updated_at
            FROM transfer_vehicles";
    if ($activeFlag !== null) {
        $sql .= " WHERE is_active = ?";
    }
    $stmt = $pdo->prepare($sql . " ORDER BY sort_order ASC, name ASC");
    $stmt->execute($params);
    $vehicles = $stmt->fetchAll();

    // --- Routes ---
    $where = array();
    $params = array();
    if (($province = getParam('province')) !== null) {
        $where[] = "(o.province = ? OR d.province = ?)";
        $params[] = $province;
        $params[] = $province;
    }
    if (($category = getParam('category')) !== null) {
        $where[] = "r.category = ?";
        $params[] = $category;
    }
    if ($activeFlag !== null) {
        $where[] = "r.is_active = ?";
        $params[] = $activeFlag;
    }
    if (($since = getParam('since')) !== null) {
        $where[] = "(r.updated_at >= ? OR EXISTS (
                        SELECT 1 FROM transfer_route_prices sp
                        WHERE sp.route_id = r.id AND sp.updated_at >= ?))";
        $params[] = $since;
        $params[] = $since;
    }

    $sql = "SELECT r.id, r.origin_id, o.name AS origin_name, o.province AS origin_province,
                   r.destination_id, d.name AS destination_name, d.province AS destination_province,
                   r.category, r.label, r.note, r.sort_order, r.is_active,
                   r.created_at, r.updated_at
            FROM transfer_routes r
            JOIN transfer_locations o ON r.origin_id = o.id
            JOIN transfer_locations d ON r.destination_id = d.id";
    if (count($where) > 0) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }
    $sql .= " ORDER BY r.category ASC, r.sort_order ASC, r.id ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $routes = $stmt->fetchAll();

    // --- Prices, fetched in one query and nested under their route ---
    $priceMap = array();
    if (count($routes) > 0) {
        $ids = array();
        foreach ($routes as $r) {
            $ids[] = (int) $r['id'];
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $sql = "SELECT p.id, p.route_id, p.supplier_id, s.name AS supplier_name,
                       s.is_active AS supplier_active, p.vehicle_id, v.name AS vehicle_name,
                       p.price, p.currency, p.created_at, p.updated_at
                FROM transfer_route_prices p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN transfer_vehicles v ON p.vehicle_id = v.id
                WHERE p.route_id IN ($placeholders)";
        $params = $ids;
        if (($supplierId = getParam('supplier_id')) !== null) {
            $sql .= " AND p.supplier_id = ?";
            $params[] = (int) $supplierId;
        }
        $stmt = $pdo->prepare($sql . " ORDER BY p.supplier_id ASC, v.sort_order ASC, p.id ASC");
        $stmt->execute($params);
        foreach ($stmt->fetchAll() as $p) {
            $p['price'] = (float) $p['price'];
            $priceMap[(int) $p['route_id']][] = $p;
        }
    }

    $out = array();
    foreach ($routes as $r) {
        $r['prices'] = isset($priceMap[(int) $r['id']]) ? $priceMap[(int) $r['id']] : array();
        // A supplier filter means "this supplier's rate sheet": an unpriced route
        // is not on it.
        if (getParam('supplier_id') !== null && count($r['prices']) === 0) {
            continue;
        }
        $out[] = $r;
    }

    echo json_encode(array(
        'success' => true,
        'data' => array(
            'locations' => $locations,
            'vehicles' => $vehicles,
            'routes' => $out,
        ),
        'count' => count($out),
        'timestamp' => date('c'),
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch transfers'));
}
