<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query("SELECT column_name FROM information_schema.columns WHERE table_name = 'hospital'");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
