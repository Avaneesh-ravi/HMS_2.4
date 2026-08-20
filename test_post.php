<?php
$data = [
    'questions' => [],
    'yesno_questions' => [],
    'settings' => [
        'layoutMode' => '1-column',
        'combinePages' => true,
        'themeColor' => '#0d9488',
        'fontSize' => 'Normal',
        'showPageTitleLabels' => true,
        'departments' => ['Cardiology', 'child']
    ]
];

$ch = curl_init('http://localhost:8081/LRL/HMS_V2.2/backend/ajax/save-questions.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Cookie: PHPSESSID=test' // Needs valid session probably?
]);
$res = curl_exec($ch);
curl_close($ch);
echo $res;
