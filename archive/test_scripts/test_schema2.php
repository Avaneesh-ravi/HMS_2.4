<?php
require_once 'c:/xampp/htdocs/LRL/HMS_V2.2/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query("DESCRIBE hospital");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($columns);
