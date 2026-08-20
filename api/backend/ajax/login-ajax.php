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
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$requested_hospital = $input['hospital_id'] ?? null;

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Check system_admin first (Super Admin)
    $stmt = $pdo->prepare("SELECT admin_id as id, admin_name, username, password_hash, role FROM system_admin WHERE email = :e AND status = 'Active' LIMIT 1");
    $stmt->execute([':e' => $email]);
    $admin = $stmt->fetch();

    $isAuthenticated = false;

    if ($admin) {
        if (str_starts_with($admin['password_hash'], '$2y$') ? password_verify($password, $admin['password_hash']) : hash('sha256', $password) === $admin['password_hash']) {
            $isAuthenticated = true;
            $_SESSION['admin_id']       = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['hospital_id']    = 0; // Super admin
            $_SESSION['role']           = $admin['role'];
            $_SESSION['hospital_name']  = 'System Wide';
        }
    } 
    
    if (!$isAuthenticated) {
        // Check hospital_admin
        $stmt = $pdo->prepare("SELECT ha.hospital_admin_id as id, ha.admin_name, ha.username, ha.password_hash, ha.hospital_id, ha.role, h.name as hospital_name 
                               FROM hospital_admin ha 
                               LEFT JOIN hospital h ON ha.hospital_id = h.hospital_id 
                               WHERE ha.email = :e AND ha.status = 'Active' LIMIT 1");
        $stmt->execute([':e' => $email]);
        $hAdmin = $stmt->fetch();
        
        if ($hAdmin) {
            if ($requested_hospital && $hAdmin['hospital_id'] != $requested_hospital) {
                echo json_encode(['success' => false, 'message' => 'Your administrator account is not registered to this healthcare center']);
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
                
                setcookie('hms_admin_auth', (string)$_SESSION['admin_id'], time() + 86400, '/');
                $secret = getenv('APP_SECRET') ?: 'secret_key_123';
                setcookie('hms_admin_token', md5($_SESSION['admin_id'] . $secret), time() + 86400, '/');
                setcookie('hms_hospital_id', (string)$_SESSION['hospital_id'], time() + 86400, '/');
            }
        }
    }

    if ($isAuthenticated) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
}
