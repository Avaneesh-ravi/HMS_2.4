<?php
require 'api/backend/config/database.php';
$_GET['hospital_id'] = '1';
$_SESSION['hospital_id'] = '1';
ob_start();
include 'api/backend/ajax/get-questions.php';
$output = ob_get_clean();
echo $output;
