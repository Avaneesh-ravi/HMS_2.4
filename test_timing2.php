<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 

$start = microtime(true);
$sql = "SELECT fs.*, fs.submission_id AS response_id, fs.submission_date AS submitted_at, p.first_name as full_name
        FROM feedback_submission fs
        JOIN patient p ON p.patient_id = fs.patient_id
        WHERE fs.hospital_id = 1 ORDER BY fs.submission_date DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$responses = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($responses as $row) {
    $rStmt = $pdo->prepare("SELECT r.* FROM ratings r WHERE r.patient_id = ?"); $rStmt->execute([$row['patient_id']]); $rStmt->fetchAll();
    $yStmt = $pdo->prepare("SELECT y.* FROM yesno_answer y WHERE y.submission_id = ?"); $yStmt->execute([$row['submission_id']]); $yStmt->fetchAll();
    $sStmt = $pdo->prepare("SELECT * FROM suggestion WHERE submission_id = ?"); $sStmt->execute([$row['submission_id']]); $sStmt->fetch();
    $aStmt = $pdo->prepare("SELECT * FROM appreciation WHERE submission_id = ?"); $aStmt->execute([$row['submission_id']]); $aStmt->fetchAll();
}
$end = microtime(true);
echo "Took: " . ($end - $start) . " seconds for " . count($responses) . " responses.\n";
