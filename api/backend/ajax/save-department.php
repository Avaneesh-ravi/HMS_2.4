<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
ensureSession();

header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authorized.']);
    exit;
}

$deptId = (int)($_POST['department_id'] ?? 0);
$deptName = trim($_POST['department_name'] ?? '');
if (empty($deptName)) {
    echo json_encode(['success' => false, 'message' => 'Department name is required.']);
    exit;
}

$hospitalId = (int)($_SESSION['hospital_id'] ?? 0);

try {
    $pdo = getDBConnection();

    if ($deptId > 0) {
        // Check if name collides with another department
        $chk = $pdo->prepare("SELECT department_id FROM department WHERE LOWER(department_name) = LOWER(?) AND department_id != ? AND (hospital_id = ? OR hospital_id = 0 OR ? = 0)");
        $chk->execute([$deptName, $deptId, $hospitalId, $hospitalId]);
        if ($chk->fetchColumn()) {
            echo json_encode(['success' => false, 'message' => 'Another department with this name already exists.']);
            exit;
        }

        if (isset($_POST['is_active'])) {
            $isActive = (int)$_POST['is_active'] === 1 ? 'TRUE' : 'FALSE';
            $stmt = $pdo->prepare("UPDATE department SET department_name = ?, is_active = $isActive WHERE department_id = ? AND (hospital_id = ? OR hospital_id = 0 OR ? = 0)");
        } else {
            $stmt = $pdo->prepare("UPDATE department SET department_name = ? WHERE department_id = ? AND (hospital_id = ? OR hospital_id = 0 OR ? = 0)");
        }
        $stmt->execute([$deptName, $deptId, $hospitalId, $hospitalId]);

        echo json_encode([
            'success' => true,
            'message' => 'Department updated successfully.',
            'department' => ['department_id' => $deptId, 'department_name' => $deptName]
        ]);
        exit;
    }

    // Insert new department: Check if already exists for this hospital
    $chk = $pdo->prepare("SELECT department_id FROM department WHERE LOWER(department_name) = LOWER(?) AND (hospital_id = ? OR hospital_id = 0) AND is_active = TRUE");
    $chk->execute([$deptName, $hospitalId]);
    $existingId = $chk->fetchColumn();

    if ($existingId) {
        echo json_encode([
            'success' => true,
            'message' => 'Department already exists.',
            'department' => ['department_id' => $existingId, 'department_name' => $deptName]
        ]);
        exit;
    }

    $insertHospitalId = ($hospitalId > 0) ? $hospitalId : 1;
    $stmt = $pdo->prepare("INSERT INTO department (department_name, hospital_id, is_active) VALUES (?, ?, TRUE) RETURNING department_id, department_name, department_code");
    $stmt->execute([$deptName, $insertHospitalId]);
    $newDept = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Department added successfully.',
        'department' => $newDept
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
