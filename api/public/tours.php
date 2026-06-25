<?php
// api/public/tours.php - Read-only public API: tours + full supplier contact info.
require __DIR__ . '/_config.php';
publicApiInit($VALID_API_KEY);

try {
    $pdo = publicApiDB($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);

    // Full tour + supplier data (including contact info)
    $sql = "SELECT
              t.*,
              sa.name AS supplier_name,
              sa.address,
              sa.phone,
              sa.phone_2,
              sa.phone_3,
              sa.phone_4,
              sa.phone_5,
              sa.line,
              sa.facebook,
              sa.whatsapp,
              sa.website
            FROM tours t
            LEFT JOIN suppliers sa ON t.supplier_id = sa.id";

    $where = array();
    $params = array();

    if (isset($_GET['supplier_id']) && $_GET['supplier_id'] !== '') {
        $where[] = "t.supplier_id = ?";
        $params[] = $_GET['supplier_id'];
    }
    if (isset($_GET['search']) && $_GET['search'] !== '') {
        $where[] = "(t.tour_name LIKE ? OR sa.name LIKE ?)";
        $params[] = '%' . $_GET['search'] . '%';
        $params[] = '%' . $_GET['search'] . '%';
    }
    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $where[] = "t.id = ?";
        $params[] = $_GET['id'];
    }

    if (count($where) > 0) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }
    $sql .= " ORDER BY t.updated_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $tours = $stmt->fetchAll();

    echo json_encode(array(
        'success' => true,
        'data' => $tours,
        'count' => count($tours),
        'timestamp' => date('c')
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch tours'));
}
