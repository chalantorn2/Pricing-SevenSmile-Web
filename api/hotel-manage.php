<?php
// api/hotel-manage.php
// Create / update / delete hotels. This site is the master record for hotel data:
// every hotel is editable here, including the ones originally imported from
// indosmilesouthservices.com. `source_id` is kept only as a reference to the row
// the data first came from (see api/public/hotels.php, which INDO Smile now pulls
// from) and no longer restricts editing.
//
// POST            -> create   (JSON body, source_id stays NULL)
// PUT    ?id=123  -> update   (JSON body)
// DELETE ?id=123  -> delete   (also drops its rates/notices)

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
        $s = 'hotel-' . date('YmdHis');
    }
    return substr($s, 0, 200);
}

// Append -2, -3 ... until the slug is free (ignoring $exceptId, the row we edit).
function uniqueSlug($pdo, $slug, $exceptId = null)
{
    $stmt = $pdo->prepare('SELECT id FROM hotels WHERE slug = ? AND (? IS NULL OR id <> ?) LIMIT 1');
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

// Map the JSON body onto the hotels columns. Shared by create and update so both
// accept exactly the payload the form builds.
function fieldsFromBody($b)
{
    return array(
        ':name'              => isset($b['name']) ? trim($b['name']) : '',
        ':destination'       => isset($b['destination']) ? trim($b['destination']) : null,
        ':stars'             => isset($b['stars']) && $b['stars'] !== '' ? (int) $b['stars'] : null,
        ':description'       => isset($b['description']) ? $b['description'] : null,
        ':short_description' => isset($b['short_description']) ? $b['short_description'] : null,
        ':rating'            => isset($b['rating']) && $b['rating'] !== '' ? (float) $b['rating'] : null,
        ':review_count'      => isset($b['review_count']) ? (int) $b['review_count'] : 0,
        ':main_image'        => !empty($b['main_image']) ? $b['main_image'] : null,
        ':amenities'         => isset($b['amenities']) ? json_encode($b['amenities'], JSON_UNESCAPED_UNICODE) : null,
        ':check_in_time'     => !empty($b['check_in_time']) ? $b['check_in_time'] : null,
        ':check_out_time'    => !empty($b['check_out_time']) ? $b['check_out_time'] : null,
        ':address'           => !empty($b['address']) ? $b['address'] : null,
        ':contact_phone'     => !empty($b['contact_phone']) ? $b['contact_phone'] : null,
        ':contact_email'     => !empty($b['contact_email']) ? $b['contact_email'] : null,
        ':website'           => !empty($b['website']) ? $b['website'] : null,
        ':is_featured'       => !empty($b['is_featured']) ? 1 : 0,
        ':is_active'         => isset($b['is_active']) && !$b['is_active'] ? 0 : 1,
        ':images'            => json_encode(isset($b['images']) ? $b['images'] : array(), JSON_UNESCAPED_UNICODE),
        ':room_types'        => json_encode(isset($b['room_types']) ? $b['room_types'] : array(), JSON_UNESCAPED_UNICODE),
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
            fail(400, 'Hotel name is required');
        }

        $fields = fieldsFromBody($b);
        $fields[':slug'] = uniqueSlug($pdo, makeSlug($b['name']));

        $sql = 'INSERT INTO hotels
                    (source_id, name, slug, destination, stars, description, short_description,
                     rating, review_count, main_image, amenities, check_in_time, check_out_time,
                     address, contact_phone, contact_email, website, is_featured, is_active,
                     images, room_types)
                VALUES
                    (NULL, :name, :slug, :destination, :stars, :description, :short_description,
                     :rating, :review_count, :main_image, :amenities, :check_in_time, :check_out_time,
                     :address, :contact_phone, :contact_email, :website, :is_featured, :is_active,
                     :images, :room_types)';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($fields);

        echo json_encode(array(
            'success' => true,
            'data' => array('id' => (int) $pdo->lastInsertId(), 'slug' => $fields[':slug']),
        ), JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Everything below needs an existing hotel.
    if ($id <= 0) {
        fail(400, 'Missing hotel id');
    }
    $check = $pdo->prepare('SELECT id FROM hotels WHERE id = ? LIMIT 1');
    $check->execute(array($id));
    if (!$check->fetch()) {
        fail(404, 'Hotel not found');
    }

    // --- UPDATE ---
    if ($method === 'PUT') {
        $b = body();
        if (!isset($b['name']) || trim($b['name']) === '') {
            fail(400, 'Hotel name is required');
        }

        $fields = fieldsFromBody($b);
        $fields[':slug'] = uniqueSlug($pdo, makeSlug($b['name']), $id);
        $fields[':id'] = $id;

        $sql = 'UPDATE hotels SET
                    name = :name, slug = :slug, destination = :destination, stars = :stars,
                    description = :description, short_description = :short_description,
                    rating = :rating, review_count = :review_count, main_image = :main_image,
                    amenities = :amenities, check_in_time = :check_in_time,
                    check_out_time = :check_out_time, address = :address,
                    contact_phone = :contact_phone, contact_email = :contact_email,
                    website = :website, is_featured = :is_featured, is_active = :is_active,
                    images = :images, room_types = :room_types
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
        // Rates/notices have no FK cascade, so clear them first. Missing tables
        // (pre-migration) are not an error.
        foreach (array('hotel_rates', 'hotel_notices') as $table) {
            try {
                $pdo->prepare("DELETE FROM $table WHERE hotel_id = ?")->execute(array($id));
            } catch (PDOException $e) {
                // table not migrated yet — nothing to clean up
            }
        }
        $stmt = $pdo->prepare('DELETE FROM hotels WHERE id = ?');
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
