<?php
// api/_auth.php
// Shared login check for every endpoint under api/. Include it directly after the
// header() block and BEFORE the OPTIONS early-exit, so preflight responses advertise
// the X-Auth-Token header too:
//
//   header(...);                              // endpoint's own headers
//   require_once __DIR__ . '/_auth.php';
//   if (OPTIONS) { exit; }
//   authRequire();                            // or authRequireForWrites();
//
// Tokens, not cookies: the SPA runs on a different origin during local development
// (vite dev server against the live API), and a wildcard CORS policy cannot carry
// cookies. auth.php issues an opaque token, the browser keeps it in localStorage and
// sends it back as X-Auth-Token.
//
// Endpoints under api/public/ are NOT covered here - they authenticate partner sites
// with a shared API key instead (see api/public/_config.php).

// Advertise the auth header for CORS preflight. header() replaces the endpoint's own
// Allow-Headers line, so every endpoint that includes this file gets it for free.
header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token');

define('AUTH_SESSION_DAYS', 7); // sliding: every authenticated request pushes it out

function authDB()
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    try {
        $pdo = new PDO(
            'mysql:host=localhost;dbname=sevensmile_contactrate;charset=utf8mb4',
            'sevensmile_contactrate',
            'contactrate2025',
            array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            )
        );
    } catch (PDOException $e) {
        authFail(500, 'Database connection failed');
    }
    return $pdo;
}

function authFail($code, $message)
{
    http_response_code($code);
    echo json_encode(array('success' => false, 'error' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

/** 64 hex chars of randomness. */
function authNewToken()
{
    if (function_exists('random_bytes')) {
        return bin2hex(random_bytes(32));
    }
    if (function_exists('openssl_random_pseudo_bytes')) {
        $strong = false;
        $bytes = openssl_random_pseudo_bytes(32, $strong);
        if ($bytes !== false && $strong) {
            return bin2hex($bytes);
        }
    }
    authFail(500, 'No secure random source available on this server');
}

/** Read the token from the X-Auth-Token header, falling back to ?token= for curl. */
function authTokenFromRequest()
{
    if (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        return trim($_SERVER['HTTP_X_AUTH_TOKEN']);
    }
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) === 'x-auth-token') {
                return trim($value);
            }
        }
    }
    if (isset($_GET['token'])) {
        return trim($_GET['token']);
    }
    return '';
}

/**
 * Resolve the caller. Returns the user row (no password) or null when the token is
 * missing, unknown or expired. Also slides the expiry forward on a valid hit.
 */
function authCurrentUser()
{
    static $resolved = false;
    static $user = null;
    if ($resolved) {
        return $user;
    }
    $resolved = true;

    $token = authTokenFromRequest();
    if ($token === '' || !preg_match('/^[a-f0-9]{64}$/', $token)) {
        return null;
    }

    $pdo = authDB();
    try {
        $stmt = $pdo->prepare(
            'SELECT u.id, u.username, u.full_name, u.nickname, u.office, u.`position`,
                    u.role, s.expires_at
             FROM sessions s
             JOIN users u ON u.id = s.user_id
             WHERE s.token = ? LIMIT 1'
        );
        $stmt->execute(array($token));
        $row = $stmt->fetch();
    } catch (PDOException $e) {
        // `sessions` not migrated yet: fail closed rather than letting everyone in.
        authFail(500, 'Auth storage unavailable - run database/add_sessions_table.sql');
    }

    if (!$row) {
        return null;
    }
    if (strtotime($row['expires_at']) < time()) {
        $pdo->prepare('DELETE FROM sessions WHERE token = ?')->execute(array($token));
        return null;
    }

    $pdo->prepare(
        'UPDATE sessions SET last_seen_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL ? DAY)
         WHERE token = ?'
    )->execute(array(AUTH_SESSION_DAYS, $token));

    unset($row['expires_at']);
    $user = $row;
    return $user;
}

/** Any logged-in staff member. */
function authRequire()
{
    $user = authCurrentUser();
    if (!$user) {
        authFail(401, 'Please sign in');
    }
    return $user;
}

/** Admins only - use for user management and anything destructive site-wide. */
function authRequireAdmin()
{
    $user = authRequire();
    if (($user['role'] ?? '') !== 'admin') {
        authFail(403, 'Admins only');
    }
    return $user;
}

/**
 * Reads stay open, writes need a login. For the two endpoints public share links
 * depend on (tours.php, files.php) - a shared tour page has no signed-in user.
 */
function authRequireForWrites()
{
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        return authRequire();
    }
    return authCurrentUser();
}

/** Create a session for a user and return the token. */
function authIssueToken($userId)
{
    $pdo = authDB();
    $token = authNewToken();
    $agent = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 255) : null;

    $pdo->prepare(
        'INSERT INTO sessions (token, user_id, created_at, last_seen_at, expires_at, user_agent)
         VALUES (?, ?, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?)'
    )->execute(array($token, (int) $userId, AUTH_SESSION_DAYS, $agent));

    // Opportunistic cleanup so the table cannot grow forever.
    $pdo->exec('DELETE FROM sessions WHERE expires_at < NOW()');

    return $token;
}

/** Drop the caller's session. */
function authRevokeToken($token)
{
    if ($token === '') {
        return;
    }
    authDB()->prepare('DELETE FROM sessions WHERE token = ?')->execute(array($token));
}
