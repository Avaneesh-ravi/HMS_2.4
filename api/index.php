<?php
ini_set('display_errors', '1');
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);

$rootDir = dirname(__DIR__);

// Debug endpoint: /api/info or /info.php or /?debug=1
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = trim($requestUri, '/');

if ($path === 'api/info' || $path === 'info.php' || isset($_GET['debug'])) {
    header('Content-Type: text/plain');
    echo "=== HMS Diagnostic Info ===\n";
    echo "PHP Version: " . PHP_VERSION . "\n";
    echo "Loaded Extensions: " . implode(', ', get_loaded_extensions()) . "\n\n";
    echo "Testing Database Connection (PostgreSQL Supabase)...\n";
    try {
        require_once __DIR__ . '/backend/config/database.php';
        $pdo = getDBConnection();
        $cnt = $pdo->query('SELECT count(*) FROM hospital')->fetchColumn();
        echo "SUCCESS! Connected to Supabase DB. Total hospitals: $cnt\n";
    } catch (Throwable $e) {
        echo "FAILED to connect to DB: " . $e->getMessage() . "\n";
    }
    exit;
}

// Helper function to get file MIME type
function getMimeType($file) {
    $mimes = [
        'html' => 'text/html; charset=UTF-8',
        'css'  => 'text/css; charset=UTF-8',
        'js'   => 'application/javascript; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'ttf'  => 'font/ttf',
        'eot'  => 'application/vnd.ms-fontobject',
        'ico'  => 'image/x-icon',
    ];
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    return $mimes[$ext] ?? 'application/octet-stream';
}

// Helper function to serve a static file
function serveStaticFile($file) {
    if (file_exists($file) && is_file($file)) {
        header('Content-Type: ' . getMimeType($file));
        if (pathinfo($file, PATHINFO_EXTENSION) === 'html') {
            header('Cache-Control: no-cache, no-store, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');
        } else {
            header('Cache-Control: public, max-age=31536000, immutable');
        }
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    }
    return false;
}

// 1. Handle Static Assets (assets/..., frontend/assets/..., css/..., js/...)
if (preg_match('/\.(css|js|map|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot)$/i', $path)) {
    $candidates = [
        $rootDir . '/public/' . $path,
        $rootDir . '/frontend/' . $path,
        $rootDir . '/' . $path,
        $rootDir . '/public/' . preg_replace('#^(frontend|public)/#', '', $path),
        $rootDir . '/frontend/' . preg_replace('#^(frontend|public)/#', '', $path),
    ];
    foreach ($candidates as $cand) {
        if (is_file($cand)) {
            serveStaticFile($cand);
        }
    }
}

// 2. Handle Backend Uploads
if (strpos($path, 'backend/uploads/') !== false || strpos($path, 'api/backend/uploads/') !== false) {
    $uploadRel = preg_replace('#^.*backend/uploads/#', '', $path);
    $uploadCandidates = [
        $rootDir . '/backend/uploads/' . $uploadRel,
        $rootDir . '/api/backend/uploads/' . $uploadRel,
    ];
    foreach ($uploadCandidates as $uFile) {
        if (is_file($uFile)) {
            serveStaticFile($uFile);
        }
    }
}

// 3. Handle Root & Index Requests -> Hospital Selection Page
if ($path === '' || $path === 'index.php' || $path === 'index.html' || $path === 'api/index.php' || $path === 'api/router.php' || $path === 'router.php') {
    $target = __DIR__ . '/frontend/index.php';
    if (is_file($target)) {
        chdir(dirname($target));
        try {
            require $target;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo "<pre>Error: " . htmlspecialchars($e->getMessage()) . "\n" . $e->getTraceAsString() . "</pre>";
        }
        exit;
    }
}

// 4. Handle Direct API / PHP Requests
if (strpos($path, 'api/') === 0 || strpos($path, 'backend/') === 0 || strpos($path, 'frontend/') === 0) {
    $cleanPath = preg_replace('#^api/#', '', $path);
    
    if ($cleanPath === 'index.php' || $cleanPath === 'router.php' || $cleanPath === '') {
        $cleanPath = 'frontend/index.php';
    }

    $target = $rootDir . '/api/' . $cleanPath;
    if (!str_ends_with($target, '.php') && !is_dir($target)) {
        $target .= '.php';
    }

    if (!is_file($target)) {
        if (is_file($rootDir . '/api/backend/' . $cleanPath . '.php')) {
            $target = $rootDir . '/api/backend/' . $cleanPath . '.php';
        } elseif (is_file($rootDir . '/api/frontend/' . $cleanPath . '.php')) {
            $target = $rootDir . '/api/frontend/' . $cleanPath . '.php';
        } elseif (is_file($rootDir . '/api/' . $cleanPath . '/index.php')) {
            $target = $rootDir . '/api/' . $cleanPath . '/index.php';
        }
    }

    if (is_file($target) && realpath($target) !== realpath(__FILE__)) {
        chdir(dirname($target));
        try {
            require $target;
        } catch (\Throwable $e) {
            http_response_code(500);
            if (!headers_sent()) {
                header('Content-Type: application/json');
            }
            echo json_encode(['error' => $e->getMessage(), 'file' => basename($e->getFile()), 'line' => $e->getLine()]);
        }
        exit;
    }
}

// 5. Fallback for SPA routing -> Serve frontend/index.html or public/index.html
$spaCandidates = [
    $rootDir . '/public/index.html',
    $rootDir . '/frontend/index.html',
];
foreach ($spaCandidates as $spaHtml) {
    if (is_file($spaHtml)) {
        serveStaticFile($spaHtml);
    }
}

// 6. 404 Fallback
http_response_code(404);
header('Content-Type: text/html; charset=UTF-8');
echo '<!DOCTYPE html><html><body><h1>404 - Not Found</h1><p>The requested endpoint could not be found.</p></body></html>';
exit;
