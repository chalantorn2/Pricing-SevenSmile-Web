<?php
// api/public/files.php - Read-only public API: tour files (gallery images + PDF brochures)
// and supplier files (contact rate sheets, QR codes).
//
// Default (no ?supplier_id): tour files only, same shape as before.
// With ?supplier_id=N: supplier files for that supplier.
// Every row carries a `source` field ("tour" or "supplier") so callers can tell them apart.
require __DIR__ . '/_config.php';
publicApiInit($VALID_API_KEY);

try {
    $pdo = publicApiDB($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);

    $isSupplier = isset($_GET['supplier_id']) && $_GET['supplier_id'] !== '';

    if ($isSupplier) {
        $sql = "SELECT
                  sf.id,
                  sf.supplier_id,
                  sf.original_name,
                  sf.file_path,
                  sf.file_type,
                  sf.file_size,
                  sf.mime_type,
                  sf.file_category,
                  sf.label,
                  sf.uploaded_at,
                  s.name AS supplier_name,
                  'supplier' AS source
                FROM supplier_files sf
                LEFT JOIN suppliers s ON sf.supplier_id = s.id
                WHERE sf.supplier_id = ?";
        $params = array($_GET['supplier_id']);

        if (isset($_GET['category']) && $_GET['category'] !== '') {
            $sql .= " AND sf.file_category = ?";
            $params[] = $_GET['category'];
        }
        $sql .= " ORDER BY sf.uploaded_at DESC";
    } else {
        $sql = "SELECT
                  tf.id,
                  tf.tour_id,
                  tf.original_name,
                  tf.file_path,
                  tf.file_type,
                  tf.file_size,
                  tf.mime_type,
                  tf.file_category,
                  tf.shared_with_tour_ids,
                  tf.uploaded_at,
                  t.tour_name,
                  'tour' AS source
                FROM tour_files tf
                LEFT JOIN tours t ON tf.tour_id = t.id";

        $where = array();
        $params = array();

        // Files directly owned by the tour OR shared with it
        if (isset($_GET['tour_id']) && $_GET['tour_id'] !== '') {
            $where[] = "(tf.tour_id = ? OR JSON_CONTAINS(tf.shared_with_tour_ids, ?))";
            $params[] = $_GET['tour_id'];
            $params[] = json_encode((int) $_GET['tour_id']);
        }
        if (isset($_GET['category']) && $_GET['category'] !== '') {
            $where[] = "tf.file_category = ?";
            $params[] = $_GET['category'];
        }

        if (count($where) > 0) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        $sql .= " ORDER BY tf.uploaded_at DESC";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $files = $stmt->fetchAll();

    // Add a full, ready-to-use URL for each file
    foreach ($files as $k => $f) {
        $files[$k]['file_url'] = $PUBLIC_BASE_URL . '/' . $f['file_path'];
    }

    echo json_encode(array(
        'success' => true,
        'data' => $files,
        'count' => count($files),
        'timestamp' => date('c')
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Failed to fetch files'));
}
