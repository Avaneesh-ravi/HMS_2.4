<?php
session_start();
$_SESSION['admin_id'] = 1;
$_SESSION['admin_username'] = '9402654235';
$_SESSION['hospital_id'] = 1;
$_SESSION['role'] = 'Hospital Admin';

require "api/backend/ajax/get-responses.php";
