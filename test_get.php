<?php
$ch = curl_init('http://localhost:8081/LRL/HMS_V2.2/backend/ajax/get-questions.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);
