<?php
require_once 'c:/xampp/htdocs/LRL/HMS_V2.2/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query('SELECT email, username, role FROM system_admin UNION SELECT email, username, role FROM hospital_admin');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
