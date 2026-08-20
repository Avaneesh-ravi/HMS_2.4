<?php
session_start();
$_SESSION['admin_id'] = 1;
$_SESSION['hospital_id'] = 0; // Super admin
$_SESSION['role'] = 'System Admin';

// include the file directly
require "api/backend/ajax/get-responses.php";
