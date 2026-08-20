<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();
$stmt = $pdo->query("SELECT * FROM feedback_form_rating_question WHERE feedback_form_id = 3");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt2 = $pdo->query("SELECT * FROM yesno_question WHERE feedback_form_id = 3 AND status = 'Active'");
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
