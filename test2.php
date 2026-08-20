<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query('SELECT * FROM hospital_admin');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt = $pdo->query('SELECT * FROM hospital');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
