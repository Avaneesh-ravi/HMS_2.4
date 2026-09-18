<?php
require 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/config/database.php'; 
$pdo=getDBConnection(); 
try {
    $stmt = $pdo->prepare("SELECT DATE(?)");
    $stmt->execute(['2026-07-31 06:44:46']);
    print_r($stmt->fetchAll());
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
