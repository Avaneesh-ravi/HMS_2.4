<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
    $params = [];
    $sql = "SELECT fs.*, fs.submission_id AS response_id, fs.submission_date AS submitted_at, fs.status AS office_status,
                   p.*, p.first_name AS full_name, p.mobile AS mobile_number, p.p_email as patient_email, p.address as patient_address, p.pin_code as pin_code,
                   cr.review_comments AS complaint_review, cr.review_date, cr.corrective_action, cr.preventive_action, cr.incharge_name
            FROM feedback_submission fs
            JOIN patient p ON p.patient_id = fs.patient_id
            LEFT JOIN complaint_review cr ON cr.submission_id = fs.submission_id";
    $sql .= " WHERE fs.hospital_id = :hid";
    $params[':hid'] = 1;
    $sql .= " ORDER BY fs.submission_date DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $responses = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r(count($responses));
