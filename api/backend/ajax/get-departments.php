<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
ensureSession();

header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

$hospitalId = (int)($_SESSION['hospital_id'] ?? 0);

try {
    $pdo = getDBConnection();
    if ($hospitalId > 0) {
        $stmt = $pdo->prepare("SELECT department_id, department_name, department_code, is_active FROM department WHERE (hospital_id = ? OR hospital_id = 0) AND is_active = TRUE ORDER BY department_name ASC");
        $stmt->execute([$hospitalId]);
    } else {
        // Super Admin (hospital_id = 0): fetch all active departments across hospitals
        $stmt = $pdo->prepare("SELECT department_id, department_name, department_code, is_active FROM department WHERE is_active = TRUE ORDER BY department_name ASC");
        $stmt->execute();
    }
    $depts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'departments' => $depts
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
