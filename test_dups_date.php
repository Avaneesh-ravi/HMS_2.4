<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
$stmt = $pdo->query("
    SELECT patient_id, question_id, count(*) as cnt 
    FROM ratings 
    GROUP BY patient_id, question_id, DATE(created_at) 
    HAVING cnt > 1 
    LIMIT 5
");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
