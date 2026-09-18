<?php
require_once 'c:/xampp/htdocs/LRL/HMS_V2.2/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query('SELECT * FROM feedback_submission');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
