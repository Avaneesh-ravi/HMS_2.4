<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
ensureSession();

header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

$raw = file_get_contents('php://input');
$json = json_decode($raw, true);
$data = array_merge($_POST, is_array($json) ? $json : []);

$responseId = (int) ($data['response_id'] ?? $data['submission_id'] ?? $data['id'] ?? 0);
$uhid = trim($data['uhid'] ?? '');

try {
    $pdo = getDBConnection();
    if (!$responseId && !empty($uhid)) {
        $stmt = $pdo->prepare("
            SELECT fs.submission_id 
            FROM feedback_submission fs 
            JOIN patient p ON fs.patient_id = p.patient_id 
            WHERE p.uhid = ? 
            ORDER BY fs.submission_id DESC LIMIT 1
        ");
        $stmt->execute([$uhid]);
        $responseId = (int) $stmt->fetchColumn();
    }

    if (!$responseId) {
        echo json_encode(['success' => false, 'message' => 'Missing response or submission ID.']);
        exit;
    }

    saveOfficeUse($pdo, $responseId, $data);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
