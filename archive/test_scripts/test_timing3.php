<?php
$_SESSION['admin_id'] = 1;
$_SESSION['hospital_id'] = 1;
$start = microtime(true);
require 'C:/xampp/htdocs/HMS_V6 .1/HMS_V2.2/api/backend/ajax/get-responses.php';
$end = microtime(true);
echo "\nTook: " . ($end - $start) . " seconds\n";
