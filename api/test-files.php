<?php
// Test file to debug files.php issues
header('Content-Type: text/plain; charset=utf-8');

echo "=== Files API Debug Test ===\n";

// Test 1: PHP Version
echo "PHP Version: " . PHP_VERSION . "\n";

// Test 2: Required extensions
$required_extensions = array('pdo', 'pdo_mysql', 'fileinfo');
echo "Required Extensions:\n";
foreach ($required_extensions as $ext) {
    echo "- $ext: " . (extension_loaded($ext) ? "✅ Loaded" : "❌ Missing") . "\n";
}

// Test 3: Upload settings
echo "\nUpload Settings:\n";
echo "- upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "- post_max_size: " . ini_get('post_max_size') . "\n";
echo "- max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "- file_uploads: " . (ini_get('file_uploads') ? "On" : "Off") . "\n";

// Test 4: Directory permissions
echo "\nDirectory Check:\n";
$dirs = array('uploads', 'uploads/tours', 'uploads/tours/pdfs', 'uploads/tours/images');
foreach ($dirs as $dir) {
    if (file_exists($dir)) {
        $perms = substr(sprintf('%o', fileperms($dir)), -4);
        echo "- $dir: ✅ Exists (Permissions: $perms)\n";
    } else {
        echo "- $dir: ❌ Does not exist\n";
    }
}

// Test 5: Database connection
echo "\nDatabase Test:\n";
try {
    require_once 'config.php';
    echo "✅ Database connection successful\n";
    
    // Test if tour_files table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'tour_files'");
    if ($stmt->rowCount() > 0) {
        echo "✅ tour_files table exists\n";
        
        // Check table structure
        $stmt = $pdo->query("DESCRIBE tour_files");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "✅ tour_files has " . count($columns) . " columns\n";
        
    } else {
        echo "❌ tour_files table does not exist\n";
    }
    
    // Test tours table
    $stmt = $pdo->query("SHOW TABLES LIKE 'tours'");
    if ($stmt->rowCount() > 0) {
        echo "✅ tours table exists\n";
    } else {
        echo "❌ tours table does not exist\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

// Test 6: Check if specific tour exists
if (isset($_GET['tour_id'])) {
    $tour_id = intval($_GET['tour_id']);
    echo "\nTour Check:\n";
    try {
        $stmt = $pdo->prepare("SELECT id, tour_name FROM tours WHERE id = ?");
        $stmt->execute(array($tour_id));
        $tour = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($tour) {
            echo "✅ Tour ID $tour_id exists: " . $tour['tour_name'] . "\n";
        } else {
            echo "❌ Tour ID $tour_id not found\n";
        }
    } catch (Exception $e) {
        echo "❌ Error checking tour: " . $e->getMessage() . "\n";
    }
}

// Test 7: Test files.php API directly
echo "\nAPI Test:\n";
try {
    if (isset($_GET['tour_id'])) {
        $tour_id = intval($_GET['tour_id']);
        
        // Include files.php and capture output
        ob_start();
        $_GET_backup = $_GET;
        $_SERVER_backup = $_SERVER;
        
        $_GET = array('tour_id' => $tour_id);
        $_SERVER['REQUEST_METHOD'] = 'GET';
        
        include 'files.php';
        $api_output = ob_get_clean();
        
        $_GET = $_GET_backup;
        $_SERVER = $_SERVER_backup;
        
        $json_data = json_decode($api_output, true);
        if ($json_data && isset($json_data['success'])) {
            if ($json_data['success']) {
                echo "✅ files.php API working correctly\n";
                echo "✅ Returned " . count($json_data['data']) . " files\n";
            } else {
                echo "❌ files.php API returned error: " . $json_data['error'] . "\n";
            }
        } else {
            echo "❌ files.php API returned invalid JSON\n";
            echo "Raw output: " . substr($api_output, 0, 200) . "\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error testing files.php: " . $e->getMessage() . "\n";
}

echo "\n=== End Debug Test ===";
?>