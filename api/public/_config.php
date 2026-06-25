<?php
// api/public/_config.php - Shared config for all public (read-only) API endpoints.
// Included at the top of every public endpoint. Not meant to be called directly.

// --- API key (change in ONE place for all public endpoints) ---
$VALID_API_KEY = 'sevensmile_2026_001_2026';

// Base URL used to turn stored relative file_path into a full, ready-to-use link.
// Points at the api/ root because uploads live there (api/uploads/...).
$PUBLIC_BASE_URL = 'https://contactrate.sevensmiletourandticket.com/api';

// --- Database credentials ---
$DB_HOST = 'localhost';
$DB_NAME = 'sevensmile_contactrate';
$DB_USER = 'sevensmile_contactrate';
$DB_PASS = 'contactrate2025';

// Standard headers + read-only guard + API key check.
// Call this first thing in every endpoint.
function publicApiInit($validKey)
{
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-API-Key');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(array('success' => false, 'error' => 'Method not allowed. This endpoint is read-only.'));
        exit;
    }

    $provided = isset($_SERVER['HTTP_X_API_KEY'])
        ? $_SERVER['HTTP_X_API_KEY']
        : (isset($_GET['api_key']) ? $_GET['api_key'] : '');

    if (!hash_equals($validKey, (string) $provided)) {
        http_response_code(401);
        echo json_encode(array('success' => false, 'error' => 'Invalid or missing API key'));
        exit;
    }
}

function publicApiDB($host, $name, $user, $pass)
{
    $dsn = "mysql:host=$host;dbname=$name;charset=utf8";
    return new PDO($dsn, $user, $pass, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));
}
