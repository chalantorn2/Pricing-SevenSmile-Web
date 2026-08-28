<?php
// api/transfer-upload.php
// Image upload for transfer vehicles. POST multipart with either `file` (single)
// or `files[]` (multiple). Files land in uploads/transfers/ and the response
// carries the public URLs to store in transfer_vehicles.image_url.
// Same contract as api/restaurant-upload.php.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
require_once __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'error' => 'Method not allowed'));
    exit;
}

authRequire();

$UPLOAD_DIR = __DIR__ . '/uploads/transfers';
$MAX_SIZE = 10485760; // 10MB
$ALLOWED = array('jpg', 'jpeg', 'png', 'webp', 'gif');

// Public URL for the uploads dir, derived from the current request so this works
// on both the live domain and a local dev host.
function publicBase()
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    $scheme = $https ? 'https' : 'http';
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
    $dir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
    return $scheme . '://' . $host . $dir . '/uploads/transfers';
}

// Move one uploaded file and return its public URL, or null with $err set.
function storeUpload($file, $uploadDir, $base, $allowed, $maxSize, &$err)
{
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        $err = 'Upload error (' . (isset($file['error']) ? $file['error'] : '?') . ')';
        return null;
    }
    if ($file['size'] > $maxSize) {
        $err = 'File too large (max 10MB)';
        return null;
    }
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        $err = 'Invalid file type: ' . $ext;
        return null;
    }

    $slug = preg_replace('/[^A-Za-z0-9_-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
    if ($slug === '') {
        $slug = 'image';
    }
    $name = date('Ymd_His') . '_' . substr(md5(uniqid('', true)), 0, 8) . '_' . substr($slug, 0, 40) . '.' . $ext;
    $dest = $uploadDir . '/' . $name;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        $err = 'Could not save file';
        return null;
    }
    return $base . '/' . $name;
}

if (!is_dir($UPLOAD_DIR)) {
    @mkdir($UPLOAD_DIR, 0755, true);
}

$base = publicBase();
$urls = array();
$errors = array();

// Normalise both shapes (`file` and `files[]`) into a flat list.
$queue = array();
if (isset($_FILES['file']) && is_array($_FILES['file']) && !is_array($_FILES['file']['name'])) {
    $queue[] = $_FILES['file'];
}
if (isset($_FILES['files']) && is_array($_FILES['files']['name'])) {
    $count = count($_FILES['files']['name']);
    for ($i = 0; $i < $count; $i++) {
        $queue[] = array(
            'name'     => $_FILES['files']['name'][$i],
            'type'     => $_FILES['files']['type'][$i],
            'tmp_name' => $_FILES['files']['tmp_name'][$i],
            'error'    => $_FILES['files']['error'][$i],
            'size'     => $_FILES['files']['size'][$i],
        );
    }
}

if (count($queue) === 0) {
    http_response_code(400);
    echo json_encode(array('success' => false, 'error' => 'No file uploaded'));
    exit;
}

foreach ($queue as $f) {
    $err = null;
    $url = storeUpload($f, $UPLOAD_DIR, $base, $ALLOWED, $MAX_SIZE, $err);
    if ($url !== null) {
        $urls[] = $url;
    } else {
        $errors[] = $f['name'] . ': ' . $err;
    }
}

echo json_encode(array(
    'success' => count($urls) > 0,
    'data' => array('urls' => $urls, 'url' => count($urls) > 0 ? $urls[0] : null, 'errors' => $errors),
), JSON_UNESCAPED_UNICODE);
