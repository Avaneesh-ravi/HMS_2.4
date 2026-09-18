<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query("SELECT * FROM rating_question WHERE question_id IN (1, 28, 29)");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
