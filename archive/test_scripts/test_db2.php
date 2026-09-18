<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
print_r($pdo->query("SELECT question_en FROM yesno_question")->fetchAll(PDO::FETCH_ASSOC));
