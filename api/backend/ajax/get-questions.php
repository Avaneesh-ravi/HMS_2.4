<?php
require_once __DIR__ . '/' . '../config/database.php';
require_once __DIR__ . '/' . '../includes/functions.php';
ensureSession();
ob_start();
header('Content-Type: application/json');

// Public access allowed to fetch questions for feedback form

try {
    $pdo = getDBConnection();
    $hospitalId = (int)($_GET['hospital_id'] ?? $_SESSION['hospital_id'] ?? 1);

    // Get the first form for this hospital consistently
    $stmt = $pdo->prepare("SELECT feedback_form_id FROM feedback_form WHERE hospital_id = ? ORDER BY feedback_form_id ASC LIMIT 1");
    $stmt->execute([$hospitalId]);
    $formId = $stmt->fetchColumn();

    if (!$formId) {
        ob_clean();
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }

    $sql = "SELECT rq.*, ffrq.display_order 
            FROM rating_question rq 
            JOIN feedback_form_rating_question ffrq ON rq.question_id = ffrq.question_id 
            WHERE ffrq.feedback_form_id = ? 
            ORDER BY ffrq.display_order ASC, ffrq.id ASC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$formId]);
    $questionsRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $questions = [];
    foreach ($questionsRaw as $row) {
        $ratingMode = 'emoji';
        $bgColor = '';
        if ($row['rating_grade']) {
            $parts = explode('|', $row['rating_grade']);
            if (isset($parts[0]) && in_array($parts[0], ['emoji', 'star'])) {
                $ratingMode = $parts[0];
            }
            if (isset($parts[1])) {
                $bgColor = $parts[1];
            }
        }
        
        $questions[] = [
            'id' => (string)$row['question_id'],
            'category' => $row['question_tag'] ?: 'overall',
            'label' => $row['question_text_en'],
            'tamilLabel' => $row['question_text_ta'],
            'ratingMode' => $ratingMode,
            'backgroundColor' => $bgColor
        ];
    }

    $sqlYesNo = "SELECT * FROM yesno_question WHERE feedback_form_id = ? AND status = 'Active' ORDER BY yesno_question_id ASC";
    $stmt = $pdo->prepare($sqlYesNo);
    $stmt->execute([$formId]);
    $yesnoRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $yesnoQuestions = [];
    foreach ($yesnoRaw as $row) {
        $yesnoQuestions[] = [
            'id' => (string)$row['yesno_question_id'],
            'label' => $row['question_en'],
            'tamilLabel' => $row['question_ta'],
            'backgroundColor' => ($row['answer_for_no'] !== 'No') ? $row['answer_for_no'] : '',
            'describeIssueTrigger' => $row['describe_issue_trigger'] ?? 'no'
        ];
    }

    $stmtForm = $pdo->prepare("SELECT layout_mode, combine_pages, theme_color, font_size, show_title_labels, departments FROM feedback_form WHERE feedback_form_id = ?");
    $stmtForm->execute([$formId]);
    $formSettings = $stmtForm->fetch(PDO::FETCH_ASSOC);

    // Fetch hospital branding
    $stmtHosp = $pdo->prepare("SELECT name, address1, address2, mobile, email, logo FROM hospital WHERE hospital_id = ?");
    $stmtHosp->execute([$hospitalId]);
    $hospitalInfo = $stmtHosp->fetch(PDO::FETCH_ASSOC);

    $branding = [
        'hospitalName' => 'Healthcare Center',
        'address' => '',
        'contactNumber' => '',
        'email' => '',
        'logoUrl' => ''
    ];

    if ($hospitalInfo) {
        $branding['hospitalName'] = $hospitalInfo['name'] ?: 'Healthcare Center';
        $addrParts = [];
        if (!empty($hospitalInfo['address1'])) $addrParts[] = $hospitalInfo['address1'];
        if (!empty($hospitalInfo['address2'])) $addrParts[] = $hospitalInfo['address2'];
        $branding['address'] = implode(', ', $addrParts);
        $branding['contactNumber'] = $hospitalInfo['mobile'] ?: '';
        $branding['email'] = $hospitalInfo['email'] ?: '';
        if (!empty($hospitalInfo['logo'])) {
            $logo = $hospitalInfo['logo'];
            if (strpos($logo, 'http') === 0 || strpos($logo, 'data:image/') === 0) {
                // If it's a Supabase bucket URL or inline base64
                $branding['logoUrl'] = $logo;
            } else {
                // Legacy local file
                $branding['logoUrl'] = '../api/backend/uploads/' . $logo;
            }
        }
    }

    // Priority 1: Form configured departments JSON
    $departments = [];
    if (!empty($formSettings['departments'])) {
        $decoded = json_decode($formSettings['departments'], true);
        if (is_array($decoded)) {
            $departments = $decoded;
        }
    }

    // Priority 2: Active departments from relational table if form settings empty
    if (empty($departments)) {
        $deptStmt = $pdo->prepare("SELECT department_name FROM department WHERE hospital_id = ? AND is_active = TRUE ORDER BY department_id ASC");
        $deptStmt->execute([$hospitalId]);
        $departments = $deptStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
    }

    // Priority 3: Fallback default list if completely empty
    if (empty($departments)) {
        $departments = ['Cardiology', 'Pediatrics', 'Orthopedics', 'Gynecology', 'Neurology', 'Oncology', 'Emergency', 'OPD / Outpatient'];
    }

    ob_clean();
    echo json_encode([
        'success' => true, 
        'data' => $questions, 
        'yesno_data' => $yesnoQuestions,
        'departments' => $departments,
        'hospital' => $branding,
        'settings' => [
            'layoutMode' => $formSettings['layout_mode'] == 1 ? '1-column' : '2-column',
            'combinePages' => (bool)$formSettings['combine_pages'],
            'themeColor' => $formSettings['theme_color'] ?: '#0d9488',
            'fontSize' => $formSettings['font_size'] ?: 'Normal',
            'showPageTitleLabels' => isset($formSettings['show_title_labels']) ? (bool)$formSettings['show_title_labels'] : true,
            'departments' => $departments
        ]
    ]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
