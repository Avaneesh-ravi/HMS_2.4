<?php
$_SESSION['admin_id'] = 1;
$_SESSION['hospital_id'] = 1;
$_SERVER['REQUEST_METHOD'] = 'POST';

$json = json_encode([
    'questions' => [],
    'yesno_questions' => [],
    'settings' => [
        'layoutMode' => '1-column',
        'combinePages' => true,
        'themeColor' => '#0d9488',
        'fontSize' => 'Normal',
        'showPageTitleLabels' => true,
        'departments' => ['Cardiology', 'Child']
    ]
]);

// We need to inject this into php://input for save-questions.php
// But we can't write to php://input in standard PHP.
// Instead we'll modify save-questions.php to read from a variable if it exists, or just we can create a temporary server and use curl.
