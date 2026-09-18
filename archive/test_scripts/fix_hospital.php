<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
$stmt = $pdo->prepare("UPDATE hospital SET name = 'Apollo Healthcare Center', address1 = '123 Health Street, Chennai - 600001' WHERE hospital_id = 1");
$stmt->execute();
echo "Updated.";
