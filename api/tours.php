<?php
// api/tours.php - Updated to work with Sub Agents
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
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch($method) {
        case 'GET':
            // Get all tours with sub agent information
            $sql = "SELECT t.*, 
                          sa.name as sub_agent_name,
                          sa.address,
                          sa.phone,
                          sa.line,
                          sa.facebook,
                          sa.whatsapp,
                          sa.created_at as sub_agent_created_at,
                          sa.updated_at as sub_agent_updated_at
                   FROM tours t
                   LEFT JOIN sub_agents sa ON t.sub_agent_id = sa.id
                   ORDER BY t.updated_at DESC";
            
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
            // Add new tour (single or multiple)
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            // Check if it's multiple tours (array) or single tour (object)
            $tours = isset($data['tours']) ? $data['tours'] : array($data);
            $sub_agent_id = isset($data['sub_agent_id']) ? $data['sub_agent_id'] : null;
            $updated_by = isset($data['updated_by']) ? $data['updated_by'] : 'Unknown';
            
            // Validate sub_agent_id if provided
            if ($sub_agent_id) {
                $stmt = $pdo->prepare("SELECT id FROM sub_agents WHERE id = ?");
                $stmt->execute(array($sub_agent_id));
                if (!$stmt->fetch()) {
                    throw new Exception("Sub Agent ไม่พบในระบบ");
                }
            }
            
            $created_tours = array();
            
            // Start transaction for multiple tours
            $pdo->beginTransaction();
            
            try {
                foreach ($tours as $tour) {
                    // Validate required fields
                    if (empty($tour['tour_name'])) {
                        throw new Exception("กรุณากรอกชื่อทัวร์");
                    }
                    
                    $sql = "INSERT INTO tours (sub_agent_id, tour_name, departure_from, pier, adult_price, child_price, start_date, end_date, notes, park_fee_included, updated_by) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    
                    $stmt = $pdo->prepare($sql);
                    $result = $stmt->execute(array(
                        $sub_agent_id,
                        $tour['tour_name'],
                        isset($tour['departure_from']) ? $tour['departure_from'] : null,
                        isset($tour['pier']) ? $tour['pier'] : null,
                        isset($tour['adult_price']) ? $tour['adult_price'] : 0,
                        isset($tour['child_price']) ? $tour['child_price'] : 0,
                        isset($tour['start_date']) ? $tour['start_date'] : null,
                        isset($tour['end_date']) ? $tour['end_date'] : null,
                        isset($tour['notes']) ? $tour['notes'] : null,
                        isset($tour['park_fee_included']) && $tour['park_fee_included'] ? 1 : 0,
                        $updated_by
                    ));
                    
                    if ($result) {
                        $id = $pdo->lastInsertId();
                        
                        // Get the created tour with sub agent info
                        $stmt = $pdo->prepare("
                            SELECT t.*, 
                                  sa.name as sub_agent_name,
                                  sa.address, sa.phone, sa.line, sa.facebook, sa.whatsapp
                            FROM tours t
                            LEFT JOIN sub_agents sa ON t.sub_agent_id = sa.id
                            WHERE t.id = ?
                        ");
                        $stmt->execute(array($id));
                        $created_tour = $stmt->fetch();
                        
                        $created_tours[] = $created_tour;
                    } else {
                        throw new Exception("ไม่สามารถบันทึกทัวร์ได้");
                    }
                }
                
                // Commit transaction
                $pdo->commit();
                
                echo json_encode(array(
                    'success' => true,
                    'data' => count($created_tours) === 1 ? $created_tours[0] : $created_tours,
                    'message' => 'เพิ่มทัวร์สำเร็จ (' . count($created_tours) . ' รายการ)',
                    'count' => count($created_tours)
                ));
                
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
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
            
            // Validate sub_agent_id if provided
            if (isset($data['sub_agent_id']) && $data['sub_agent_id']) {
                $stmt = $pdo->prepare("SELECT id FROM sub_agents WHERE id = ?");
                $stmt->execute(array($data['sub_agent_id']));
                if (!$stmt->fetch()) {
                    throw new Exception("Sub Agent ไม่พบในระบบ");
                }
            }
            
            $sql = "UPDATE tours 
                   SET sub_agent_id=?, tour_name=?, departure_from=?, pier=?, adult_price=?, child_price=?, start_date=?, end_date=?, notes=?, park_fee_included=?, updated_by=?, updated_at=NOW() 
                   WHERE id=?";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array(
                isset($data['sub_agent_id']) ? $data['sub_agent_id'] : null,
                $data['tour_name'],
                isset($data['departure_from']) ? $data['departure_from'] : null,
                isset($data['pier']) ? $data['pier'] : null,
                isset($data['adult_price']) ? $data['adult_price'] : 0,
                isset($data['child_price']) ? $data['child_price'] : 0,
                isset($data['start_date']) ? $data['start_date'] : null,
                isset($data['end_date']) ? $data['end_date'] : null,
                isset($data['notes']) ? $data['notes'] : null,
                isset($data['park_fee_included']) && $data['park_fee_included'] ? 1 : 0,
                isset($data['updated_by']) ? $data['updated_by'] : 'Unknown',
                $id
            ));
            
            if ($result) {
                // Get updated tour with sub agent info
                $stmt = $pdo->prepare("
                    SELECT t.*, 
                          sa.name as sub_agent_name,
                          sa.address, sa.phone, sa.line, sa.facebook, sa.whatsapp
                    FROM tours t
                    LEFT JOIN sub_agents sa ON t.sub_agent_id = sa.id
                    WHERE t.id = ?
                ");
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