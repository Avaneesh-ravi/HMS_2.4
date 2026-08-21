<?php
ini_set('display_errors', '1');
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);

// Robust base directory resolution for both local XAMPP and Vercel Serverless
$baseDir = __DIR__;
if (file_exists(dirname(__DIR__) . '/api/backend')) {
    $baseDir = dirname(__DIR__);
} elseif (file_exists(__DIR__ . '/backend')) {
    $baseDir = __DIR__;
}

$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = trim($requestUri, '/');

// 1. Diagnostic endpoint: /api/info, /info.php, or ?debug=1
if ($path === 'api/info' || $path === 'info.php' || isset($_GET['debug'])) {
    header('Content-Type: text/plain; charset=UTF-8');
    echo "=== HMS System Diagnostic ===\n";
    echo "PHP Version: " . PHP_VERSION . "\n";
    echo "Base Directory: " . $baseDir . "\n";
    echo "Script Directory: " . __DIR__ . "\n";
    echo "Request URI: " . ($requestUri ?: '/') . "\n";
    echo "Loaded Extensions: " . implode(', ', get_loaded_extensions()) . "\n\n";
    echo "Testing Database Connection (PostgreSQL Supabase)...\n";
    try {
        $dbFile = file_exists(__DIR__ . '/backend/config/database.php') 
            ? __DIR__ . '/backend/config/database.php' 
            : $baseDir . '/api/backend/config/database.php';
        require_once $dbFile;
        $pdo = getDBConnection();
        $cnt = $pdo->query('SELECT count(*) FROM hospital')->fetchColumn();
        echo "SUCCESS! Connected to Supabase DB. Total hospitals: $cnt\n";
    } catch (Throwable $e) {
        echo "FAILED to connect to DB: " . $e->getMessage() . "\n";
    }
    exit;
}

// 2. MIME type helper
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

// 3. Static file server
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

// 4. Handle Static Assets (CSS, JS, images, fonts)
if (preg_match('/\.(css|js|map|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|eot)$/i', $path)) {
    $candidates = [
        $baseDir . '/public/' . $path,
        $baseDir . '/frontend/' . $path,
        $baseDir . '/api/frontend/' . $path,
        $baseDir . '/' . $path,
        $baseDir . '/public/' . preg_replace('#^(frontend|public|api/frontend)/#', '', $path),
        $baseDir . '/frontend/' . preg_replace('#^(frontend|public|api/frontend)/#', '', $path),
        __DIR__ . '/frontend/' . $path,
    ];
    foreach ($candidates as $cand) {
        if (is_file($cand)) {
            serveStaticFile($cand);
        }
    }
}

// 5. Handle Uploaded Images
if (strpos($path, 'backend/uploads/') !== false || strpos($path, 'uploads/') !== false) {
    $uploadRel = preg_replace('#^.*uploads/#', '', $path);
    $uploadCandidates = [
        $baseDir . '/api/backend/uploads/' . $uploadRel,
        $baseDir . '/backend/uploads/' . $uploadRel,
        __DIR__ . '/backend/uploads/' . $uploadRel,
    ];
    foreach ($uploadCandidates as $uFile) {
        if (is_file($uFile)) {
            serveStaticFile($uFile);
        }
    }
}

// 6. Handle Root & Index Requests -> Hospital Selection Page
if ($path === '' || $path === 'index.php' || $path === 'index.html' || $path === 'api' || $path === 'api/' || $path === 'api/index.php' || $path === 'api/router.php' || $path === 'router.php') {
    $target = file_exists(__DIR__ . '/frontend/index.php') 
        ? __DIR__ . '/frontend/index.php' 
        : $baseDir . '/api/frontend/index.php';
    if (is_file($target)) {
        chdir(dirname($target));
        try {
            require $target;
        } catch (Throwable $e) {
            http_response_code(500);
            echo "<pre>Application Error: " . htmlspecialchars($e->getMessage()) . "\n" . $e->getTraceAsString() . "</pre>";
        }
        exit;
    }
}

// 7. Handle Direct API & Backend/Frontend PHP Endpoints
$cleanPath = preg_replace('#^api/#', '', $path);
if ($cleanPath === 'index.php' || $cleanPath === 'router.php' || $cleanPath === '') {
    $cleanPath = 'frontend/index.php';
}

$possibleTargets = [
    __DIR__ . '/' . $cleanPath,
    __DIR__ . '/' . $cleanPath . '.php',
    __DIR__ . '/backend/' . $cleanPath . '.php',
    __DIR__ . '/frontend/' . $cleanPath . '.php',
    __DIR__ . '/backend/ajax/' . $cleanPath . '.php',
    __DIR__ . '/backend/process/' . $cleanPath . '.php',
    __DIR__ . '/backend/admin/' . $cleanPath . '.php',
    $baseDir . '/api/' . $cleanPath,
    $baseDir . '/api/' . $cleanPath . '.php',
    $baseDir . '/api/backend/' . $cleanPath . '.php',
    $baseDir . '/api/frontend/' . $cleanPath . '.php',
    $baseDir . '/api/backend/ajax/' . $cleanPath . '.php',
    $baseDir . '/api/backend/process/' . $cleanPath . '.php',
    $baseDir . '/api/backend/admin/' . $cleanPath . '.php',
];

foreach ($possibleTargets as $target) {
    if (is_file($target) && realpath($target) !== realpath(__FILE__)) {
        chdir(dirname($target));
        try {
            require $target;
        } catch (Throwable $e) {
            http_response_code(500);
            if (!headers_sent()) {
                header('Content-Type: application/json; charset=UTF-8');
            }
            echo json_encode([
                'error' => $e->getMessage(),
                'file'  => basename($e->getFile()),
                'line'  => $e->getLine()
            ]);
        }
        exit;
    }
}

// 8. Fallback for SPA routing -> Serve frontend/index.html or public/index.html
$spaCandidates = [
    $baseDir . '/public/index.html',
    $baseDir . '/frontend/index.html',
    __DIR__ . '/frontend/index.html',
];
foreach ($spaCandidates as $spaHtml) {
    if (is_file($spaHtml)) {
        serveStaticFile($spaHtml);
    }
}

// 9. 404 Not Found
http_response_code(404);
header('Content-Type: text/html; charset=UTF-8');
echo '<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;text-align:center;"><h1>404 - Not Found</h1><p>The requested endpoint could not be found.</p><p><a href="/">← Return to Hospital Selection</a></p></body></html>';
exit;
