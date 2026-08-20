<?php
session_start();
$_SESSION['admin_id'] = 1;
$_SESSION['hospital_id'] = 1;
ob_start();
include 'c:/xampp/htdocs/LRL/HMS_V2.2/backend/ajax/get-responses.php';
$json = ob_get_clean();
$data = json_decode($json, true);
echo $data ? "JSON valid, success=" . ($data['success'] ? 'true' : 'false') : "JSON INVALID";
echo "\n";
echo "Output: " . substr($json, 0, 500) . "...";
