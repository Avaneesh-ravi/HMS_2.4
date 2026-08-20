<?php
require_once __DIR__ . '/' . '../config/database.php';
require_once __DIR__ . '/' . '../includes/functions.php';
ensureSession();
ob_start();
header('Content-Type: application/json');
if (empty($_SESSION['admin_id'])) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    $hospitalId = (int)($_SESSION['hospital_id'] ?? 0);
    
    // 1. Fetch hospital details & departments
    $hospitalDetails = [
        'hospitalName' => 'Apollo Healthcare Center',
        'address' => '123 Health Street, Chennai - 600001',
        'contactNumber' => '+91 44 1234 5678',
        'email' => 'contact@apollo.com',
        'logoUrl' => ''
    ];
    if ($hospitalId > 0) {
        $hStmt = $pdo->prepare("SELECT name, address1, mobile, email, logo FROM hospital WHERE hospital_id = ?");
        $hStmt->execute([$hospitalId]);
        $hData = $hStmt->fetch(PDO::FETCH_ASSOC);
        if ($hData) {
            $hospitalDetails = [
                'hospitalName' => $hData['name'],
                'address' => $hData['address1'] ?? '',
                'contactNumber' => $hData['mobile'] ?? '',
                'email' => $hData['email'] ?? '',
                'logoUrl' => $hData['logo'] ?? ''
            ];
        }
    }

    $deptStmt = $pdo->prepare("SELECT department_id, department_name, department_code FROM department WHERE hospital_id = ? OR hospital_id = 0 ORDER BY department_name ASC");
    $deptStmt->execute([$hospitalId]);
    $hospitalDepartments = $deptStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Fetch submissions
    $params = [];
    $sql = "SELECT fs.submission_id, fs.submission_date AS submitted_at, fs.status AS office_status, fs.patient_id, fs.hospital_id, fs.department_id, fs.feedback_form_id,
                   p.uhid, p.first_name AS full_name, p.mobile AS mobile_number, p.p_email as patient_email, p.address as patient_address, p.pin_code, p.city, p.state, p.country,
                   p.op_no, p.ip_no, p.admission_date, p.discharge_date,
                   cr.review_comments AS complaint_review, cr.review_date, cr.corrective_action, cr.preventive_action, cr.incharge_name,
                   d.department_name
            FROM feedback_submission fs
            JOIN patient p ON p.patient_id = fs.patient_id
            LEFT JOIN complaint_review cr ON cr.submission_id = fs.submission_id
            LEFT JOIN department d ON d.department_id = fs.department_id";
            
    $whereClauses = [];
    if ($hospitalId > 0) {
        $whereClauses[] = "fs.hospital_id = :hid";
        $params[':hid'] = $hospitalId;
    }
    if (!empty($_GET['from'])) {
        $whereClauses[] = "fs.submission_date >= :from";
        $params[':from'] = $_GET['from'] . ' 00:00:00';
    }
    if (!empty($_GET['to'])) {
        $whereClauses[] = "fs.submission_date <= :to";
        $params[':to'] = $_GET['to'] . ' 23:59:59';
    }

    if (!empty($whereClauses)) {
        $sql .= " WHERE " . implode(' AND ', $whereClauses);
    }
    $sql .= " ORDER BY fs.submission_date DESC LIMIT 200";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $responses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $fullResponses = [];
    
    if (!empty($responses)) {
        $submissionIds = array_column($responses, 'submission_id');
        $patientIds = array_unique(array_column($responses, 'patient_id'));
        
        $inSubQuery = implode(',', array_map('intval', $submissionIds));
        $inPatQuery = implode(',', array_map('intval', $patientIds));
        
        // Fetch ratings mapped by patient_id
        $rStmt = $pdo->query("SELECT r.rating_id, r.question_id, r.patient_id, r.feedback_form_id, r.rating, r.created_at, q.question_text_en as question_text FROM ratings r LEFT JOIN rating_question q ON (r.question_id = q.question_id) WHERE r.patient_id IN ($inPatQuery)");
        $allRatings = $rStmt->fetchAll(PDO::FETCH_ASSOC);
        $ratingsByPatId = [];
        foreach ($allRatings as $r) {
            $ratingsByPatId[$r['patient_id']][] = $r;
        }
        
        // Fetch yesno answers
        $yStmt = $pdo->query("SELECT y.yesno_answer_id, y.yesno_question_id, y.submission_id, y.answer, y.remarks, q.question_en, q.question_ta, COALESCE(NULLIF(q.question_en, ''), q.question_ta) as question_text FROM yesno_answer y LEFT JOIN yesno_question q ON (y.yesno_question_id = q.yesno_question_id) WHERE y.submission_id IN ($inSubQuery)");
        $allYesNo = $yStmt->fetchAll(PDO::FETCH_ASSOC);
        $yesNoIndexed = [];
        foreach ($allYesNo as $yn) {
            $yesNoIndexed[$yn['submission_id']][] = $yn;
        }
        
        // Fetch suggestions
        $sStmt = $pdo->query("SELECT submission_id, suggestion_text FROM suggestion WHERE submission_id IN ($inSubQuery)");
        $allSuggestions = $sStmt->fetchAll(PDO::FETCH_ASSOC);
        $suggestionIndexed = [];
        foreach ($allSuggestions as $s) {
            $suggestionIndexed[$s['submission_id']] = $s;
        }
        
        // Fetch appreciations
        $aStmt = $pdo->query("SELECT submission_id, person_name, department, comments FROM appreciation WHERE submission_id IN ($inSubQuery)");
        $allAppreciations = $aStmt->fetchAll(PDO::FETCH_ASSOC);
        $appreciationIndexed = [];
        foreach ($allAppreciations as $a) {
            $appreciationIndexed[$a['submission_id']][] = $a;
        }
        
        foreach ($responses as $row) {
            $subId = $row['submission_id'];
            $patId = $row['patient_id'];
            $formId = $row['feedback_form_id'] ?? 0;
            $subDate = substr($row['submitted_at'], 0, 10);
            
            $ratingsRaw = [];
            $seenQ = [];
            $patientRatings = $ratingsByPatId[$patId] ?? [];
            foreach ($patientRatings as $r) {
                if (($formId == 0 || $r['feedback_form_id'] == $formId) && substr($r['created_at'], 0, 10) === $subDate) {
                    if (!isset($seenQ[$r['question_id']])) {
                        $ratingsRaw[] = $r;
                        $seenQ[$r['question_id']] = true;
                    }
                }
            }
            
            $rawYesNoItems = $yesNoIndexed[$subId] ?? [];
            $yesnoRaw = [];
            $seenY = [];
            foreach ($rawYesNoItems as $yn) {
                if (!isset($seenY[$yn['yesno_question_id']])) {
                    $yesnoRaw[] = $yn;
                    $seenY[$yn['yesno_question_id']] = true;
                }
            }

            $suggestion = $suggestionIndexed[$subId] ?? [];
            $appreciationRaw = $appreciationIndexed[$subId] ?? [];

            $deptName = !empty($row['department_name']) 
                ? $row['department_name'] 
                : ((!empty($row['ip_no'])) ? 'IPD / Inpatient' : 'OPD / Outpatient');

            $fullResponses[] = [
                'id' => $subId,
                'uhid' => $row['uhid'] ?: 'N/A',
                'patientName' => $row['full_name'],
                'date' => date('d/m/Y', strtotime($row['submitted_at'])),
                'submittedAt' => $row['submitted_at'],
                'visitType' => !empty($row['ip_no']) ? 'IP' : 'OP',
                'departmentId' => $row['department_id'] ?? 0,
                'departmentName' => $deptName,
                'mobile' => $row['mobile_number'] ?? '',
                'email' => $row['patient_email'] ?? '',
                'address' => $row['patient_address'] ?? '',
                'city' => $row['city'] ?? '',
                'state' => $row['state'] ?? '',
                'pincode' => $row['pin_code'] ?? '',
                'country' => $row['country'] ?? '',
                'opNumber' => $row['op_no'] ?? '',
                'ipNumber' => $row['ip_no'] ?? '',
                'admissionDate' => $row['admission_date'] ?? '',
                'dischargeDate' => $row['discharge_date'] ?? '',
                'overallRating' => 5.0,
                'wouldRecommend' => true,
                'isProblem' => false,
                'isResolved' => false,
                'suggestions' => !empty($suggestion) ? $suggestion['suggestion_text'] : '',
                'rawRatings' => $ratingsRaw,
                'rawYesNo' => $yesnoRaw,
                'rawAppreciations' => $appreciationRaw,
                'officeUse' => [
                    'status' => $row['office_status'],
                    'reviewOfComplaint' => $row['complaint_review'] ?? '',
                    'dateOfReview' => $row['review_date'] ?? '',
                    'correctiveAction' => $row['corrective_action'] ?? '',
                    'preventiveAction' => $row['preventive_action'] ?? '',
                    'inchargeName' => $row['incharge_name'] ?? ''
                ]
            ];
        }
    }

    // Calculate Summary Statistics
    $totalResponses = count($fullResponses);
    $sumRating = 0;
    $ratingCount = 0;
    $starDist = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
    $recommendYes = 0;
    $recommendTotal = 0;

    $ratingMap = [
        'bad' => 1, '1' => 1,
        'poor' => 2, '2' => 2,
        'average' => 3, '3' => 3,
        'good' => 4, '4' => 4,
        'excellent' => 5, '5' => 5
    ];

    foreach ($fullResponses as &$resp) {
        $rSum = 0;
        $rCnt = 0;
        foreach ($resp['rawRatings'] as $rItem) {
            $val = strtolower(trim((string)($rItem['rating'] ?? '')));
            if (isset($ratingMap[$val])) {
                $score = $ratingMap[$val];
                $rSum += $score;
                $rCnt++;
                $sumRating += $score;
                $ratingCount++;
            }
        }
        $avgR = $rCnt > 0 ? round($rSum / $rCnt, 1) : 5.0;
        $resp['overallRating'] = $avgR;
        $starKey = min(5, max(1, (int)round($avgR)));
        $starDist[$starKey]++;

        $recVal = true;
        foreach ($resp['rawYesNo'] as $ynItem) {
            $recommendTotal++;
            $ans = strtolower(trim((string)($ynItem['answer'] ?? '')));
            $qTxt = strtolower(trim((string)($ynItem['question_text'] ?? '')));

            if ($ans === 'yes' || $ans === '1' || $ans === 'true') {
                $recommendYes++;
            } else if ($ans === 'no' || $ans === '0' || $ans === 'false') {
                if (strpos($qTxt, 'recommend') !== false || strpos($qTxt, 'refer') !== false) {
                    $recVal = false;
                }
            }
        }
        $resp['wouldRecommend'] = $recVal;
    }
    unset($resp);

    $avgRating = $ratingCount > 0 ? round($sumRating / $ratingCount, 1) : 5.0;
    $recommendRate = $recommendTotal > 0 ? round(($recommendYes / $recommendTotal) * 100, 1) : 100.0;

    $todayStr = date('Y-m-d');
    $todayResponses = 0;
    foreach ($responses as $rRow) {
        if (substr($rRow['submitted_at'], 0, 10) === $todayStr) {
            $todayResponses++;
        }
    }

    $summary = [
        'totalResponses' => $totalResponses,
        'recommendRate' => $recommendRate,
        'averageRating' => $avgRating,
        'todayResponses' => $todayResponses,
        'starDistribution' => $starDist
    ];
    
    ob_clean();
    echo json_encode([
        'success' => true, 
        'data' => $fullResponses, 
        'hospital' => $hospitalDetails,
        'departments' => $hospitalDepartments,
        'summary' => $summary
    ]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
