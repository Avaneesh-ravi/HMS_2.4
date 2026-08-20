<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');

if (!isset($_GET['uhid']) || empty($_GET['uhid'])) {
    echo json_encode(['success' => false, 'message' => 'UHID is required']);
    exit;
}

$uhid = clean($_GET['uhid']);
$hospitalId = isset($_GET['hospital_id']) ? (int)$_GET['hospital_id'] : 1;

try {
    $pdo = getDBConnection();
    // Get the most recent patient record for this UHID
    $stmt = $pdo->prepare("SELECT * FROM patient WHERE uhid = ? ORDER BY patient_id DESC LIMIT 1");
    $stmt->execute([$uhid]);
    $patient = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($patient) {
        echo json_encode([
            'success' => true,
            'data' => [
                'firstName' => $patient['first_name'] ?? '',
                'lastName' => '', // Assuming full_name is in first_name, or we just map it
                'age' => $patient['age'] ?? '',
                'gender' => $patient['gender'] ?? '',
                'mobile' => $patient['mobile'] ?? '',
                'email' => $patient['p_email'] ?? '',
                'address' => $patient['address'] ?? '',
                'pincode' => $patient['pin_code'] ?? '',
                'city' => $patient['city'] ?? '',
                'state' => $patient['state'] ?? 'Tamil Nadu',
                'country' => $patient['country'] ?? 'India'
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Patient not found']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
