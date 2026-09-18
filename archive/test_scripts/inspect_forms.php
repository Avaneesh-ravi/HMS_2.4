<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query("SELECT * FROM feedback_form WHERE hospital_id = 1");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
