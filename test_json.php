<?php
require_once 'c:/xampp/htdocs/LRL/HMS_V2.2/backend/config/database.php';
$pdo = getDBConnection();
$hospitalId = 1;

$params = [];
$sql = "SELECT fs.*, fs.submission_id AS response_id, fs.submission_date AS submitted_at, fs.status AS office_status,
               p.*, p.first_name AS full_name, p.mobile AS mobile_number, p.p_email as patient_email, p.address as patient_address,
               cr.review_comments AS complaint_review, cr.review_date, cr.corrective_action, cr.preventive_action, cr.incharge_name
        FROM feedback_submission fs
        JOIN patient p ON p.patient_id = fs.patient_id
        LEFT JOIN complaint_review cr ON cr.submission_id = fs.submission_id";
        
if ($hospitalId > 0) {
    $sql .= " WHERE fs.hospital_id = :hid";
    $params[':hid'] = $hospitalId;
}

$sql .= " ORDER BY fs.submission_date DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$responses = $stmt->fetchAll(PDO::FETCH_ASSOC);

$fullResponses = [];

foreach ($responses as $row) {
    // Fetch ratings
    $rStmt = $pdo->prepare("SELECT * FROM ratings WHERE patient_id = ?");
    $rStmt->execute([$row['patient_id']]);
    $ratingsRaw = $rStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch yesno answers
    $yStmt = $pdo->prepare("SELECT * FROM yesno_answer WHERE submission_id = ?");
    $yStmt->execute([$row['submission_id']]);
    $yesnoRaw = $yStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch suggestion
    $sStmt = $pdo->prepare("SELECT * FROM suggestion WHERE submission_id = ?");
    $sStmt->execute([$row['submission_id']]);
    $suggestion = $sStmt->fetch(PDO::FETCH_ASSOC);
    
    // Fetch appreciation
    $aStmt = $pdo->prepare("SELECT * FROM appreciation WHERE submission_id = ?");
    $aStmt->execute([$row['submission_id']]);
    $appreciationRaw = $aStmt->fetchAll(PDO::FETCH_ASSOC);

    $fullResponses[] = [
        'id' => $row['submission_id'],
        'uhid' => $row['uhid'] ?: 'N/A',
        'patientName' => $row['full_name'],
        'date' => date('d/m/Y', strtotime($row['submitted_at'])),
        'visitType' => $row['visit_type'],
        'mobile' => $row['mobile_number'],
        'email' => $row['patient_email'] ?? '',
        'address' => $row['patient_address'] ?? '',
        'city' => $row['city'] ?? '',
        'state' => $row['state'] ?? '',
        'pincode' => $row['pin_code'] ?? '',
        'country' => $row['country'] ?? '',
        'opNumber' => $row['op_no'] ?? '',
        'ipNumber' => $row['ip_no'] ?? '',
        'admissionDate' => $row['admission_date'] ?? '',
        'dischargeDate' => $row['discharge_date'] ?? '',
        'overallRating' => 5, // Compute if needed
        'wouldRecommend' => true, // Compute if needed
        'suggestions' => $suggestion ? $suggestion['suggestion_text'] : '',
        'rawRatings' => $ratingsRaw,
        'rawYesNo' => $yesnoRaw,
        'rawAppreciations' => $appreciationRaw,
        'officeUse' => [
            'status' => $row['office_status'],
            'reviewOfComplaint' => $row['complaint_review'] ?? '',
            'dateOfReview' => $row['review_date'] ?? '',
            'correctiveAction' => $row['corrective_action'] ?? '',
            'preventiveAction' => $row['preventive_action'] ?? '',
            'inchargeName' => $row['incharge_name'] ?? ''
        ]
    ];
}

echo json_encode(['success' => true, 'data' => $fullResponses]);
