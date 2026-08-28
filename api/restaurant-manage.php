<?php
// api/restaurant-manage.php
// Create / update / delete restaurants. Mirrors api/hotel-manage.php.
//
// POST            -> create   (JSON body)
// PUT    ?id=123  -> update   (JSON body)
// DELETE ?id=123  -> delete

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, DELETE, OPTIONS');
require_once __DIR__ . '/_auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

authRequire();

$host = 'localhost';
$dbname = 'sevensmile_contactrate';
$username = 'sevensmile_contactrate';
$password = 'contactrate2025';

function fail($code, $message)
{
    http_response_code($code);
    echo json_encode(array('success' => false, 'error' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

function body()
{
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);
    return is_array($json) ? $json : array();
}

// Latin slug from the name; Thai-only names fall back to a timestamp so the
// slug column (used in URLs) always has something usable.
function makeSlug($name)
{
    $s = strtolower(trim($name));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    $s = trim($s, '-');
    if ($s === '') {
        $s = 'restaurant-' . date('YmdHis');
    }
    return substr($s, 0, 200);
}

// Append -2, -3 ... until the slug is free (ignoring $exceptId, the row we edit).
function uniqueSlug($pdo, $slug, $exceptId = null)
{
    $stmt = $pdo->prepare('SELECT id FROM restaurants WHERE slug = ? AND (? IS NULL OR id <> ?) LIMIT 1');
    $candidate = $slug;
    $n = 1;
    while (true) {
        $stmt->execute(array($candidate, $exceptId, $exceptId));
        if (!$stmt->fetchColumn()) {
            return $candidate;
        }
        $n++;
        $candidate = $slug . '-' . $n;
    }
}

// Map the JSON body onto the restaurants columns. Shared by create and update so
// both accept exactly the payload the form builds.
function fieldsFromBody($b)
{
    return array(
        ':name'              => isset($b['name']) ? trim($b['name']) : '',
        ':destination'       => isset($b['destination']) ? trim($b['destination']) : null,
        ':cuisine'           => !empty($b['cuisine']) ? trim($b['cuisine']) : null,
        ':description'       => isset($b['description']) ? $b['description'] : null,
        ':short_description' => isset($b['short_description']) ? $b['short_description'] : null,
        ':rating'            => isset($b['rating']) && $b['rating'] !== '' ? (float) $b['rating'] : null,
        ':review_count'      => isset($b['review_count']) ? (int) $b['review_count'] : 0,
        ':main_image'        => !empty($b['main_image']) ? $b['main_image'] : null,
        ':logo'              => !empty($b['logo']) ? $b['logo'] : null,
        ':facilities'        => isset($b['facilities']) ? json_encode($b['facilities'], JSON_UNESCAPED_UNICODE) : null,
        ':open_time'         => !empty($b['open_time']) ? $b['open_time'] : null,
        ':close_time'        => !empty($b['close_time']) ? $b['close_time'] : null,
        ':seating_capacity'  => isset($b['seating_capacity']) && $b['seating_capacity'] !== '' ? (int) $b['seating_capacity'] : null,
        ':address'           => !empty($b['address']) ? $b['address'] : null,
        ':map_url'           => !empty($b['map_url']) ? $b['map_url'] : null,
        ':contact_phone'     => !empty($b['contact_phone']) ? $b['contact_phone'] : null,
        ':contact_email'     => !empty($b['contact_email']) ? $b['contact_email'] : null,
        ':website'           => !empty($b['website']) ? $b['website'] : null,
        ':is_featured'       => !empty($b['is_featured']) ? 1 : 0,
        ':is_active'         => isset($b['is_active']) && !$b['is_active'] ? 0 : 1,
        ':images'            => json_encode(isset($b['images']) ? $b['images'] : array(), JSON_UNESCAPED_UNICODE),
        ':menu_types'        => json_encode(isset($b['menu_types']) ? $b['menu_types'] : array(), JSON_UNESCAPED_UNICODE),
    );
}

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    // --- CREATE ---
    if ($method === 'POST') {
        $b = body();
        if (!isset($b['name']) || trim($b['name']) === '') {
            fail(400, 'Restaurant name is required');
        }

        $fields = fieldsFromBody($b);
        $fields[':slug'] = uniqueSlug($pdo, makeSlug($b['name']));

        $sql = 'INSERT INTO restaurants
                    (name, slug, destination, cuisine, description, short_description,
                     rating, review_count, main_image, logo, facilities, open_time, close_time,
                     seating_capacity, address, map_url, contact_phone, contact_email, website,
                     is_featured, is_active, images, menu_types)
                VALUES
                    (:name, :slug, :destination, :cuisine, :description, :short_description,
                     :rating, :review_count, :main_image, :logo, :facilities, :open_time, :close_time,
                     :seating_capacity, :address, :map_url, :contact_phone, :contact_email, :website,
                     :is_featured, :is_active, :images, :menu_types)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($fields);

        echo json_encode(array(
            'success' => true,
            'data' => array('id' => (int) $pdo->lastInsertId(), 'slug' => $fields[':slug']),
        ), JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Everything below needs an existing restaurant.
    if ($id <= 0) {
        fail(400, 'Missing restaurant id');
    }
    $check = $pdo->prepare('SELECT id FROM restaurants WHERE id = ? LIMIT 1');
    $check->execute(array($id));
    if (!$check->fetch()) {
        fail(404, 'Restaurant not found');
    }

    // --- UPDATE ---
    if ($method === 'PUT') {
        $b = body();
        if (!isset($b['name']) || trim($b['name']) === '') {
            fail(400, 'Restaurant name is required');
        }

        $fields = fieldsFromBody($b);
        $fields[':slug'] = uniqueSlug($pdo, makeSlug($b['name']), $id);
        $fields[':id'] = $id;

        $sql = 'UPDATE restaurants SET
                    name = :name, slug = :slug, destination = :destination, cuisine = :cuisine,
                    description = :description, short_description = :short_description,
                    rating = :rating, review_count = :review_count, main_image = :main_image,
                    logo = :logo, facilities = :facilities, open_time = :open_time,
                    close_time = :close_time, seating_capacity = :seating_capacity,
                    address = :address, map_url = :map_url, contact_phone = :contact_phone,
                    contact_email = :contact_email, website = :website,
                    is_featured = :is_featured, is_active = :is_active,
                    images = :images, menu_types = :menu_types
                WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($fields);

        echo json_encode(array(
            'success' => true,
            'data' => array('id' => $id, 'slug' => $fields[':slug']),
        ), JSON_UNESCAPED_UNICODE);
        exit;
    }

    // --- DELETE ---
    if ($method === 'DELETE') {
        // Rate tables for restaurants don't exist yet; clear them defensively so
        // this keeps working once they are added.
        foreach (array('restaurant_rates', 'restaurant_notices') as $table) {
            try {
                $pdo->prepare("DELETE FROM $table WHERE restaurant_id = ?")->execute(array($id));
            } catch (PDOException $e) {
                // table not created yet — nothing to clean up
            }
        }
        $stmt = $pdo->prepare('DELETE FROM restaurants WHERE id = ?');
        $stmt->execute(array($id));

        echo json_encode(array('success' => true, 'data' => array('id' => $id)));
        exit;
    }

    fail(405, 'Method not allowed');
} catch (PDOException $e) {
    fail(500, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    fail(500, 'Failed: ' . $e->getMessage());
}
