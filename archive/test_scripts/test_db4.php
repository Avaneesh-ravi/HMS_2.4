<?php
require 'HMS_V2.2/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query('DESCRIBE hospital');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
