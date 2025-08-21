<?php
// api/supplier-files.php - Updated for file categories support
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Valid file categories for suppliers
$validCategories = ['contact_rate', 'contract', 'qr_code', 'certificate', 'general'];

// Helper functions (same as files.php)
function formatFileSize($bytes)
{
    if ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        return number_format($bytes / 1024, 2) . ' KB';
    } else {
        return $bytes . ' bytes';
    }
}

function getFileTypeFromExt($filename)
{
    $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $imageExts = array('jpg', 'jpeg', 'png', 'gif', 'webp');

    if (in_array($extension, $imageExts)) {
        return 'image';
    } elseif ($extension === 'pdf') {
        return 'pdf';
    }
    return null;
}

function validateFile($file)
{
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return 'Upload error: ' . $file['error'];
    }

    if ($file['size'] > 10485760) { // 10MB
        return 'File too large (max 10MB)';
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = array('pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp');

    if (!in_array($ext, $allowed)) {
        return 'Invalid file type';
    }

    return null;
}

function validateCategory($category, $validCategories)
{
    if (!$category) {
        return 'general'; // Default category
    }

    if (!in_array($category, $validCategories)) {
        return 'general'; // Fallback to general
    }

    return $category;
}

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

    switch ($method) {
        case 'GET':
            // Get files for supplier (with optional category filter)
            if (!isset($_GET['supplier_id'])) {
                http_response_code(400);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'supplier_id required'
                ));
                exit;
            }

            $supplier_id = intval($_GET['supplier_id']);
            if ($supplier_id <= 0) {
                http_response_code(400);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'Invalid supplier_id'
                ));
                exit;
            }

            // Optional category filter
            $category_filter = isset($_GET['category']) ? $_GET['category'] : null;

            $sql = "SELECT id, supplier_id, file_name, original_name, file_path, 
                           file_type, file_size, mime_type, label, uploaded_by, uploaded_at,
                           COALESCE(file_category, 'general') as file_category
                    FROM supplier_files 
                    WHERE supplier_id = ?";

            $params = array($supplier_id);

            if ($category_filter && in_array($category_filter, $validCategories)) {
                $sql .= " AND COALESCE(file_category, 'general') = ?";
                $params[] = $category_filter;
            }

            $sql .= " ORDER BY file_category, uploaded_at DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $files = $stmt->fetchAll();

            // Add formatted size and ensure category is set
            foreach ($files as $key => $file) {
                $files[$key]['file_size_formatted'] = formatFileSize($file['file_size']);
                $files[$key]['file_category'] = $file['file_category'] ?: 'general';
            }

            echo json_encode(array(
                'success' => true,
                'data' => $files,
                'category_filter' => $category_filter,
                'timestamp' => date('c')
            ));
            break;

        case 'POST':
            // Upload file with category
            if (!isset($_POST['supplier_id']) || !isset($_FILES['file'])) {
                http_response_code(400);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'Missing supplier_id or file'
                ));
                exit;
            }

            $supplier_id = intval($_POST['supplier_id']);
            $uploaded_by = isset($_POST['uploaded_by']) ? $_POST['uploaded_by'] : 'Unknown';
            $label = isset($_POST['label']) ? $_POST['label'] : '';
            $file_category = validateCategory(
                isset($_POST['file_category']) ? $_POST['file_category'] : null,
                $validCategories
            );
            $file = $_FILES['file'];

            // Validate file
            $error = validateFile($file);
            if ($error) {
                http_response_code(400);
                echo json_encode(array(
                    'success' => false,
                    'error' => $error
                ));
                exit;
            }

            // Check if supplier exists
            $stmt = $pdo->prepare("SELECT id FROM suppliers WHERE id = ?");
            $stmt->execute(array($supplier_id));
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'Supplier not found'
                ));
                exit;
            }

            // Create directories if they don't exist
            $dirs = array('uploads', 'uploads/suppliers', 'uploads/suppliers/pdfs', 'uploads/suppliers/images');
            foreach ($dirs as $dir) {
                if (!file_exists($dir)) {
                    mkdir($dir, 0755, true);
                }
            }

            // Generate unique filename
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $unique_name = uniqid() . '_' . time() . '.' . $ext;
            $file_type = getFileTypeFromExt($file['name']);

            // Determine upload directory
            $upload_dir = 'uploads/suppliers/' . ($file_type === 'pdf' ? 'pdfs/' : 'images/');
            $file_path = $upload_dir . $unique_name;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $file_path)) {
                http_response_code(500);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'Failed to save file'
                ));
                exit;
            }

            // Save to database with category
            $stmt = $pdo->prepare("
                INSERT INTO supplier_files 
                (supplier_id, file_name, original_name, file_path, file_type, file_size, mime_type, label, uploaded_by, file_category) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $mime_type = isset($file['type']) && $file['type'] ? $file['type'] : 'application/octet-stream';

            $stmt->execute(array(
                $supplier_id,
                $unique_name,
                $file['name'],
                $file_path,
                $file_type,
                $file['size'],
                $mime_type,
                $label,
                $uploaded_by,
                $file_category
            ));

            $file_id = $pdo->lastInsertId();

            // Get the newly created file record
            $stmt = $pdo->prepare("
                SELECT *, COALESCE(file_category, 'general') as file_category 
                FROM supplier_files WHERE id = ?
            ");
            $stmt->execute(array($file_id));
            $new_file = $stmt->fetch();

            // Add formatted size
            $new_file['file_size_formatted'] = formatFileSize($new_file['file_size']);

            echo json_encode(array(
                'success' => true,
                'data' => $new_file,
                'message' => 'File uploaded successfully'
            ));
            break;

        case 'DELETE':
            // Delete file
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'File ID required'
                ));
                exit;
            }

            $file_id = intval($_GET['id']);

            // Get file info first
            $stmt = $pdo->prepare("SELECT * FROM supplier_files WHERE id = ?");
            $stmt->execute(array($file_id));
            $file = $stmt->fetch();

            if (!$file) {
                http_response_code(404);
                echo json_encode(array(
                    'success' => false,
                    'error' => 'File not found'
                ));
                exit;
            }

            // Delete physical file if exists
            if (file_exists($file['file_path'])) {
                unlink($file['file_path']);
            }

            // Delete from database
            $stmt = $pdo->prepare("DELETE FROM supplier_files WHERE id = ?");
            $stmt->execute(array($file_id));

            echo json_encode(array(
                'success' => true,
                'message' => 'File deleted successfully',
                'deleted_file_id' => $file_id
            ));
            break;

        default:
            http_response_code(405);
            echo json_encode(array(
                'success' => false,
                'error' => 'Method not allowed'
            ));
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'timestamp' => date('c')
    ));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ));
}
