<?php
// config.php - เข้ากับ PHP 5.6
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database connection
function getDB() {
    try {
        $pdo = new PDO(
            'mysql:host=localhost;dbname=sevensmile_contactrate;charset=utf8',
            'sevensmile_contactrate',
            'contactrate2025'
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array('error' => 'Database connection failed: ' . $e->getMessage()));
        exit;
    }
}

function sendJSON($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function getInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}
?>