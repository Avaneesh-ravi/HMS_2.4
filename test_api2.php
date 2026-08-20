<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
$stmt = $pdo->prepare("SELECT r.*, q.question_text_en as question_text FROM ratings r LEFT JOIN rating_question q ON (r.question_id = q.question_id) WHERE r.patient_id = ? AND r.feedback_form_id = ? AND CAST(r.created_at AS DATE) = CAST(? AS DATE)");
$stmt->execute([11, 1, '2026-07-31 06:44:46']);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
