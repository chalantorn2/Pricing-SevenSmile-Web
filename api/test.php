<?php
// test.php - ทดสอบง่ายสุด
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

echo json_encode([
    'message' => 'API Working!',
    'time' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION
]);
?>