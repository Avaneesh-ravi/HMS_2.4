<?php
$_SESSION['admin_id'] = 1;
$_SESSION['hospital_id'] = 1;
$_SERVER['REQUEST_METHOD'] = 'POST';

// Mock file_get_contents('php://input')? No, better to directly include it but override the input.
$json = json_encode([
    'questions' => [
        [
            'id' => '1',
            'category' => 'overall',
            'label' => 'Test',
            'tamilLabel' => 'Test TA',
            'ratingMode' => 'emoji',
            'backgroundColor' => ''
        ]
    ]
]);

$ch = curl_init('http://localhost:8081/LRL/HMS_V2.2/backend/ajax/save-questions.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
// Pass session cookie if needed, but since we can't easily, let's just temporarily disable session check in save-questions.php
$res = curl_exec($ch);
echo $res;
