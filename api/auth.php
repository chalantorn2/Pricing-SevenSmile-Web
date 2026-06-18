<?php
// api/auth.php - working version
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    // Get POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Validate required fields
    if (empty($data['username']) || empty($data['password'])) {
        throw new Exception("Please enter both username and password");
    }
    
    // Database connection
    $host = 'localhost';
    $dbname = 'sevensmile_contactrate';
    $username = 'sevensmile_contactrate';
    $password = 'contactrate2025';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));
    
    // Find user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute(array($data['username']));
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception("Username not found");
    }
    
    // Check password
    if ($user['password'] !== $data['password']) {
        throw new Exception("Incorrect password");
    }
    
    // Return user data (without password)
    unset($user['password']);
    
    echo json_encode(array(
        'success' => true,
        'data' => $user,
        'message' => 'Login successful',
        'timestamp' => date('c')
    ));
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ));
}
?>