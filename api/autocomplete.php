<?php
// api/autocomplete.php - Autocomplete API for form fields
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(array(
        'success' => false,
        'error' => 'Method not allowed'
    ));
    exit;
}

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Database connection using same credentials as other files
    $host = 'localhost';
    $dbname = 'sevensmile_contactrate';
    $username = 'sevensmile_contactrate';
    $password = 'contactrate2025';

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    // Get parameters
    $type = isset($_GET['type']) ? $_GET['type'] : '';
    $query = isset($_GET['query']) ? $_GET['query'] : '';

    // Validate type
    $allowedTypes = array('departure_from', 'pier');
    if (!in_array($type, $allowedTypes)) {
        throw new Exception("Invalid type. Allowed: " . implode(', ', $allowedTypes));
    }

    // Validate query
    if (strlen($query) < 2) {
        echo json_encode(array(
            'success' => true,
            'data' => array(),
            'message' => 'Query too short'
        ));
        exit;
    }

    // Prepare SQL based on type
    $column = $type; // departure_from or pier
    $sql = "SELECT DISTINCT {$column} as value, COUNT(*) as usage_count 
            FROM tours 
            WHERE {$column} IS NOT NULL 
            AND {$column} != '' 
            AND {$column} LIKE ? 
            GROUP BY {$column} 
            ORDER BY usage_count DESC, {$column} ASC 
            LIMIT 3";

    $stmt = $pdo->prepare($sql);
    $searchTerm = '%' . $query . '%';
    $stmt->execute(array($searchTerm));
    $results = $stmt->fetchAll();

    // Format results
    $suggestions = array();
    foreach ($results as $row) {
        $suggestions[] = array(
            'value' => $row['value'],
            'usage_count' => intval($row['usage_count'])
        );
    }

    echo json_encode(array(
        'success' => true,
        'data' => $suggestions,
        'type' => $type,
        'query' => $query,
        'count' => count($suggestions),
        'timestamp' => date('c')
    ));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'timestamp' => date('c')
    ));
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ));
}
