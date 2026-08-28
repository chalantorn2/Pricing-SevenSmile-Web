<?php
// api/public/suppliers.php - Read-only public API: suppliers + contact info + their files.
require __DIR__ . '/_config.php';
publicApiInit($VALID_API_KEY);

try {
    $pdo = publicApiDB($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);

    $sql = "SELECT
              s.id,
              s.name,
              s.type,
              s.address,
              s.phone,
              s.phone_2,
              s.phone_3,
              s.phone_4,
              s.phone_5,
              s.line,
              s.facebook,
              s.whatsapp,
              s.website,
              s.email,
              s.created_at,
              s.updated_at,
              (SELECT COUNT(*) FROM tours t WHERE t.supplier_id = s.id) AS tour_count
            FROM suppliers s";

    $where = array();
    $params = array();

    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $where[] = "s.id = ?";
        $params[] = $_GET['id'];
    }
    if (isset($_GET['search']) && $_GET['search'] !== '') {
        $where[] = "s.name LIKE ?";
        $params[] = '%' . $_GET['search'] . '%';
    }
    // 'tour' or 'transfer' — different companies, so callers usually want one kind.
    if (isset($_GET['type']) && in_array($_GET['type'], array('tour', 'transfer'), true)) {
        $where[] = "s.type = ?";
        $params[] = $_GET['type'];
    }

    if (count($where) > 0) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }
    $sql .= " ORDER BY s.name ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $suppliers = $stmt->fetchAll();

    // Attach supplier files (contact rate sheets, QR codes, brochures)
    $fileStmt = $pdo->prepare("
        SELECT id, supplier_id, original_name, file_path, file_type,
               file_size, mime_type, file_category, label, uploaded_at
        FROM supplier_files
        WHERE supplier_id = ?
        ORDER BY uploaded_at DESC
    ");

    foreach ($suppliers as $k => $sup) {
        $fileStmt->execute(array($sup['id']));
        $files = $fileStmt->fetchAll();
        foreach ($files as $i => $f) {
            $files[$i]['file_url'] = $PUBLIC_BASE_URL . '/' . $f['file_path'];
        }
        $suppliers[$k]['files'] = $files;
    }

    echo json_encode(array(
        'success' => true,
        'data' => $suppliers,
        'count' => count($suppliers),
        'timestamp' => date('c')
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch suppliers'));
}
