<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query("SELECT * FROM yesno_question");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
