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
    
    // Fetch hospital details
    $hospitalDetails = null;
    if ($hospitalId > 0) {
        $hStmt = $pdo->prepare("SELECT * FROM hospital WHERE hospital_id = ?");
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
    } else {
        $hospitalDetails = [
            'hospitalName' => 'System Wide',
            'address' => 'All Locations',
            'contactNumber' => '',
            'email' => '',
            'logoUrl' => ''
        ];
    }
    
    // Fetch hospital departments list for dropdown filtering
    $deptStmt = $pdo->prepare("SELECT department_id, department_name, department_code FROM department WHERE hospital_id = ? OR hospital_id = 0 ORDER BY department_name ASC");
    $deptStmt->execute([$hospitalId]);
    $hospitalDepartments = $deptStmt->fetchAll(PDO::FETCH_ASSOC);

    $params = [];
    $sql = "SELECT fs.*, fs.submission_id AS response_id, fs.submission_date AS submitted_at, fs.status AS office_status,
                   p.*, p.first_name AS full_name, p.mobile AS mobile_number, p.p_email as patient_email, p.address as patient_address, p.pin_code as pin_code,
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
    
    $sql .= " ORDER BY fs.submission_date DESC";
    
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
        $rStmt = $pdo->query("SELECT r.*, q.question_text_en as question_text, q.hospital_id as q_hospital_id, q.status as q_status, q.active as q_active FROM ratings r LEFT JOIN rating_question q ON (r.question_id = q.question_id) WHERE r.patient_id IN ($inPatQuery)");
        $allRatings = $rStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Fetch yesno answers
        $yStmt = $pdo->query("SELECT y.*, q.question_en, q.question_ta, COALESCE(NULLIF(q.question_en, ''), q.question_ta) as question_text, q.hospital_id as q_hospital_id, q.status as q_status FROM yesno_answer y LEFT JOIN yesno_question q ON (y.yesno_question_id = q.yesno_question_id) WHERE y.submission_id IN ($inSubQuery)");
        $allYesNo = $yStmt->fetchAll(PDO::FETCH_ASSOC);
        $yesNoIndexed = [];
        foreach ($allYesNo as $yn) {
            $yesNoIndexed[$yn['submission_id']][] = $yn;
        }
        
        // Fetch suggestions
        $sStmt = $pdo->query("SELECT * FROM suggestion WHERE submission_id IN ($inSubQuery)");
        $allSuggestions = $sStmt->fetchAll(PDO::FETCH_ASSOC);
        $suggestionIndexed = [];
        foreach ($allSuggestions as $s) {
            $suggestionIndexed[$s['submission_id']] = $s;
        }
        
        // Fetch appreciations
        $aStmt = $pdo->query("SELECT * FROM appreciation WHERE submission_id IN ($inSubQuery)");
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
            foreach ($allRatings as $r) {
                if ($r['patient_id'] == $patId 
                    && ($formId == 0 || $r['feedback_form_id'] == $formId)
                    && substr($r['created_at'], 0, 10) === $subDate) {
                    
                    // Filter out unlisted/inactive questions
                    if (isset($r['q_active']) && $r['q_active'] != 1 && $r['q_active'] !== null) continue;
                    if (!empty($r['q_status']) && $r['q_status'] !== 'Active') continue;
                    
                    // Filter out questions belonging to other hospitals
                    if (!empty($r['q_hospital_id']) && $r['q_hospital_id'] != $hospitalId && $hospitalId > 0) continue;
                    
                    // Deduplicate identical submissions (if testing created duplicates)
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
                if (!empty($yn['q_status']) && $yn['q_status'] !== 'Active') continue;
                if (!empty($yn['q_hospital_id']) && $yn['q_hospital_id'] != $hospitalId && $hospitalId > 0) continue;
                
                if (!isset($seenY[$yn['yesno_question_id']])) {
                    $yesnoRaw[] = $yn;
                    $seenY[$yn['yesno_question_id']] = true;
                }
            }

            $suggestion = $suggestionIndexed[$subId] ?? [];
            $appreciationRaw = $appreciationIndexed[$subId] ?? [];

            $deptName = !empty($row['department_name']) 
                ? $row['department_name'] 
                : ((isset($row['visit_type']) && $row['visit_type'] === 'IP') || !empty($row['ip_no']) ? 'IPD / Inpatient' : 'OPD / Outpatient');

            $fullResponses[] = [
                'id' => $subId,
                'uhid' => $row['uhid'] ?: 'N/A',
                'patientName' => $row['full_name'],
                'date' => date('d/m/Y', strtotime($row['submitted_at'])),
                'submittedAt' => $row['submitted_at'],
                'visitType' => $row['visit_type'] ?? ($row['op_no'] ? 'OP' : 'IP'),
                'departmentId' => $row['department_id'] ?? 0,
                'departmentName' => $deptName,
                'mobile' => $row['mobile_number'],
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

    // Calculate Summary Statistics & Problem Rollups
    $totalResponses = count($fullResponses);
    $sumRating = 0;
    $ratingCount = 0;
    $starDist = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
    $recommendYes = 0;
    $recommendTotal = 0;

    $totalProblems = 0;
    $unresolvedProblems = 0;
    $resolvedProblems = 0;
    $deptBreakdown = [];

    $ratingMap = [
        'bad' => 1, '1' => 1,
        'poor' => 2, '2' => 2,
        'average' => 3, '3' => 3,
        'good' => 4, '4' => 4,
        'excellent' => 5, '5' => 5
    ];

    $recommendationQIds = [1, 4, 7, 12, 39, 42, 45, 48];
    $cleanlinessQIds    = [10, 28, 37, 40, 43, 46];
    $costQIds           = [11, 29, 38, 41, 44, 47];
    $satisfactoryQIds   = [2, 5, 8, 3, 6, 9];

    foreach ($fullResponses as &$resp) {
        $rSum = 0;
        $rCnt = 0;
        $hasLowRating = false;
        foreach ($resp['rawRatings'] as $rItem) {
            $val = strtolower(trim((string)($rItem['rating'] ?? '')));
            if (isset($ratingMap[$val])) {
                $score = $ratingMap[$val];
                if ($score <= 2) {
                    $hasLowRating = true;
                }
                $rSum += $score;
                $rCnt++;
                $sumRating += $score;
                $ratingCount++;
            }
        }
        $avgR = $rCnt > 0 ? round($rSum / $rCnt, 1) : 5.0;
        $resp['overallRating'] = $avgR; // Strictly 1 decimal place
        $starKey = min(5, max(1, (int)round($avgR)));
        $starDist[$starKey]++;

        $recVal = true;
        $hasYesNoProblem = false;
        foreach ($resp['rawYesNo'] as $ynItem) {
            $recommendTotal++;
            $ans = strtolower(trim((string)($ynItem['answer'] ?? '')));
            $qEn = strtolower(trim((string)($ynItem['question_en'] ?? '')));
            $qTa = strtolower(trim((string)($ynItem['question_ta'] ?? '')));
            $qTxt = strtolower(trim((string)($ynItem['question_text'] ?? '')));
            $qId = (int)($ynItem['yesno_question_id'] ?? 0);

            $isRecQuestion = in_array($qId, $recommendationQIds) || strpos($qTxt, 'recommend') !== false || strpos($qTxt, 'refer') !== false || strpos($qTxt, 'visit again') !== false || strpos($qTa, 'பரிந்துைரப்பீர்களா') !== false || strpos($qTa, 'திரும்ப வருவீர்களா') !== false;

            $isCleanQuestion = in_array($qId, $cleanlinessQIds) || strpos($qTxt, 'cleanliness') !== false || strpos($qTxt, 'hygiene') !== false || strpos($qTa, 'தூய்ைம') !== false;

            $isCostQuestion = in_array($qId, $costQIds) || strpos($qTxt, 'cost') !== false || strpos($qTxt, 'explain') !== false || strpos($qTa, 'கட்டணம்') !== false;

            if ($ans === 'yes' || $ans === '1' || $ans === 'true') {
                $recommendYes++;
                if ($isCleanQuestion) {
                    $hasYesNoProblem = true;
                }
            } else if ($ans === 'no' || $ans === '0' || $ans === 'false') {
                if ($isRecQuestion) {
                    $recVal = false;
                }
                if ($isCleanQuestion || $isCostQuestion || in_array($qId, $satisfactoryQIds)) {
                    $hasYesNoProblem = true;
                }
            }
        }
        $resp['wouldRecommend'] = $recVal;

        // Is Resolved check
        $ou = $resp['officeUse'] ?? [];
        $isResolved = (isset($ou['status']) && $ou['status'] === 'Reviewed') || !empty($ou['reviewOfComplaint']) || !empty($ou['correctiveAction']) || !empty($ou['inchargeName']);
        $resp['isResolved'] = (bool)$isResolved;

        // Is Problem check: avgRating < 3.0 OR wouldRecommend === false OR hasLowRating (<= 2 stars) OR hasYesNoProblem
        $isProblem = ($avgR < 3.0) || ($recVal === false) || $hasLowRating || $hasYesNoProblem;
        $resp['isProblem'] = (bool)$isProblem;

        $dept = $resp['departmentName'] ?? 'OPD / Outpatient';
        if (!isset($deptBreakdown[$dept])) {
            $deptBreakdown[$dept] = ['total' => 0, 'open' => 0, 'resolved' => 0];
        }
        $deptBreakdown[$dept]['total']++;

        if ($isProblem) {
            $totalProblems++;
            if ($isResolved) {
                $resolvedProblems++;
                $deptBreakdown[$dept]['resolved']++;
            } else {
                $unresolvedProblems++;
                $deptBreakdown[$dept]['open']++;
            }
        }
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

    $from = $_GET['from'] ?? null;
    $to = $_GET['to'] ?? null;
    $isFiltered = !empty($from) || !empty($to);

    $totalChangeText = "0.0%";
    if ($isFiltered && !empty($from) && !empty($to)) {
        $days = max(1, (int)round((strtotime($to) - strtotime($from)) / 86400) + 1);
        $prevTo = date('Y-m-d', strtotime($from . ' - 1 day'));
        $prevFrom = date('Y-m-d', strtotime($prevTo . " - " . ($days - 1) . " days"));

        $prevSql = "SELECT COUNT(*) as cnt FROM feedback_submission fs WHERE fs.submission_date >= :pfrom AND fs.submission_date <= :pto";
        $pParams = [':pfrom' => $prevFrom . ' 00:00:00', ':pto' => $prevTo . ' 23:59:59'];
        if ($hospitalId > 0) {
            $prevSql .= " AND fs.hospital_id = :hid";
            $pParams[':hid'] = $hospitalId;
        }
        $pStmt = $pdo->prepare($prevSql);
        $pStmt->execute($pParams);
        $prevPeriodResponses = (int)($pStmt->fetchColumn() ?: 0);

        if ($prevPeriodResponses > 0) {
            $diff = $totalResponses - $prevPeriodResponses;
            $pct = round(($diff / $prevPeriodResponses) * 100, 1);
            $totalChangeText = ($pct >= 0 ? "+{$pct}%" : "{$pct}%") . " vs prev period";
        } else {
            $totalChangeText = "+100% vs prev period";
        }
    }

    // Calculate Per-Question Yes/No Breakdown for Feedback Report (Hospital Scoped)
    $yesNoBreakdownList = [];
    try {
        $qQuery = "
            SELECT DISTINCT q.yesno_question_id, q.question_en, q.question_ta, q.hospital_id
            FROM yesno_question q
            JOIN feedback_form ff ON ff.feedback_form_id = q.feedback_form_id
            WHERE (ff.hospital_id = :hid OR (:hid = 0))
              AND q.status = 'Active'
              AND ff.status = 'Active'
              AND COALESCE(NULLIF(TRIM(q.question_en), ''), TRIM(q.question_ta)) IS NOT NULL
            ORDER BY q.yesno_question_id ASC
        ";
        $qStmt = $pdo->prepare($qQuery);
        $qStmt->execute([':hid' => $hospitalId]);
        $activeHospQuestions = $qStmt->fetchAll(PDO::FETCH_ASSOC);

        // Index answers by question_id from fullResponses for current date range
        $answersByQId = [];
        foreach ($fullResponses as $resp) {
            foreach ($resp['rawYesNo'] as $yn) {
                $qId = (int)($yn['yesno_question_id'] ?? 0);
                if ($qId > 0) {
                    $ans = strtolower(trim((string)($yn['answer'] ?? '')));
                    if (!isset($answersByQId[$qId])) {
                        $answersByQId[$qId] = ['yes' => 0, 'no' => 0, 'total' => 0];
                    }
                    $answersByQId[$qId]['total']++;
                    if ($ans === 'yes' || $ans === '1' || $ans === 'true') {
                        $answersByQId[$qId]['yes']++;
                    } else if ($ans === 'no' || $ans === '0' || $ans === 'false') {
                        $answersByQId[$qId]['no']++;
                    }
                }
            }
        }

        foreach ($activeHospQuestions as $hQ) {
            $qId = (int)$hQ['yesno_question_id'];
            $qLabel = !empty($hQ['question_en']) ? trim($hQ['question_en']) : trim($hQ['question_ta']);
            $qLabel = trim(preg_replace('/\s+/', ' ', $qLabel));

            $stats = $answersByQId[$qId] ?? ['yes' => 0, 'no' => 0, 'total' => 0];
            $tot = $stats['total'];
            $yes = $stats['yes'];
            $no  = $stats['no'];

            $yesPercent = $tot > 0 ? round(($yes / $tot) * 100, 1) : 0;
            $noPercent  = $tot > 0 ? round(($no / $tot) * 100, 1) : 0;

            $yesNoBreakdownList[] = [
                'questionId' => $qId,
                'questionLabel' => $qLabel,
                'totalAnswers' => $tot,
                'yesCount' => $yes,
                'noCount' => $no,
                'yesPercent' => $yesPercent,
                'noPercent' => $noPercent
            ];
        }

        // Sort by highest "No" percentage first
        usort($yesNoBreakdownList, function($a, $b) {
            if ($b['noPercent'] != $a['noPercent']) {
                return $b['noPercent'] <=> $a['noPercent'];
            }
            return $b['noCount'] <=> $a['noCount'];
        });
    } catch (Exception $e) {
        error_log("yesNoBreakdown Exception: " . $e->getMessage());
    }

    $summary = [
        'totalResponses' => $totalResponses,
        'recommendRate' => $recommendRate,
        'averageRating' => $avgRating,
        'todayResponses' => $todayResponses,
        'responsesInRange' => $totalResponses,
        'isFiltered' => $isFiltered,
        'fromDate' => $from,
        'toDate' => $to,
        'totalChangeText' => $totalChangeText,
        'starDistribution' => $starDist,
        'totalProblems' => $totalProblems,
        'unresolvedProblems' => $unresolvedProblems,
        'resolvedProblems' => $resolvedProblems,
        'departmentBreakdown' => $deptBreakdown,
        'yesNoBreakdown' => $yesNoBreakdownList
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
