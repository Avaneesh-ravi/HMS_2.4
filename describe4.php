<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
print_r($pdo->query("SELECT column_name FROM information_schema.columns WHERE table_name = 'yesno_answer'")->fetchAll(PDO::FETCH_ASSOC));
