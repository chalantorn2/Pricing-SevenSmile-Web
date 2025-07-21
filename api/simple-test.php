<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Simple Database Test ===\n";

try {
    require_once 'config.php';
    echo "✅ Config loaded successfully\n";
    
    // Test 1: Check if tour_files table exists (simpler method)
    echo "\nTesting tour_files table:\n";
    
    try {
        $stmt = $pdo->query("SELECT 1 FROM tour_files LIMIT 1");
        echo "✅ tour_files table EXISTS and accessible\n";
        
        // Count records
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM tour_files");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "✅ Table has " . $row['total'] . " records\n";
        
    } catch (Exception $e) {
        echo "❌ tour_files table issue: " . $e->getMessage() . "\n";
    }
    
    // Test 2: Check tours table
    echo "\nTesting tours table:\n";
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM tours");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "✅ tours table has " . $row['total'] . " records\n";
    } catch (Exception $e) {
        echo "❌ tours table issue: " . $e->getMessage() . "\n";
    }
    
    // Test 3: Check specific tour
    if (isset($_GET['tour_id'])) {
        $tour_id = intval($_GET['tour_id']);
        echo "\nTesting tour ID $tour_id:\n";
        
        try {
            $stmt = $pdo->prepare("SELECT id, tour_name FROM tours WHERE id = ?");
            $stmt->execute(array($tour_id));
            $tour = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($tour) {
                echo "✅ Tour exists: " . $tour['tour_name'] . "\n";
            } else {
                echo "❌ Tour ID $tour_id not found\n";
            }
        } catch (Exception $e) {
            echo "❌ Error checking tour: " . $e->getMessage() . "\n";
        }
    }
    
    // Test 4: Test files query
    if (isset($_GET['tour_id'])) {
        $tour_id = intval($_GET['tour_id']);
        echo "\nTesting files query for tour $tour_id:\n";
        
        try {
            $stmt = $pdo->prepare("SELECT * FROM tour_files WHERE tour_id = ?");
            $stmt->execute(array($tour_id));
            $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "✅ Files query executed successfully\n";
            echo "✅ Found " . count($files) . " files\n";
            
            if (count($files) > 0) {
                echo "First file: " . $files[0]['original_name'] . "\n";
            }
            
        } catch (Exception $e) {
            echo "❌ Error in files query: " . $e->getMessage() . "\n";
        }
    }
    
    // Test 5: Test JSON encoding
    echo "\nTesting JSON response:\n";
    try {
        $test_data = array(
            'success' => true,
            'data' => array(),
            'error' => null
        );
        
        $json = json_encode($test_data);
        if ($json) {
            echo "✅ JSON encoding works\n";
            echo "Sample JSON: " . $json . "\n";
        } else {
            echo "❌ JSON encoding failed\n";
        }
    } catch (Exception $e) {
        echo "❌ JSON error: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ MAIN ERROR: " . $e->getMessage() . "\n";
    echo "❌ Error code: " . $e->getCode() . "\n";
    echo "❌ File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n=== End Test ===";
?>