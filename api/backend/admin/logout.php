<?php
require_once __DIR__ . '/' . '../includes/functions.php';
session_start();
session_unset();
session_destroy();

setcookie('hms_admin_auth', '', time() - 3600, '/');
setcookie('hms_admin_token', '', time() - 3600, '/');
setcookie('hms_hospital_id', '', time() - 3600, '/');

header('Location: login.php');
exit;
