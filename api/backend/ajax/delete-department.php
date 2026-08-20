<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
ensureSession();

header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

$deptId   = (int)($_POST['department_id'] ?? 0);
$deptName = trim($_POST['department_name'] ?? '');

$hospitalId = (int)($_SESSION['hospital_id'] ?? 0);

try {
    $pdo = getDBConnection();
    
    $rowsDeleted = 0;
    if ($deptId > 0) {
        try {
            $stmt = $pdo->prepare("DELETE FROM department WHERE department_id = ? AND (hospital_id = ? OR hospital_id = 0 OR ? = 0)");
            $stmt->execute([$deptId, $hospitalId, $hospitalId]);
            $rowsDeleted = $stmt->rowCount();
        } catch (PDOException $e) {
            if ($e->getCode() === '23503') { // Foreign key constraint violation
                $stmt = $pdo->prepare("UPDATE department SET is_active = FALSE WHERE department_id = ? AND (hospital_id = ? OR hospital_id = 0 OR ? = 0)");
                $stmt->execute([$deptId, $hospitalId, $hospitalId]);
                $rowsDeleted = $stmt->rowCount();
            } else {
                throw $e;
            }
        }
    } else if (!empty($deptName)) {
        try {
            $stmt = $pdo->prepare("DELETE FROM department WHERE LOWER(department_name) = LOWER(?) AND (hospital_id = ? OR hospital_id = 0 OR ? = 0)");
            $stmt->execute([$deptName, $hospitalId, $hospitalId]);
            $rowsDeleted = $stmt->rowCount();
        } catch (PDOException $e) {
            if ($e->getCode() === '23503') { // Foreign key constraint violation
                $stmt = $pdo->prepare("UPDATE department SET is_active = FALSE WHERE LOWER(department_name) = LOWER(?) AND (hospital_id = ? OR hospital_id = 0 OR ? = 0)");
                $stmt->execute([$deptName, $hospitalId, $hospitalId]);
                $rowsDeleted = $stmt->rowCount();
            } else {
                throw $e;
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing department ID or name.']);
        exit;
    }

    $realSuccess = $rowsDeleted > 0;
    
    // Quick local check if it failed due to hospital_id mismatch
    $actualDbHospitalId = null;
    if (!$realSuccess && $deptId > 0) {
        $chk = $pdo->prepare("SELECT hospital_id FROM department WHERE department_id = ?");
        $chk->execute([$deptId]);
        $actualDbHospitalId = $chk->fetchColumn();
    }

    echo json_encode([
        'success' => $realSuccess,
        'rows_deleted' => $rowsDeleted,
        'received_department_id' => $deptId,
        'received_hospital_id' => $hospitalId,
        'db_actual_hospital_id' => $actualDbHospitalId,
        'message' => $realSuccess ? 'Department deleted successfully.' : 'No rows affected - mismatch ID'
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
