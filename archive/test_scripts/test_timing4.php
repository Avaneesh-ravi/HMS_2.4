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

    if (!empty($responses)) {
        $submissionIds = array_column($responses, 'submission_id');
        $patientIds = array_unique(array_column($responses, 'patient_id'));
        
        $inSubQuery = implode(',', array_map('intval', $submissionIds));
        $inPatQuery = implode(',', array_map('intval', $patientIds));
        
        $rStmt = $pdo->query("SELECT r.*, q.question_text_en as question_text FROM ratings r LEFT JOIN rating_question q ON (r.question_id = q.question_id) WHERE r.patient_id IN ($inPatQuery)");
        $allRatings = $rStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $yStmt = $pdo->query("SELECT y.*, q.question_en as question_text FROM yesno_answer y LEFT JOIN yesno_question q ON (y.yesno_question_id = q.yesno_question_id) WHERE y.submission_id IN ($inSubQuery)");
        $allYesNo = $yStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $sStmt = $pdo->query("SELECT * FROM suggestion WHERE submission_id IN ($inSubQuery)");
        $allSuggestions = $sStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $aStmt = $pdo->query("SELECT * FROM appreciation WHERE submission_id IN ($inSubQuery)");
        $allAppreciations = $aStmt->fetchAll(PDO::FETCH_ASSOC);
    }
$end = microtime(true);
echo "Took: " . ($end - $start) . " seconds for " . count($responses) . " responses.\n";
