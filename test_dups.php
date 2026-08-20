<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
print_r($pdo->query("SELECT question_id, COUNT(*) FROM ratings WHERE patient_id=11 GROUP BY question_id")->fetchAll(PDO::FETCH_ASSOC));
