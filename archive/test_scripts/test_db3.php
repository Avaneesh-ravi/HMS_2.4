<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
print_r($pdo->query("SELECT feedback_form_id FROM feedback_submission LIMIT 5")->fetchAll(PDO::FETCH_ASSOC));
