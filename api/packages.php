<?php
// api/packages.php - Package Tours API
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
    // Database connection
    $host = 'localhost';
    $dbname = 'sevensmile_contactrate';
    $username = 'sevensmile_contactrate';
    $password = 'contactrate2025';

    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
    $options = array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    );
    $pdo = new PDO($dsn, $username, $password, $options);

    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single package with items
                $package_id = intval($_GET['id']);

                // Get package data
                $sql = "SELECT * FROM package_tours WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array($package_id));
                $package = $stmt->fetch();

                if (!$package) {
                    http_response_code(404);
                    echo json_encode(array(
                        'success' => false,
                        'error' => 'Package not found'
                    ));
                    exit;
                }

                // Get package items with tour information
                $sql = "SELECT pti.*, t.tour_name
                        FROM package_tour_items pti
                        LEFT JOIN tours t ON pti.tour_id = t.id
                        WHERE pti.package_tour_id = ?
                        ORDER BY pti.day_number, pti.time_slot";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array($package_id));
                $items = $stmt->fetchAll();

                $package['items'] = $items;

                echo json_encode(array(
                    'success' => true,
                    'data' => $package
                ));
            } else {
                // Get all packages
                $sql = "SELECT * FROM package_tours ORDER BY created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
                $packages = $stmt->fetchAll();

                echo json_encode(array(
                    'success' => true,
                    'data' => $packages,
                    'count' => count($packages)
                ));
            }
            break;

        case 'POST':
            // Create new package
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            // Validate required fields
            if (!isset($data['name']) || !isset($data['days']) || !isset($data['nights'])) {
                http_response_code(400);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'Missing required fields: name, days, nights'
                ));
                exit;
            }

            // Start transaction
            $pdo->beginTransaction();

            try {
                // Insert package
                $sql = "INSERT INTO package_tours (name, days, nights, description, total_cost, created_by)
                        VALUES (?, ?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);

                $description = isset($data['description']) ? $data['description'] : null;
                $total_cost = isset($data['total_cost']) ? $data['total_cost'] : 0;
                $created_by = isset($data['created_by']) ? $data['created_by'] : null;

                $stmt->execute(array(
                    $data['name'],
                    $data['days'],
                    $data['nights'],
                    $description,
                    $total_cost,
                    $created_by
                ));

                $package_id = $pdo->lastInsertId();

                // Insert items if provided
                if (isset($data['items']) && is_array($data['items'])) {
                    $sql = "INSERT INTO package_tour_items
                            (package_tour_id, day_number, time_slot, tour_id, custom_name, price, unit, notes)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);

                    foreach ($data['items'] as $item) {
                        $tour_id = isset($item['tour_id']) ? $item['tour_id'] : null;
                        $custom_name = isset($item['custom_name']) ? $item['custom_name'] : null;
                        $price = isset($item['price']) ? $item['price'] : 0;
                        $unit = isset($item['unit']) ? $item['unit'] : null;
                        $notes = isset($item['notes']) ? $item['notes'] : null;

                        $stmt->execute(array(
                            $package_id,
                            $item['day_number'],
                            $item['time_slot'],
                            $tour_id,
                            $custom_name,
                            $price,
                            $unit,
                            $notes
                        ));
                    }
                }

                $pdo->commit();

                echo json_encode(array(
                    'success' => true,
                    'data' => array('id' => $package_id),
                    'message' => 'Package created successfully'
                ));
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'PUT':
            // Update package
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'Package ID is required'
                ));
                exit;
            }

            $package_id = intval($_GET['id']);
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            // Start transaction
            $pdo->beginTransaction();

            try {
                // Update package
                $sql = "UPDATE package_tours
                        SET name = ?, days = ?, nights = ?, description = ?, total_cost = ?
                        WHERE id = ?";
                $stmt = $pdo->prepare($sql);

                $description = isset($data['description']) ? $data['description'] : null;
                $total_cost = isset($data['total_cost']) ? $data['total_cost'] : 0;

                $stmt->execute(array(
                    $data['name'],
                    $data['days'],
                    $data['nights'],
                    $description,
                    $total_cost,
                    $package_id
                ));

                // Delete existing items
                $sql = "DELETE FROM package_tour_items WHERE package_tour_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array($package_id));

                // Insert new items
                if (isset($data['items']) && is_array($data['items'])) {
                    $sql = "INSERT INTO package_tour_items
                            (package_tour_id, day_number, time_slot, tour_id, custom_name, price, unit, notes)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    $stmt = $pdo->prepare($sql);

                    foreach ($data['items'] as $item) {
                        $tour_id = isset($item['tour_id']) ? $item['tour_id'] : null;
                        $custom_name = isset($item['custom_name']) ? $item['custom_name'] : null;
                        $price = isset($item['price']) ? $item['price'] : 0;
                        $unit = isset($item['unit']) ? $item['unit'] : null;
                        $notes = isset($item['notes']) ? $item['notes'] : null;

                        $stmt->execute(array(
                            $package_id,
                            $item['day_number'],
                            $item['time_slot'],
                            $tour_id,
                            $custom_name,
                            $price,
                            $unit,
                            $notes
                        ));
                    }
                }

                $pdo->commit();

                echo json_encode(array(
                    'success' => true,
                    'message' => 'Package updated successfully'
                ));
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            break;

        case 'DELETE':
            // Delete package
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'Package ID is required'
                ));
                exit;
            }

            $package_id = intval($_GET['id']);

            // Items will be deleted automatically due to CASCADE
            $sql = "DELETE FROM package_tours WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array($package_id));

            echo json_encode(array(
                'success' => true,
                'message' => 'Package deleted successfully'
            ));
            break;

        default:
            http_response_code(405);
            echo json_encode(array(
                'success' => false,
                'error' => 'Method not allowed'
            ));
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ));
}
