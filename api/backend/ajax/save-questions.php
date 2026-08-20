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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    $pdo = getDBConnection();
    $hospitalId = (int)($_SESSION['hospital_id'] ?? 0);

    if ($hospitalId === 0) {
        $hospitalId = 1; // Default to 1 for super admin test
    }

    $rawInput = file_get_contents('php://input');
    error_log("Received save-questions payload size: " . strlen($rawInput));
    $data = json_decode($rawInput, true);

    if (!isset($data['questions'])) {
        echo json_encode(['success' => false, 'message' => 'No questions provided']);
        exit;
    }

    $questions = $data['questions'];

    // Get the first feedback form for this hospital
    $stmt = $pdo->prepare("SELECT feedback_form_id FROM feedback_form WHERE hospital_id = ? ORDER BY feedback_form_id ASC LIMIT 1");
    $stmt->execute([$hospitalId]);
    $formId = $stmt->fetchColumn();

    if (!$formId) {
        // If hospital has no form, we can't save
        echo json_encode(['success' => false, 'message' => 'No feedback form found for this hospital.']);
        exit;
    }

    $pdo->beginTransaction();

    // Clear existing mapping for this form
    $delStmt = $pdo->prepare("DELETE FROM feedback_form_rating_question WHERE feedback_form_id = ?");
    $delStmt->execute([$formId]);

    $displayOrder = 1;
    $insertMapStmt = $pdo->prepare("INSERT INTO feedback_form_rating_question (feedback_form_id, question_id, display_order, status) VALUES (?, ?, ?, 'Active')");
    $insertQStmt = $pdo->prepare("INSERT INTO rating_question (question_tag, question_text_en, question_text_ta, active, rating_grade, hospital_id, status) VALUES (?, ?, ?, 1, ?, ?, 'Active') RETURNING question_id");
    $updateQStmt = $pdo->prepare("UPDATE rating_question SET question_tag = ?, question_text_en = ?, question_text_ta = ?, rating_grade = ? WHERE question_id = ?");
    $checkQStmt = $pdo->prepare("SELECT hospital_id FROM rating_question WHERE question_id = ?");

    foreach ($questions as $q) {
        $qid = $q['id'];
        $ratingGrade = $q['ratingMode'];
        if (!empty($q['backgroundColor'])) {
            $ratingGrade .= '|' . $q['backgroundColor'];
        }

        if (strpos($qid, 'new_') === 0) {
            // New question
            $insertQStmt->execute([
                $q['category'] ?? 'overall',
                $q['label'],
                $q['tamilLabel'],
                $ratingGrade,
                $hospitalId
            ]);
            $qid = (int)$insertQStmt->fetchColumn();
        } else {
            // Check if the question belongs to this hospital
            $checkQStmt->execute([$qid]);
            $ownerId = $checkQStmt->fetchColumn();

            if ($ownerId == $hospitalId || $hospitalId == 1) { // Allow Super Admin (id=1) to modify globally, or matching hospital
                // Update existing
                $updateQStmt->execute([
                    $q['category'] ?? 'overall',
                    $q['label'],
                    $q['tamilLabel'],
                    $ratingGrade,
                    $qid
                ]);
            } else {
                // If it belongs to a different hospital or is global, create a new one for THIS hospital
                $insertQStmt->execute([
                    $q['category'] ?? 'overall',
                    $q['label'],
                    $q['tamilLabel'],
                    $ratingGrade,
                    $hospitalId
                ]);
                $qid = (int)$insertQStmt->fetchColumn();
            }
        }

        // Add to form mapping
        $insertMapStmt->execute([$formId, $qid, $displayOrder]);
        $displayOrder++;
    }

    $pdo->commit();

    if (isset($data['yesno_questions']) && is_array($data['yesno_questions'])) {
        $pdo->beginTransaction();
        $yesnoQuestions = $data['yesno_questions'];

        $updateYnStmt = $pdo->prepare("UPDATE yesno_question SET question_en = ?, question_ta = ?, answer_for_no = ?, describe_issue_trigger = ?, status = 'Active' WHERE yesno_question_id = ? AND feedback_form_id = ?");
        $insertYnStmt = $pdo->prepare("INSERT INTO yesno_question (feedback_form_id, question_en, question_ta, answer_for_no, describe_issue_trigger, status) VALUES (?, ?, ?, ?, ?, 'Active') RETURNING yesno_question_id");

        $incomingIds = [];
        foreach ($yesnoQuestions as $yq) {
            $trigger = in_array($yq['describeIssueTrigger'] ?? 'no', ['no', 'yes', 'both', 'never']) ? ($yq['describeIssueTrigger'] ?? 'no') : 'no';
            
            if (!empty($yq['id']) && is_numeric($yq['id'])) {
                $incomingIds[] = (int)$yq['id'];
                $updateYnStmt->execute([
                    $yq['label'],
                    $yq['tamilLabel'],
                    !empty($yq['backgroundColor']) ? $yq['backgroundColor'] : 'No',
                    $trigger,
                    $yq['id'],
                    $formId
                ]);
            } else {
                $insertYnStmt->execute([
                    $formId,
                    $yq['label'],
                    $yq['tamilLabel'],
                    !empty($yq['backgroundColor']) ? $yq['backgroundColor'] : 'No',
                    $trigger
                ]);
                $incomingIds[] = (int)$insertYnStmt->fetchColumn();
            }
        }
        
        // Soft-delete items not in incoming array
        if (!empty($incomingIds)) {
            $placeholders = implode(',', array_fill(0, count($incomingIds), '?'));
            $delStmt = $pdo->prepare("UPDATE yesno_question SET status = 'Inactive' WHERE feedback_form_id = ? AND yesno_question_id NOT IN ($placeholders)");
            $params = array_merge([$formId], $incomingIds);
            $delStmt->execute($params);
        } else {
            // Delete all if empty
            $delStmt = $pdo->prepare("UPDATE yesno_question SET status = 'Inactive' WHERE feedback_form_id = ?");
            $delStmt->execute([$formId]);
        }
        $pdo->commit();
    }

    if (isset($data['settings'])) {
        $layoutMode = $data['settings']['layoutMode'] === '1-column' ? 1 : 2;
        $combinePages = $data['settings']['combinePages'] ? 1 : 0;
        
        $themeColor = $data['settings']['themeColor'] ?? '#0d9488';
        $fontSize = $data['settings']['fontSize'] ?? 'Normal';
        $showTitleLabels = isset($data['settings']['showPageTitleLabels']) ? ($data['settings']['showPageTitleLabels'] ? 1 : 0) : 1;
        $departments = isset($data['settings']['departments']) ? json_encode($data['settings']['departments']) : '[]';

        $stmtSettings = $pdo->prepare("UPDATE feedback_form SET layout_mode = ?, combine_pages = ?, theme_color = ?, font_size = ?, show_title_labels = ?, departments = ? WHERE feedback_form_id = ?");
        $stmtSettings->execute([$layoutMode, $combinePages, $themeColor, $fontSize, $showTitleLabels, $departments, $formId]);
    }

    ob_clean();
    echo json_encode(['success' => true, 'message' => 'Questions saved successfully']);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
