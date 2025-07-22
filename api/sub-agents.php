<?php
// api/sub-agents.php - Sub Agents CRUD API
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
    // Database connection using same credentials as other files
    $host = 'localhost';
    $dbname = 'sevensmile_contactrate';
    $username = 'sevensmile_contactrate';
    $password = 'contactrate2025';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch($method) {
        case 'GET':
            // Get all sub agents or search
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            
            if ($search) {
                // For AutoComplete - search by name
                $sql = "SELECT id, name, phone, line 
                       FROM sub_agents 
                       WHERE name LIKE ? 
                       ORDER BY name ASC 
                       LIMIT 10";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array('%' . $search . '%'));
            } else {
                // Get all sub agents with tour count
                $sql = "SELECT sa.*, 
                              COUNT(t.id) as tour_count,
                              MAX(t.updated_at) as last_tour_update
                       FROM sub_agents sa
                       LEFT JOIN tours t ON sa.id = t.sub_agent_id
                       GROUP BY sa.id
                       ORDER BY sa.updated_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            }
            
            $subAgents = $stmt->fetchAll();
            
            echo json_encode(array(
                'success' => true,
                'data' => $subAgents,
                'count' => count($subAgents),
                'timestamp' => date('c')
            ));
            break;
            
        case 'POST':
            // Add new sub agent
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            // Validate required fields
            if (empty($data['name'])) {
                throw new Exception("กรุณากรอกชื่อ Sub Agent");
            }
            
            // Check if name already exists
            $stmt = $pdo->prepare("SELECT id FROM sub_agents WHERE name = ?");
            $stmt->execute(array($data['name']));
            if ($stmt->fetch()) {
                throw new Exception("ชื่อ Sub Agent นี้มีอยู่แล้ว");
            }
            
            $sql = "INSERT INTO sub_agents (name, address, phone, line, facebook, whatsapp) 
                   VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array(
                $data['name'],
                isset($data['address']) ? $data['address'] : null,
                isset($data['phone']) ? $data['phone'] : null,
                isset($data['line']) ? $data['line'] : null,
                isset($data['facebook']) ? $data['facebook'] : null,
                isset($data['whatsapp']) ? $data['whatsapp'] : null
            ));
            
            if ($result) {
                $id = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT * FROM sub_agents WHERE id = ?");
                $stmt->execute(array($id));
                $subAgent = $stmt->fetch();
                
                echo json_encode(array(
                    'success' => true,
                    'data' => $subAgent,
                    'message' => 'เพิ่ม Sub Agent สำเร็จ'
                ));
            } else {
                throw new Exception("ไม่สามารถบันทึกข้อมูลได้");
            }
            break;
            
        case 'PUT':
            // Update sub agent
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ไม่พบ ID");
            }
            
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            // Validate required fields
            if (empty($data['name'])) {
                throw new Exception("กรุณากรอกชื่อ Sub Agent");
            }
            
            // Check if name already exists (exclude current record)
            $stmt = $pdo->prepare("SELECT id FROM sub_agents WHERE name = ? AND id != ?");
            $stmt->execute(array($data['name'], $id));
            if ($stmt->fetch()) {
                throw new Exception("ชื่อ Sub Agent นี้มีอยู่แล้ว");
            }
            
            $sql = "UPDATE sub_agents 
                   SET name=?, address=?, phone=?, line=?, facebook=?, whatsapp=?, updated_at=NOW() 
                   WHERE id=?";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array(
                $data['name'],
                isset($data['address']) ? $data['address'] : null,
                isset($data['phone']) ? $data['phone'] : null,
                isset($data['line']) ? $data['line'] : null,
                isset($data['facebook']) ? $data['facebook'] : null,
                isset($data['whatsapp']) ? $data['whatsapp'] : null,
                $id
            ));
            
            if ($result) {
                $stmt = $pdo->prepare("SELECT * FROM sub_agents WHERE id = ?");
                $stmt->execute(array($id));
                $subAgent = $stmt->fetch();
                
                echo json_encode(array(
                    'success' => true,
                    'data' => $subAgent,
                    'message' => 'อัพเดต Sub Agent สำเร็จ'
                ));
            } else {
                throw new Exception("ไม่สามารถอัพเดทข้อมูลได้");
            }
            break;
            
        case 'DELETE':
            // Delete sub agent
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ไม่พบ ID");
            }
            
            // Check if sub agent has tours
            $stmt = $pdo->prepare("SELECT COUNT(*) as tour_count FROM tours WHERE sub_agent_id = ?");
            $stmt->execute(array($id));
            $result = $stmt->fetch();
            
            if ($result['tour_count'] > 0) {
                throw new Exception("ไม่สามารถลบ Sub Agent ที่มีทัวร์อยู่ได้ กรุณาลบทัวร์ก่อน");
            }
            
            // Check if sub agent has files
            $stmt = $pdo->prepare("SELECT COUNT(*) as file_count FROM sub_agent_files WHERE sub_agent_id = ?");
            $stmt->execute(array($id));
            $result = $stmt->fetch();
            
            if ($result['file_count'] > 0) {
                throw new Exception("ไม่สามารถลบ Sub Agent ที่มีไฟล์อยู่ได้ กรุณาลบไฟล์ก่อน");
            }
            
            $stmt = $pdo->prepare("DELETE FROM sub_agents WHERE id = ?");
            $result = $stmt->execute(array($id));
            
            if ($result) {
                echo json_encode(array(
                    'success' => true,
                    'message' => 'ลบ Sub Agent สำเร็จ'
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
?>