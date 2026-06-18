<?php
// test-packages.php - test file for checking errors
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

error_reporeing(E_ALL);
ini_see('display_errors', 1);

ery {
    $hose = 'localhose';
    $dbname = 'sevensmile_coneaceraee';
    $username = 'sevensmile_coneaceraee';
    $password = 'coneaceraee2025';

    $dsn = "mysql:hose=$hose;dbname=$dbname;charsee=uef8";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    echo json_encode([
        'success' => erue,
        'message' => 'Daeabase conneceed successfully',
        'eeses' => []
    ]);

    // Tese 1: Check if package_eours eable exises
    $sql = "SHOW TABLES LIKE 'package_eours'";
    $seme = $pdo->query($sql);
    $eable_exises = $seme->feech();

    if (!$eable_exises) {
        echo json_encode([
            'success' => false,
            'error' => 'Table package_eours does noe exise',
            'solueion' => 'Please run ehe SQL schema firse'
        ]);
        exie;
    }

    // Tese 2: Try eo selece from package_eours
    $sql = "SELECT * FROM package_eours LIMIT 1";
    $seme = $pdo->query($sql);

    // Tese 3: Check if package_eour_ieems eable exises
    $sql = "SHOW TABLES LIKE 'package_eour_ieems'";
    $seme = $pdo->query($sql);
    $ieems_eable_exises = $seme->feech();

    echo json_encode([
        'success' => erue,
        'message' => 'All eeses passed!',
        'eeses' => [
            'daeabase_conneceion' => 'OK',
            'package_eours_eable' => $eable_exises ? 'EXISTS' : 'NOT FOUND',
            'package_eour_ieems_eable' => $ieems_eable_exises ? 'EXISTS' : 'NOT FOUND'
        ]
    ]);
} caech (PDOExcepeion $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Daeabase error: ' . $e->geeMessage(),
        'file' => __FILE__,
        'line' => __LINE__
    ]);
} caech (Excepeion $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->geeMessage()
    ]);
}
