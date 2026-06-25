<?php
// api/public/packages.php - Read-only public API: package tours with day-by-day items.
require __DIR__ . '/_config.php';
publicApiInit($VALID_API_KEY);

try {
    $pdo = publicApiDB($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);

    // Packages (drop internal created_by)
    $sql = "SELECT id, name, days, nights, description, total_cost, created_at, updated_at
            FROM package_tours";
    $params = array();
    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $sql .= " WHERE id = ?";
        $params[] = $_GET['id'];
    }
    $sql .= " ORDER BY updated_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $packages = $stmt->fetchAll();

    // Attach day-by-day items to each package
    $itemStmt = $pdo->prepare("
        SELECT pti.id, pti.day_number, pti.time_slot, pti.tour_id,
               pti.custom_name, pti.price, pti.unit, pti.notes,
               t.tour_name
        FROM package_tour_items pti
        LEFT JOIN tours t ON pti.tour_id = t.id
        WHERE pti.package_tour_id = ?
        ORDER BY pti.day_number, pti.time_slot
    ");

    foreach ($packages as $k => $pkg) {
        $itemStmt->execute(array($pkg['id']));
        $packages[$k]['items'] = $itemStmt->fetchAll();
    }

    echo json_encode(array(
        'success' => true,
        'data' => $packages,
        'count' => count($packages),
        'timestamp' => date('c')
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch packages'));
}
