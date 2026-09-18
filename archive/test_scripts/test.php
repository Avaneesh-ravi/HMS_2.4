<?php
require 'backend/includes/functions.php';
require 'backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query('DESCRIBE yesno_question');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
