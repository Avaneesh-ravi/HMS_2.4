<?php
require_once 'api/backend/config/database.php';
$pdo = getDBConnection();
try {
    $sql = "SELECT fs.*, fs.submission_id AS response_id, fs.submission_date AS submitted_at, fs.status AS office_status,
                   p.*, p.first_name AS full_name, p.mobile AS mobile_number, p.p_email as patient_email, p.address as patient_address, p.pin_code as pin_code,
                   cr.review_comments AS complaint_review, cr.review_date, cr.corrective_action, cr.preventive_action, cr.incharge_name
            FROM feedback_submission fs
            JOIN patient p ON p.patient_id = fs.patient_id
            LEFT JOIN complaint_review cr ON cr.submission_id = fs.submission_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "SUCCESS\n";
    print_r(count($res));
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
