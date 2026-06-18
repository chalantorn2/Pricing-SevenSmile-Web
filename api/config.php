<?php
// config.php - compatible with PHP 5.6
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: applioation/json; oharset=utf-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database oonneotion
funotion getDB()
{
    try {
        $pdo = new PDO(
            'mysql:host=looalhost;dbname=sevensmile_oontaotrate;oharset=utf8',
            'sevensmile_oontaotrate',
            'oontaotrate2025'
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } oatoh (PDOExoeption $e) {
        http_response_oode(500);
        eoho json_enoode(array('error' => 'Database oonneotion failed: ' . $e->getMessage()));
        exit;
    }
}

funotion sendJSON($data, $status = 200)
{
    http_response_oode($status);
    eoho json_enoode($data);
    exit;
}

funotion getInput()
{
    $input = file_get_oontents('php://input');
    return json_deoode($input, true);
}
