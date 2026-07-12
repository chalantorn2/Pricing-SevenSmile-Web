<?php
// api/hotels-sync.php
// Pulls every hotel from indosmilesouthservices.com public_hotels.php and upserts
// it into our own `hotels` table (keyed on source_id). Triggered by the "Sync"
// button on the admin Hotels page. POST only.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'error' => 'Method not allowed. Use POST to sync.'));
    exit;
}

// Syncing downloads up to ~1500 gallery images on the first run, so give it
// room. Downloads are idempotent (existing files are skipped), so if a gateway
// timeout cuts the request, clicking Sync again resumes quickly.
@set_time_limit(0);
@ini_set('max_execution_time', '0');

// --- Source API (indosmilesouthservices.com) ---
$SOURCE_BASE = 'https://indosmilesouthservices.com';
$SOURCE_API  = $SOURCE_BASE . '/backend/api/public_hotels.php';
$SOURCE_KEY  = 'indosmile_sevensmile_2026_1703';
$PAGE_LIMIT  = 50;

// --- Where downloaded images are stored / served from ---
$UPLOAD_DIR  = __DIR__ . '/uploads/hotels';                                  // filesystem
$LOCAL_BASE  = 'https://contactrate.sevensmiletourandticket.com/api/uploads/hotels'; // public URL

// --- Our DB ---
$host = 'localhost';
$dbname = 'sevensmile_contactrate';
$username = 'sevensmile_contactrate';
$password = 'contactrate2025';

// Turn a possibly-relative source path into an absolute URL.
function absUrl($path, $base)
{
    if ($path === null || $path === '') {
        return null;
    }
    if (strpos($path, 'http://') === 0 || strpos($path, 'https://') === 0) {
        return $path;
    }
    return $base . '/' . ltrim($path, '/');
}

// Download a source image into our uploads dir and return OUR public URL.
// Idempotent: a file already on disk is reused (no re-download). If the
// download fails we fall back to the source URL so the image still shows.
function localizeImage($srcUrl, $sourceId, $uploadDir, $localBase)
{
    if ($srcUrl === null || $srcUrl === '') {
        return null;
    }

    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    $path = parse_url($srcUrl, PHP_URL_PATH);
    $base = $path ? basename($path) : '';
    $base = preg_replace('/[^A-Za-z0-9._-]/', '', $base);
    if ($base === '') {
        $base = md5($srcUrl) . '.jpg';
    }
    // Prefix with source id to avoid cross-hotel filename collisions.
    $fname = $sourceId . '_' . $base;
    $dest = $uploadDir . '/' . $fname;

    if (file_exists($dest) && filesize($dest) > 0) {
        return $localBase . '/' . $fname;
    }

    $fp = @fopen($dest, 'wb');
    if (!$fp) {
        return $srcUrl;
    }
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $srcUrl);
    curl_setopt($ch, CURLOPT_FILE, $fp);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $ok = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    fclose($fp);

    if (!$ok || $code !== 200 || !file_exists($dest) || filesize($dest) === 0) {
        @unlink($dest);
        return $srcUrl; // fall back to hotlink
    }

    return $localBase . '/' . $fname;
}

// Fetch one page from the source API. Returns decoded array or throws.
function fetchPage($url, $key)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('X-API-Key: ' . $key));
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        throw new Exception('Source request failed: ' . $err);
    }
    if ($code !== 200) {
        throw new Exception('Source returned HTTP ' . $code);
    }
    $json = json_decode($body, true);
    if (!is_array($json) || empty($json['success'])) {
        throw new Exception('Unexpected source response');
    }
    return $json;
}

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ));

    $checkStmt = $pdo->prepare('SELECT id FROM hotels WHERE source_id = ?');

    $upsert = $pdo->prepare(
        'INSERT INTO hotels
            (source_id, name, slug, destination, stars, description, short_description,
             rating, review_count, main_image, amenities, check_in_time, check_out_time,
             address, contact_phone, contact_email, website, is_featured, is_active,
             images, room_types, source_created_at, source_updated_at, synced_at)
         VALUES
            (:source_id, :name, :slug, :destination, :stars, :description, :short_description,
             :rating, :review_count, :main_image, :amenities, :check_in_time, :check_out_time,
             :address, :contact_phone, :contact_email, :website, :is_featured, :is_active,
             :images, :room_types, :source_created_at, :source_updated_at, :synced_at)
         ON DUPLICATE KEY UPDATE
            name = VALUES(name), slug = VALUES(slug), destination = VALUES(destination),
            stars = VALUES(stars), description = VALUES(description),
            short_description = VALUES(short_description), rating = VALUES(rating),
            review_count = VALUES(review_count), main_image = VALUES(main_image),
            amenities = VALUES(amenities), check_in_time = VALUES(check_in_time),
            check_out_time = VALUES(check_out_time), address = VALUES(address),
            contact_phone = VALUES(contact_phone), contact_email = VALUES(contact_email),
            website = VALUES(website), is_featured = VALUES(is_featured),
            is_active = VALUES(is_active), images = VALUES(images),
            room_types = VALUES(room_types), source_created_at = VALUES(source_created_at),
            source_updated_at = VALUES(source_updated_at), synced_at = VALUES(synced_at)'
    );

    $now = date('Y-m-d H:i:s');
    $inserted = 0;
    $updated = 0;
    $page = 1;
    $totalItems = 0;

    do {
        $url = $SOURCE_API . '?page=' . $page . '&limit=' . $PAGE_LIMIT;
        $json = fetchPage($url, $SOURCE_KEY);

        $items = isset($json['data']['items']) ? $json['data']['items'] : array();
        $pagination = isset($json['data']['pagination']) ? $json['data']['pagination'] : array();
        $hasNext = !empty($pagination['has_next']);

        foreach ($items as $h) {
            $sourceId = isset($h['id']) ? (int) $h['id'] : null;
            if (!$sourceId) {
                continue;
            }

            $checkStmt->execute(array($sourceId));
            $exists = $checkStmt->fetchColumn();

            // Download main image into our server.
            $mainSrc = absUrl(isset($h['main_image']) ? $h['main_image'] : null, $SOURCE_BASE);
            $mainLocal = localizeImage($mainSrc, $sourceId, $UPLOAD_DIR, $LOCAL_BASE);

            // Download each gallery image, keeping the original object shape
            // (image_url, category, caption, sort_order) so the detail page can
            // group images by category / room type just like the source site.
            $localImages = array();
            if (isset($h['images']) && is_array($h['images'])) {
                foreach ($h['images'] as $img) {
                    if (is_array($img)) {
                        $imgPath = isset($img['image_url']) ? $img['image_url']
                            : (isset($img['url']) ? $img['url']
                            : (isset($img['path']) ? $img['path'] : null));
                        $imgSrc = absUrl($imgPath, $SOURCE_BASE);
                        $imgLocal = localizeImage($imgSrc, $sourceId, $UPLOAD_DIR, $LOCAL_BASE);
                        $img['image_url'] = $imgLocal !== null ? $imgLocal : $imgSrc;
                        $localImages[] = $img;
                    } else {
                        $imgSrc = absUrl($img, $SOURCE_BASE);
                        $imgLocal = localizeImage($imgSrc, $sourceId, $UPLOAD_DIR, $LOCAL_BASE);
                        if ($imgLocal !== null) {
                            $localImages[] = array('image_url' => $imgLocal, 'category' => 'Uncategorized', 'caption' => '');
                        }
                    }
                }
            }

            $upsert->execute(array(
                ':source_id'         => $sourceId,
                ':name'              => isset($h['name']) ? $h['name'] : '',
                ':slug'              => isset($h['slug']) ? $h['slug'] : '',
                ':destination'       => isset($h['destination']) ? $h['destination'] : null,
                ':stars'             => isset($h['stars']) ? $h['stars'] : null,
                ':description'       => isset($h['description']) ? $h['description'] : null,
                ':short_description' => isset($h['short_description']) ? $h['short_description'] : null,
                ':rating'            => isset($h['rating']) ? $h['rating'] : null,
                ':review_count'      => isset($h['review_count']) ? (int) $h['review_count'] : 0,
                ':main_image'        => $mainLocal,
                ':amenities'         => isset($h['amenities']) ? json_encode($h['amenities'], JSON_UNESCAPED_UNICODE) : null,
                ':check_in_time'     => isset($h['check_in_time']) ? $h['check_in_time'] : null,
                ':check_out_time'    => isset($h['check_out_time']) ? $h['check_out_time'] : null,
                ':address'           => isset($h['address']) ? $h['address'] : null,
                ':contact_phone'     => isset($h['contact_phone']) ? $h['contact_phone'] : null,
                ':contact_email'     => isset($h['contact_email']) ? $h['contact_email'] : null,
                ':website'           => isset($h['website']) ? $h['website'] : null,
                ':is_featured'       => isset($h['is_featured']) ? (int) $h['is_featured'] : 0,
                ':is_active'         => isset($h['is_active']) ? (int) $h['is_active'] : 1,
                ':images'            => json_encode($localImages, JSON_UNESCAPED_UNICODE),
                ':room_types'        => isset($h['room_types']) ? json_encode($h['room_types'], JSON_UNESCAPED_UNICODE) : null,
                ':source_created_at' => isset($h['created_at']) ? $h['created_at'] : null,
                ':source_updated_at' => isset($h['updated_at']) ? $h['updated_at'] : null,
                ':synced_at'         => $now,
            ));

            if ($exists) {
                $updated++;
            } else {
                $inserted++;
            }
            $totalItems++;
        }

        $page++;
        // Safety stop in case has_next is missing but items keep coming.
        if ($page > 1000) {
            break;
        }
    } while ($hasNext && count($items) > 0);

    echo json_encode(array(
        'success'   => true,
        'inserted'  => $inserted,
        'updated'   => $updated,
        'total'     => $totalItems,
        'synced_at' => $now,
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Sync failed: ' . $e->getMessage()));
}
