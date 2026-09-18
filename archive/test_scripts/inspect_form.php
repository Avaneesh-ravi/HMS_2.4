<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();
$hospitalId = 1;
$stmt = $pdo->prepare("SELECT feedback_form_id FROM feedback_form WHERE hospital_id = ? LIMIT 1");
$stmt->execute([$hospitalId]);
$formId = $stmt->fetchColumn();
echo "Form ID for Hospital 1: " . $formId . "\n";
