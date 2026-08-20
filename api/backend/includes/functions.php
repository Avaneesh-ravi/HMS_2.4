<?php
/**
 * Reusable helper functions.
 * Require config/database.php before including this file.
 */

/** Sanitize a plain text input */
function clean(?string $value): string {
    return htmlspecialchars(trim((string)$value), ENT_QUOTES, 'UTF-8');
}

/** Redirect helper */
function redirect(string $path): void {
    header('Location: ' . $path);
    exit;
}

/** 
 * Parse Vite's newly compiled index.html to guarantee we inject the correct hashes.
 * This explicitly fixes a Vercel bug where git preserves identical filemtimes.
 */
function getViteAssets(string $htmlPath): array {
    $js = '';
    $css = '';
    if (file_exists($htmlPath)) {
        $html = file_get_contents($htmlPath);
        if (preg_match('/<script\s+type="module"\s+crossorigin\s+src="[^"]*\/assets\/(index-[^"]+\.js)"><\/script>/i', $html, $matches)) {
            $js = $matches[1];
        }
        if (preg_match('/<link\s+rel="stylesheet"\s+crossorigin\s+href="[^"]*\/assets\/(index-[^"]+\.css)">/i', $html, $matches)) {
            $css = $matches[1];
        }
    }
    return ['js' => $js, 'css' => $css];
}

/** Start session once and repair it from Vercel stateless cookies if missing */
function ensureSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Bridge for Vercel Serverless environment where PHP /tmp sessions vanish across Lambda calls
    if (empty($_SESSION['admin_id']) && !empty($_COOKIE['hms_admin_auth']) && !empty($_COOKIE['hms_admin_token'])) {
        $secret = getenv('APP_SECRET') ?: 'secret_key_123';
        $expectedToken = md5($_COOKIE['hms_admin_auth'] . $secret);
        if ($_COOKIE['hms_admin_token'] === $expectedToken) {
            $_SESSION['admin_id'] = (int)$_COOKIE['hms_admin_auth'];
            $_SESSION['hospital_id'] = (int)($_COOKIE['hms_hospital_id'] ?? 0);
            $_SESSION['admin_username'] = 'Admin (Restored)';
            $_SESSION['role'] = 'Hospital Admin';
        }
    }
}

/** Require an admin to be logged in, else redirect to login page */
function requireAdminLogin(): void {
    ensureSession();
    if (empty($_SESSION['admin_id'])) {
        redirect('login.php');
    }
}

/* ------------------------------------------------------------------ */
/* Patients + Feedback                                                 */
/* ------------------------------------------------------------------ */

/** Insert a patient record, returns new patient id */
function insertPatient(PDO $pdo, array $d): int {
    $sql = "INSERT INTO patient
            (patient_uuid, uhid, first_name, age, gender, mobile, p_email, address,
             pin_code, city, state, country, op_no, ip_no, admission_date, discharge_date, hospital_id, feedback_form_id)
            VALUES
            (gen_random_uuid(), :uhid, :first_name, :age, :gender, :mobile, :email, :address,
             :pincode, :city, :state, :country, :op_no, :ip_no, :admission_date, :discharge_date, :hospital_id, :feedback_form_id)
            ON CONFLICT ON CONSTRAINT uq_patient_uhid 
            DO UPDATE SET 
                first_name = EXCLUDED.first_name,
                age = EXCLUDED.age,
                gender = EXCLUDED.gender,
                mobile = EXCLUDED.mobile,
                p_email = EXCLUDED.p_email,
                address = EXCLUDED.address,
                pin_code = EXCLUDED.pin_code,
                city = EXCLUDED.city,
                state = EXCLUDED.state,
                country = EXCLUDED.country,
                op_no = EXCLUDED.op_no,
                ip_no = EXCLUDED.ip_no,
                admission_date = EXCLUDED.admission_date,
                discharge_date = EXCLUDED.discharge_date,
                hospital_id = EXCLUDED.hospital_id
            RETURNING patient_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':uhid'            => $d['uhid'] ?: null,
        ':first_name'      => $d['full_name'],
        ':age'             => $d['age'],
        ':gender'          => $d['gender'],
        ':mobile'          => $d['mobile_number'],
        ':email'           => $d['email'] ?: null,
        ':address'         => $d['address'] ?: null,
        ':pincode'         => $d['pincode'] ?: null,
        ':city'            => $d['city'] ?: null,
        ':state'           => $d['state'] ?: 'Tamil Nadu',
        ':country'         => $d['country'] ?: 'India',
        ':op_no'           => ($d['visit_type'] === 'OP') ? ($d['op_id'] ?: null) : null,
        ':ip_no'           => ($d['visit_type'] === 'IP') ? ($d['ip_id'] ?: null) : null,
        ':admission_date'  => $d['admission_date'] ?: null,
        ':discharge_date'  => $d['discharge_date'] ?: null,
        ':hospital_id'     => $d['hospital_id'] ?? 1,
        ':feedback_form_id'=> $d['feedback_form_id'] ?? 1
    ]);
    return (int) $stmt->fetchColumn();
}

/** Insert a feedback submission, ratings, yesno, etc */
function insertFeedbackSubmission(PDO $pdo, int $patientId, array $d): int {
    $hospitalId = (int)($d['hospital_id'] ?? 1);
    $formId = (int)($d['feedback_form_id'] ?? 1);
    $deptId = (int)($d['department_id'] ?? 1);

    // 1. Insert into feedback_submission
    $sql = "INSERT INTO feedback_submission (patient_id, hospital_id, department_id, feedback_form_id, status)
            VALUES (:pid, :hid, :did, :fid, 'Pending')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':pid' => $patientId,
        ':hid' => $hospitalId,
        ':did' => $deptId,
        ':fid' => $formId
    ]);
    $submissionId = (int) $pdo->lastInsertId();

    // 2. Loop and insert ratings
    if (!empty($d['ratings']) && is_array($d['ratings'])) {
        $rStmt = $pdo->prepare("INSERT INTO ratings (question_id, feedback_form_id, hospital_id, patient_id, rating) VALUES (:qid, :fid, :hid, :pid, :val)");
        foreach ($d['ratings'] as $qid => $val) {
            if (!empty($val)) {
                $rStmt->execute([
                    ':qid' => (int)$qid,
                    ':fid' => $formId,
                    ':hid' => $hospitalId,
                    ':pid' => $patientId,
                    ':val' => $val
                ]);
            }
        }
    }

    // 3. Loop and insert yesno_answers
    if (!empty($d['yesno']) && is_array($d['yesno'])) {
        $ynStmt = $pdo->prepare("INSERT INTO yesno_answer (yesno_question_id, patient_id, submission_id, feedback_form_id, hospital_id, answer, remarks) VALUES (:ynqid, :pid, :sid, :fid, :hid, :ans, :rem)");
        foreach ($d['yesno'] as $ynqid => $ynData) {
            if (isset($ynData['answer'])) {
                $ans = ($ynData['answer'] === 'Yes' || $ynData['answer'] === '1' || $ynData['answer'] === 1) ? 1 : 0;
                $rem = !empty($ynData['remarks']) ? $ynData['remarks'] : null;
                $ynStmt->execute([
                    ':ynqid' => (int)$ynqid,
                    ':pid'   => $patientId,
                    ':sid'   => $submissionId,
                    ':fid'   => $formId,
                    ':hid'   => $hospitalId,
                    ':ans'   => $ans,
                    ':rem'   => $rem
                ]);
            }
        }
    }

    // 4. Insert Suggestion
    if (!empty($d['suggestions'])) {
        $pdo->prepare("INSERT INTO suggestion (submission_id, patient_id, hospital_id, suggestion_text) VALUES (?, ?, ?, ?)")
            ->execute([$submissionId, $patientId, $hospitalId, $d['suggestions']]);
    }

    // 5. Insert Appreciation
    if (!empty($d['appreciation_name']) || !empty($d['appreciation_note'])) {
        $pdo->prepare("INSERT INTO appreciation (submission_id, person_name, department, comments) VALUES (?, ?, ?, ?)")
            ->execute([$submissionId, $d['appreciation_name'] ?: null, $d['appreciation_department'] ?: null, $d['appreciation_note'] ?: null]);
    }

    return $submissionId;
}

/* ------------------------------------------------------------------ */
/* Admin dashboard queries                                             */
/* ------------------------------------------------------------------ */

function getAllResponses(PDO $pdo, int $hospitalId = 0): array {
    $params = [];
    $sql = "SELECT fs.submission_id AS id, fs.submission_date AS submitted_at, fs.status AS office_status,
                   p.uhid, p.first_name AS full_name, p.mobile, p.patient_id,
                   cr.review_comments AS complaint_review, h.name as hospital_name
            FROM feedback_submission fs
            JOIN patient p ON p.patient_id = fs.patient_id
            JOIN hospital h ON h.hospital_id = fs.hospital_id
            LEFT JOIN complaint_review cr ON cr.submission_id = fs.submission_id";
    
    if ($hospitalId > 0) {
        $sql .= " WHERE fs.hospital_id = :hid";
        $params[':hid'] = $hospitalId;
    }
    
    $sql .= " ORDER BY fs.submission_date DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function getResponseById(PDO $pdo, int $id, int $hospitalId = 0): ?array {
    $params = [':id' => $id];
    $sql = "SELECT fs.*, fs.submission_id AS response_id, fs.submission_date AS submitted_at, fs.status AS office_status,
                   p.*, p.first_name AS full_name, p.mobile AS mobile_number,
                   cr.review_comments AS complaint_review, cr.review_date, cr.corrective_action, cr.preventive_action, cr.incharge_name
            FROM feedback_submission fs
            JOIN patient p ON p.patient_id = fs.patient_id
            LEFT JOIN complaint_review cr ON cr.submission_id = fs.submission_id
            WHERE fs.submission_id = :id";
            
    if ($hospitalId > 0) {
        $sql .= " AND fs.hospital_id = :hid";
        $params[':hid'] = $hospitalId;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    if (!$row) return null;
    
    // Fetch ratings
    $rStmt = $pdo->prepare("SELECT r.*, q.question_text_en FROM ratings r JOIN rating_question q ON q.question_id = r.question_id WHERE r.patient_id = ?");
    $rStmt->execute([$row['patient_id']]);
    $row['ratings_list'] = $rStmt->fetchAll();
    
    // Fetch yesno answers
    $yStmt = $pdo->prepare("SELECT y.*, q.question_en FROM yesno_answer y JOIN yesno_question q ON q.yesno_question_id = y.yesno_question_id WHERE y.submission_id = ?");
    $yStmt->execute([$row['submission_id']]);
    $row['yesno_list'] = $yStmt->fetchAll();

    // Fetch suggestion
    $sStmt = $pdo->prepare("SELECT * FROM suggestion WHERE submission_id = ?");
    $sStmt->execute([$row['submission_id']]);
    $row['suggestion'] = $sStmt->fetch();

    // Fetch appreciation
    $aStmt = $pdo->prepare("SELECT * FROM appreciation WHERE submission_id = ?");
    $aStmt->execute([$row['submission_id']]);
    $row['appreciation'] = $aStmt->fetch();
    
    return $row;
}

function saveOfficeUse(PDO $pdo, int $responseId, array $d): void {
    $review     = $d['complaint_review'] ?? $d['reviewOfComplaint'] ?? '';
    $date       = !empty($d['review_date']) ? $d['review_date'] : (!empty($d['dateOfReview']) ? $d['dateOfReview'] : date('Y-m-d'));
    $corrective = $d['corrective_action'] ?? $d['correctiveAction'] ?? '';
    $preventive = $d['preventive_action'] ?? $d['preventiveAction'] ?? '';
    $incharge   = $d['incharge_name'] ?? $d['inchargeName'] ?? '';

    // Check if review exists
    $checkStmt = $pdo->prepare("SELECT review_id FROM complaint_review WHERE submission_id = ?");
    $checkStmt->execute([$responseId]);
    $exists = $checkStmt->fetchColumn();

    if ($exists) {
        $sql = "UPDATE complaint_review SET 
                  review_comments = :review,
                  review_date = :date,
                  corrective_action = :corrective,
                  preventive_action = :preventive,
                  incharge_name = :incharge
                WHERE submission_id = :rid";
    } else {
        $sql = "INSERT INTO complaint_review
                (submission_id, review_comments, review_date, corrective_action, preventive_action, incharge_name)
                VALUES (:rid, :review, :date, :corrective, :preventive, :incharge)";
    }
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':rid'        => $responseId,
        ':review'     => $review,
        ':date'       => $date,
        ':corrective' => $corrective,
        ':preventive' => $preventive,
        ':incharge'   => $incharge,
    ]);
    
    $pdo->prepare("UPDATE feedback_submission SET status = 'Reviewed' WHERE submission_id = ?")->execute([$responseId]);
}

function getDashboardStats(PDO $pdo, int $hospitalId = 0): array {
    $params = [];
    $where = "";
    if ($hospitalId > 0) {
        $where = "WHERE hospital_id = :hid";
        $params[':hid'] = $hospitalId;
    }
    
    $totalStmt = $pdo->prepare("SELECT COUNT(*) c FROM feedback_submission $where");
    $totalStmt->execute($params);
    $total = (int) $totalStmt->fetch()['c'];
    
    $todayStmt = $pdo->prepare("SELECT COUNT(*) c FROM feedback_submission " . ($where ? "$where AND" : "WHERE") . " DATE(submission_date) = CURRENT_DATE");
    $todayStmt->execute($params);
    $today = (int) $todayStmt->fetch()['c'];

    return [
        'total'          => $total,
        'avg_rating'     => 4.5, // Placeholder, can be calculated from ratings table
        'recommend_rate' => 90, // Placeholder
        'today'          => $today,
    ];
}
