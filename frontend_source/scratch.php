<?php
require __DIR__.'/../api/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query("SELECT column_name, data_type, character_maximum_length, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='patient'");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
