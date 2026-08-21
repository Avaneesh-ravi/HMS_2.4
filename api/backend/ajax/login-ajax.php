<?php
require_once __DIR__ . '/' . '../config/database.php';
require_once __DIR__ . '/' . '../includes/functions.php';
ensureSession();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$email = trim($input['email'] ?? $input['userid'] ?? $input['username'] ?? '');
$password = $input['password'] ?? '';
$requested_hospital = !empty($input['hospital_id']) ? (int)$input['hospital_id'] : null;

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email / User ID and password are required']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Check system_admin first (Super Admin)
    $stmt = $pdo->prepare("SELECT admin_id as id, admin_name, username, password_hash, role FROM system_admin WHERE (LOWER(email) = LOWER(:e) OR LOWER(username) = LOWER(:u)) AND status = 'Active' LIMIT 1");
    $stmt->execute([':e' => $email, ':u' => $email]);
    $admin = $stmt->fetch();

    $isAuthenticated = false;
    $authHospitalId = 1;

    if ($admin) {
        if (str_starts_with($admin['password_hash'], '$2y$') ? password_verify($password, $admin['password_hash']) : hash('sha256', $password) === $admin['password_hash']) {
            $isAuthenticated = true;
            $_SESSION['admin_id']       = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['hospital_id']    = $requested_hospital ?: 1;
            $_SESSION['role']           = $admin['role'];
            $_SESSION['hospital_name']  = 'System Wide';
            $authHospitalId             = $requested_hospital ?: 1;
        }
    } 
    
    if (!$isAuthenticated) {
        // Check hospital_admin
        $stmt = $pdo->prepare("SELECT ha.hospital_admin_id as id, ha.admin_name, ha.username, ha.password_hash, ha.hospital_id, ha.role, h.name as hospital_name 
                               FROM hospital_admin ha 
                               LEFT JOIN hospital h ON ha.hospital_id = h.hospital_id 
                               WHERE (LOWER(ha.email) = LOWER(:e) OR LOWER(ha.username) = LOWER(:u)) AND ha.status = 'Active' LIMIT 1");
        $stmt->execute([':e' => $email, ':u' => $email]);
        $hAdmin = $stmt->fetch();
        
        if ($hAdmin) {
            if ($requested_hospital && $hAdmin['hospital_id'] != $requested_hospital && $hAdmin['hospital_id'] != 0) {
                echo json_encode(['success' => false, 'message' => 'These credentials do not belong to this healthcare center. Access denied.']);
                exit;
            }

            $isValid = str_starts_with($hAdmin['password_hash'], '$2y$') 
                ? password_verify($password, $hAdmin['password_hash']) 
                : hash('sha256', $password) === $hAdmin['password_hash'];
                
            if ($isValid) {
                $isAuthenticated = true;
                $_SESSION['admin_id']       = $hAdmin['id'];
                $_SESSION['admin_username'] = $hAdmin['username'];
                $_SESSION['hospital_id']    = $hAdmin['hospital_id'];
                $_SESSION['role']           = $hAdmin['role'];
                $_SESSION['hospital_name']  = $hAdmin['hospital_name'];
                $authHospitalId             = (int)$hAdmin['hospital_id'];
                
                setcookie('hms_admin_auth', (string)$_SESSION['admin_id'], time() + 86400, '/');
                $secret = getenv('APP_SECRET') ?: 'secret_key_123';
                setcookie('hms_admin_token', md5($_SESSION['admin_id'] . $secret), time() + 86400, '/');
                setcookie('hms_hospital_id', (string)$_SESSION['hospital_id'], time() + 86400, '/');
            }
        }
    }

    if ($isAuthenticated) {
        echo json_encode([
            'success' => true,
            'hospital_id' => $authHospitalId,
            'message' => 'Login successful'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials for this healthcare center.']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error occurred: ' . $e->getMessage()]);
}
