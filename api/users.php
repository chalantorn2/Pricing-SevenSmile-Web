<?php
// users.php - เข้ากับ PHP 5.6
include 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $db->query("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC");
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

            $stmt = $db->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
            $stmt->execute(array(
                $input['username'],
                $input['password'],
                $input['role']
            ));

            $id = $db->lastInsertId();
            $stmt = $db->prepare("SELECT id, username, role, created_at FROM users WHERE id = ?");
            $stmt->execute(array($id));
            $user = $stmt->fetch();

            sendJSON($user);
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate') !== false) {
                sendJSON(array('error' => 'ชื่อผู้ใช้นี้มีอยู่แล้ว'), 400);
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

            if (isset($input['password']) && $input['password']) {
                $stmt = $db->prepare("UPDATE users SET username=?, password=?, role=? WHERE id=?");
                $stmt->execute(array($input['username'], $input['password'], $input['role'], $id));
            } else {
                $stmt = $db->prepare("UPDATE users SET username=?, role=? WHERE id=?");
                $stmt->execute(array($input['username'], $input['role'], $id));
            }

            $stmt = $db->prepare("SELECT id, username, role, created_at FROM users WHERE id = ?");
            $stmt->execute(array($id));
            $user = $stmt->fetch();

            sendJSON($user);
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate') !== false) {
                sendJSON(array('error' => 'ชื่อผู้ใช้นี้มีอยู่แล้ว'), 400);
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
