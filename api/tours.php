<?php
// api/tours.php - ตามแบบที่ทำงาน
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Database connection using correct credentials
    $host = 'localhost';
    $dbname = 'sevensmile_contactrate';
    $username = 'sevensmile_contactrate';
    $password = 'contactrate2025';
    
    // Create PDO connection with error handling
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));
    
    // Test database connection first
    $test = $pdo->query("SELECT 1")->fetch();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch($method) {
        case 'GET':
            // Get all tours
            $sql = "SELECT * FROM tours ORDER BY updated_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $tours = $stmt->fetchAll();
            
            echo json_encode(array(
                'success' => true,
                'data' => $tours,
                'count' => count($tours),
                'timestamp' => date('c')
            ));
            break;
            
        case 'POST':
            // Add new tour
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            $sql = "INSERT INTO tours (sub_agent_name, address, phone, line, facebook, whatsapp, tour_name, departure_from, pier, adult_price, child_price, start_date, end_date, notes, park_fee_included, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array(
                isset($data['sub_agent_name']) ? $data['sub_agent_name'] : null,
                isset($data['address']) ? $data['address'] : null,
                isset($data['phone']) ? $data['phone'] : null,
                isset($data['line']) ? $data['line'] : null,
                isset($data['facebook']) ? $data['facebook'] : null,
                isset($data['whatsapp']) ? $data['whatsapp'] : null,
                $data['tour_name'],
                isset($data['departure_from']) ? $data['departure_from'] : null,
                isset($data['pier']) ? $data['pier'] : null,
                $data['adult_price'],
                $data['child_price'],
                $data['start_date'],
                $data['end_date'],
                isset($data['notes']) ? $data['notes'] : null,
                isset($data['park_fee_included']) && $data['park_fee_included'] ? 1 : 0,
                isset($data['updated_by']) ? $data['updated_by'] : 'Unknown'
            ));
            
            if ($result) {
                $id = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT * FROM tours WHERE id = ?");
                $stmt->execute(array($id));
                $tour = $stmt->fetch();
                
                echo json_encode(array(
                    'success' => true,
                    'data' => $tour,
                    'message' => 'เพิ่มทัวร์สำเร็จ'
                ));
            } else {
                throw new Exception("ไม่สามารถบันทึกข้อมูลได้");
            }
            break;
            
        case 'PUT':
            // Update tour
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ไม่พบ ID");
            }
            
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            $sql = "UPDATE tours SET sub_agent_name=?, address=?, phone=?, line=?, facebook=?, whatsapp=?, tour_name=?, departure_from=?, pier=?, adult_price=?, child_price=?, start_date=?, end_date=?, notes=?, park_fee_included=?, updated_by=?, updated_at=NOW() WHERE id=?";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array(
                isset($data['sub_agent_name']) ? $data['sub_agent_name'] : null,
                isset($data['address']) ? $data['address'] : null,
                isset($data['phone']) ? $data['phone'] : null,
                isset($data['line']) ? $data['line'] : null,
                isset($data['facebook']) ? $data['facebook'] : null,
                isset($data['whatsapp']) ? $data['whatsapp'] : null,
                $data['tour_name'],
                isset($data['departure_from']) ? $data['departure_from'] : null,
                isset($data['pier']) ? $data['pier'] : null,
                $data['adult_price'],
                $data['child_price'],
                $data['start_date'],
                $data['end_date'],
                isset($data['notes']) ? $data['notes'] : null,
                isset($data['park_fee_included']) && $data['park_fee_included'] ? 1 : 0,
                isset($data['updated_by']) ? $data['updated_by'] : 'Unknown',
                $id
            ));
            
            if ($result) {
                $stmt = $pdo->prepare("SELECT * FROM tours WHERE id = ?");
                $stmt->execute(array($id));
                $tour = $stmt->fetch();
                
                echo json_encode(array(
                    'success' => true,
                    'data' => $tour,
                    'message' => 'อัพเดทสำเร็จ'
                ));
            } else {
                throw new Exception("ไม่สามารถอัพเดทข้อมูลได้");
            }
            break;
            
        case 'DELETE':
            // Delete tour
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ไม่พบ ID");
            }
            
            $stmt = $pdo->prepare("DELETE FROM tours WHERE id = ?");
            $result = $stmt->execute(array($id));
            
            if ($result) {
                echo json_encode(array(
                    'success' => true,
                    'message' => 'ลบสำเร็จ'
                ));
            } else {
                throw new Exception("ไม่สามารถลบข้อมูลได้");
            }
            break;
            
        default:
            throw new Exception("Method not allowed");
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => 'Database connection failed',
        'details' => $e->getMessage(),
        'debug' => array(
            'host' => $host,
            'database' => $dbname,
            'user' => $username
        )
    ));
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ));
}
?>