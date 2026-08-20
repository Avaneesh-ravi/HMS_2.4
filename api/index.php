<?php
// API Router - routes requests to the appropriate backend or frontend API endpoints

$baseDir = __DIR__;
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = trim($path, '/');

// Remove 'api/' prefix if present
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// Security: prevent directory traversal
$path = str_replace('..', '', $path);

if ($path === '' || $path === 'api') {
    // Root API request - return API info
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'message' => 'HMS API Server',
        'version' => '2.0'
    ]);
    exit;
}

// Try to route to backend or frontend API files
$backendTarget = $baseDir . '/backend/' . $path;
$frontendTarget = $baseDir . '/frontend/' . $path;

// Ensure .php extension
if (!str_ends_with($backendTarget, '.php')) {
    $backendTarget .= '.php';
}
if (!str_ends_with($frontendTarget, '.php')) {
    $frontendTarget .= '.php';
}

// Route to the appropriate file
if (is_file($backendTarget)) {
    require $backendTarget;
    exit;
} elseif (is_file($frontendTarget)) {
    require $frontendTarget;
    exit;
}

// Not found
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Endpoint not found: ' . $path]);
exit;

