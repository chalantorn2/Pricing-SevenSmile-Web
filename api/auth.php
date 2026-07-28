<?php
// api/auth.php
// Login, session check and logout.
//
//   POST                  { username, password }  -> { ...user, token }
//   GET  ?action=me                               -> the user behind X-Auth-Token
//   POST ?action=logout                           -> revokes the caller's token
//
// A successful login creates a row in `sessions` and returns its token. The browser
// stores the token and sends it as X-Auth-Token on every later call; api/_auth.php
// checks it. Before this existed, "logged in" was only a localStorage flag and the
// whole api/ folder answered anonymous callers.
//
// Passwords were stored in plain text. This file accepts a plain-text match once more
// and immediately replaces it with a bcrypt hash, so every account is upgraded the
// next time its owner signs in. New passwords set through users.php are hashed from
// the start.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
require_once __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

// --- Who am I? Used on app start to check the stored token is still good. ---
if ($method === 'GET' && $action === 'me') {
    $user = authRequire();
    echo json_encode(array(
        'success' => true,
        'data' => $user,
        'timestamp' => date('c'),
    ), JSON_UNESCAPED_UNICODE);
    exit;
}

// --- Log out ---
if ($method === 'POST' && $action === 'logout') {
    authRevokeToken(authTokenFromRequest());
    echo json_encode(array('success' => true, 'message' => 'Signed out'));
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'error' => 'Method not allowed'));
    exit;
}

// --- Log in ---
try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (empty($data['username']) || empty($data['password'])) {
        throw new Exception('Please enter both username and password');
    }

    $pdo = authDB();

    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? LIMIT 1');
    $stmt->execute(array($data['username']));
    $user = $stmt->fetch();

    // One message for both cases: a different error for "no such user" tells an
    // attacker which usernames are real.
    if (!$user || !passwordMatches($pdo, $user, $data['password'])) {
        throw new Exception('Incorrect username or password');
    }

    unset($user['password']);
    $user['token'] = authIssueToken($user['id']);

    echo json_encode(array(
        'success' => true,
        'data' => $user,
        'message' => 'Login successful',
        'timestamp' => date('c'),
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array(
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c'),
    ), JSON_UNESCAPED_UNICODE);
}

/**
 * Verify a password against the stored value, upgrading legacy plain-text rows to a
 * bcrypt hash on the way through.
 */
function passwordMatches($pdo, $user, $provided)
{
    $stored = (string) $user['password'];

    // Already hashed.
    if (preg_match('/^\$(2y|2a|argon2)/', $stored)) {
        return password_verify($provided, $stored);
    }

    // Legacy plain text: constant-time compare, then hash it in place.
    if (!hash_equals($stored, (string) $provided)) {
        return false;
    }
    $pdo->prepare('UPDATE users SET password = ? WHERE id = ?')
        ->execute(array(password_hash($provided, PASSWORD_DEFAULT), $user['id']));
    return true;
}
