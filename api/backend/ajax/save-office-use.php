<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
ensureSession();

header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

$responseId = (int) ($_POST['response_id'] ?? $_POST['submission_id'] ?? $_POST['id'] ?? 0);
if (!$responseId) {
    echo json_encode(['success' => false, 'message' => 'Missing response id.']);
    exit;
}

try {
    $pdo = getDBConnection();
    saveOfficeUse($pdo, $responseId, $_POST);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
