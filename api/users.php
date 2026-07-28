<?php
// users.php - compatible with PHP 5.6
// Admin-only: this endpoint lists staff accounts and sets their passwords.
include 'config.php';
require_once __DIR__ . '/_auth.php';

authRequireAdmin();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

$USER_FIELDS = "id, username, full_name, nickname, office, `position`, role, created_at";

// Normalise the office value coming from the client.
function normalizeOffice($value) {
    $allowed = array('sevensmile', 'indosmile', 'both');
    $value = is_string($value) ? strtolower(trim($value)) : '';
    return in_array($value, $allowed) ? $value : 'sevensmile';
}

function optionalText($input, $key) {
    if (!isset($input[$key])) {
        return null;
    }
    $value = trim($input[$key]);
    return $value === '' ? null : $value;
}

// Store a bcrypt hash, never the password itself. Legacy plain-text rows are upgraded
// as their owners sign in (see auth.php).
function hashPassword($plain) {
    return password_hash((string) $plain, PASSWORD_DEFAULT);
}

switch ($method) {
    case 'GET':
        try {
            $stmt = $db->query("SELECT $USER_FIELDS FROM users ORDER BY created_at DESC");
            $users = $stmt->fetchAll();
            sendJSON(array(
                'success' => true,
                'data' => $users
            ));
        } catch (Exception $e) {
            sendJSON(array('error' => $e->getMessage()), 500);
        }
        break;

    case 'POST':
        try {
            $input = getInput();

            $stmt = $db->prepare("INSERT INTO users (username, password, role, full_name, nickname, office, `position`) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute(array(
                $input['username'],
                hashPassword($input['password']),
                $input['role'],
                optionalText($input, 'full_name'),
                optionalText($input, 'nickname'),
                normalizeOffice(isset($input['office']) ? $input['office'] : null),
                optionalText($input, 'position')
            ));

            $id = $db->lastInsertId();
            $stmt = $db->prepare("SELECT $USER_FIELDS FROM users WHERE id = ?");
            $stmt->execute(array($id));
            $user = $stmt->fetch();

            sendJSON($user);
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate') !== false) {
                sendJSON(array('error' => 'This username already exists'), 400);
            }
            sendJSON(array('error' => $e->getMessage()), 500);
        }
        break;

    case 'PUT':
        try {
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                sendJSON(array('error' => 'No ID provided'), 400);
            }

            $input = getInput();

            $params = array(
                $input['username'],
                $input['role'],
                optionalText($input, 'full_name'),
                optionalText($input, 'nickname'),
                normalizeOffice(isset($input['office']) ? $input['office'] : null),
                optionalText($input, 'position')
            );
            $sql = "UPDATE users SET username=?, role=?, full_name=?, nickname=?, office=?, `position`=?";

            if (isset($input['password']) && $input['password']) {
                $sql .= ", password=?";
                $params[] = hashPassword($input['password']);
            }

            $sql .= " WHERE id=?";
            $params[] = $id;

            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            $stmt = $db->prepare("SELECT $USER_FIELDS FROM users WHERE id = ?");
            $stmt->execute(array($id));
            $user = $stmt->fetch();

            sendJSON($user);
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate') !== false) {
                sendJSON(array('error' => 'This username already exists'), 400);
            }
            sendJSON(array('error' => $e->getMessage()), 500);
        }
        break;

    case 'DELETE':
        try {
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!$id) {
                sendJSON(array('error' => 'No ID provided'), 400);
            }

            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute(array($id));

            sendJSON(array('message' => 'Deleted successfully'));
        } catch (Exception $e) {
            sendJSON(array('error' => $e->getMessage()), 500);
        }
        break;

    default:
        sendJSON(array('error' => 'Method not allowed'), 405);
}
