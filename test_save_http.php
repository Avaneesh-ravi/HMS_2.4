<?php
$data = [
    'questions' => [
        ['id' => '1', 'category' => 'overall', 'label' => 'Test', 'tamilLabel' => 'Test', 'ratingMode' => 'star']
    ],
    'yesno_questions' => [],
    'settings' => [
        'layoutMode' => '1-column',
        'combinePages' => true,
        'themeColor' => '#0d9488',
        'fontSize' => 'Normal',
        'showPageTitleLabels' => true,
        'departments' => ['Cardiology', 'Child']
    ]
];
$options = [
    'http' => [
        'method'  => 'POST',
        'header'  => 'Content-Type: application/json',
        'content' => json_encode($data)
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents('http://localhost:8081/LRL/HMS_V2.2/backend/ajax/save-questions.php', false, $context);
echo "Response: " . $result;
