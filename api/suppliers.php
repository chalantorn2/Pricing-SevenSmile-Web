<?php
// api/suppliers.php - Updated to support website field
//
// Suppliers come in two kinds and they are different companies: 'tour' vendors and
// 'transfer' vendors, never both. GET takes ?type= to list one kind; without it
// every supplier comes back, which is what the shared lookups still want.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
require_once __DIR__ . '/_auth.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

authRequire();

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

    // Only the two kinds exist; anything else is a typo and is treated as "no
    // filter" rather than silently matching nothing.
    $SUPPLIER_TYPES = array('tour', 'transfer');
    $typeFilter = (isset($_GET['type']) && in_array($_GET['type'], $SUPPLIER_TYPES, true))
        ? $_GET['type']
        : null;

    // A supplier's kind is fixed when it is created and only ever set to one of the
    // two; anything unrecognised falls back to 'tour', which is what every existing
    // row is.
    $requestedType = function ($data) use ($SUPPLIER_TYPES) {
        return (isset($data['type']) && in_array($data['type'], $SUPPLIER_TYPES, true))
            ? $data['type']
            : 'tour';
    };

    switch ($method) {
        case 'GET':
            // Check if requesting single supplier
            if (isset($_GET['id']) && $_GET['id']) {
                // Get single supplier by ID
                $id = intval($_GET['id']);
                if ($id <= 0) {
                    throw new Exception("Invalid supplier ID");
                }

                $sql = "SELECT sa.*, 
                              COUNT(t.id) as tour_count,
                              MAX(t.updated_at) as last_tour_update
                       FROM suppliers sa
                       LEFT JOIN tours t ON sa.id = t.supplier_id
                       WHERE sa.id = ?
                       GROUP BY sa.id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array($id));
                $supplier = $stmt->fetch();

                if (!$supplier) {
                    http_response_code(404);
                    echo json_encode(array(
                        'success' => false,
                        'error' => 'Supplier not found'
                    ));
                    exit;
                }

                echo json_encode(array(
                    'success' => true,
                    'data' => $supplier,
                    'timestamp' => date('c')
                ));
                break;
            }

            // Original logic for all suppliers or search
            $search = isset($_GET['search']) ? $_GET['search'] : '';

            if ($search) {
                // For AutoComplete - search by name and all phone numbers
                $sql = "SELECT id, name, type, phone, phone_2, phone_3, phone_4, phone_5, line, website
                        FROM suppliers
                        WHERE (name LIKE ?
                        OR phone LIKE ? OR phone_2 LIKE ? OR phone_3 LIKE ? OR phone_4 LIKE ? OR phone_5 LIKE ?)";
                $searchParam = '%' . $search . '%';
                $params = array($searchParam, $searchParam, $searchParam, $searchParam, $searchParam, $searchParam);
                if ($typeFilter !== null) {
                    $sql .= " AND type = ?";
                    $params[] = $typeFilter;
                }
                $sql .= " ORDER BY name ASC LIMIT 10";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            } else {
                // Get all suppliers with tour count
                $sql = "SELECT sa.*,
                              COUNT(t.id) as tour_count,
                              MAX(t.updated_at) as last_tour_update
                       FROM suppliers sa
                       LEFT JOIN tours t ON sa.id = t.supplier_id";
                $params = array();
                if ($typeFilter !== null) {
                    $sql .= " WHERE sa.type = ?";
                    $params[] = $typeFilter;
                }
                $sql .= " GROUP BY sa.id ORDER BY sa.updated_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }

            $suppliers = $stmt->fetchAll();

            echo json_encode(array(
                'success' => true,
                'data' => $suppliers,
                'count' => count($suppliers),
                'timestamp' => date('c')
            ));
            break;

        case 'POST':
            // Add new supplier
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            // Validate required fields
            if (empty($data['name'])) {
                throw new Exception("Please enter a Supplier name");
            }

            // Check if name already exists
            $stmt = $pdo->prepare("SELECT id FROM suppliers WHERE name = ?");
            $stmt->execute(array($data['name']));
            if ($stmt->fetch()) {
                throw new Exception("This Supplier name already exists");
            }

            $sql = "INSERT INTO suppliers (name, type, address, phone, phone_2, phone_3, phone_4, phone_5, line, facebook, whatsapp, website, email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array(
                $data['name'],
                $requestedType($data),
                isset($data['address']) ? $data['address'] : null,
                isset($data['phone']) ? $data['phone'] : null,
                isset($data['phone_2']) ? $data['phone_2'] : null,
                isset($data['phone_3']) ? $data['phone_3'] : null,
                isset($data['phone_4']) ? $data['phone_4'] : null,
                isset($data['phone_5']) ? $data['phone_5'] : null,
                isset($data['line']) ? $data['line'] : null,
                isset($data['facebook']) ? $data['facebook'] : null,
                isset($data['whatsapp']) ? $data['whatsapp'] : null,
                isset($data['website']) ? $data['website'] : null,
                isset($data['email']) ? $data['email'] : null
            ));

            if ($result) {
                $id = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT * FROM suppliers WHERE id = ?");
                $stmt->execute(array($id));
                $supplier = $stmt->fetch();

                echo json_encode(array(
                    'success' => true,
                    'data' => $supplier,
                    'message' => 'Supplier added successfully'
                ));
            } else {
                throw new Exception("Unable to save data");
            }
            break;

        case 'PUT':
            // Update supplier
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ID not found");
            }

            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            // Validate required fields
            if (empty($data['name'])) {
                throw new Exception("Please enter a Supplier name");
            }

            // Check if name already exists (exclude current record)
            $stmt = $pdo->prepare("SELECT id FROM suppliers WHERE name = ? AND id != ?");
            $stmt->execute(array($data['name'], $id));
            if ($stmt->fetch()) {
                throw new Exception("This Supplier name already exists");
            }

            // `type` is only written when the caller actually sends one, so an older
            // form that knows nothing about it cannot quietly turn a transfer
            // supplier into a tour supplier.
            $typeUpdate = (isset($data['type']) && in_array($data['type'], $SUPPLIER_TYPES, true))
                ? "type='" . $data['type'] . "', "
                : "";

            $sql = "UPDATE suppliers
                    SET name=?, {$typeUpdate}address=?, phone=?, phone_2=?, phone_3=?, phone_4=?, phone_5=?, line=?, facebook=?, whatsapp=?, website=?, email=?, updated_at=NOW()
                    WHERE id=?";

            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute(array(
                $data['name'],
                isset($data['address']) ? $data['address'] : null,
                isset($data['phone']) ? $data['phone'] : null,
                isset($data['phone_2']) ? $data['phone_2'] : null,
                isset($data['phone_3']) ? $data['phone_3'] : null,
                isset($data['phone_4']) ? $data['phone_4'] : null,
                isset($data['phone_5']) ? $data['phone_5'] : null,
                isset($data['line']) ? $data['line'] : null,
                isset($data['facebook']) ? $data['facebook'] : null,
                isset($data['whatsapp']) ? $data['whatsapp'] : null,
                isset($data['website']) ? $data['website'] : null,
                isset($data['email']) ? $data['email'] : null,
                $id
            ));

            if ($result) {
                $stmt = $pdo->prepare("SELECT * FROM suppliers WHERE id = ?");
                $stmt->execute(array($id));
                $supplier = $stmt->fetch();

                echo json_encode(array(
                    'success' => true,
                    'data' => $supplier,
                    'message' => 'Supplier updated successfully'
                ));
            } else {
                throw new Exception("Unable to update data");
            }
            break;

        case 'DELETE':
            // Delete supplier
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                throw new Exception("ID not found");
            }

            // Start transaction
            $pdo->beginTransaction();

            try {
                // Delete supplier files first
                $stmt = $pdo->prepare("DELETE FROM supplier_files WHERE supplier_id = ?");
                $stmt->execute(array($id));

                // Delete related tours
                $stmt = $pdo->prepare("DELETE FROM tours WHERE supplier_id = ?");
                $stmt->execute(array($id));

                // Delete supplier
                $stmt = $pdo->prepare("DELETE FROM suppliers WHERE id = ?");
                $result = $stmt->execute(array($id));

                $pdo->commit();

                if ($result) {
                    echo json_encode(array(
                        'success' => true,
                        'message' => 'Supplier and related tours deleted successfully'
                    ));
                }
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
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
