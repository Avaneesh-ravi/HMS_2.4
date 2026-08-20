<?php
require_once __DIR__ . '/' . '../config/database.php';
require_once __DIR__ . '/' . '../includes/functions.php';
ensureSession();

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $pdo = getDBConnection();
    
    // Check system_admin first (Super Admin)
    $stmt = $pdo->prepare("SELECT admin_id as id, admin_name, username, password_hash, role FROM system_admin WHERE email = :e AND status = 'Active' LIMIT 1");
    $stmt->execute([':e' => $email]);
    $admin = $stmt->fetch();

    $isAuthenticated = false;

    if ($admin) {
        // Verify system admin password
        if (str_starts_with($admin['password_hash'], '$2y$') ? password_verify($password, $admin['password_hash']) : hash('sha256', $password) === $admin['password_hash']) {
            $isAuthenticated = true;
            $_SESSION['admin_id']       = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['hospital_id']    = 0; // Super admin
            $_SESSION['role']           = $admin['role'];
            $_SESSION['hospital_name']  = 'System Wide';
            redirect('dashboard.php');
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
            // Verify hospital admin password
            if (str_starts_with($hAdmin['password_hash'], '$2y$') ? password_verify($password, $hAdmin['password_hash']) : hash('sha256', $password) === $hAdmin['password_hash']) {
                $isAuthenticated = true;
                $_SESSION['admin_id']       = $hAdmin['id'];
                $_SESSION['admin_username'] = $hAdmin['username'];
                $_SESSION['hospital_id']    = $hAdmin['hospital_id'];
                $_SESSION['role']           = $hAdmin['role'];
                $_SESSION['hospital_name']  = $hAdmin['hospital_name'];
                
                setcookie('hms_admin_auth', $_SESSION['admin_id'], time() + 86400, '/');
                setcookie('hms_admin_token', md5($_SESSION['admin_id'] . 'secret_key_123'), time() + 86400, '/');
                setcookie('hms_hospital_id', $_SESSION['hospital_id'], time() + 86400, '/');
                
                redirect('dashboard.php');
            }
        }
    }

    if (!$isAuthenticated) {
        $error = 'Invalid email or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login</title>
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap">
<link rel="stylesheet" href="../../../frontend/assets/css/style.css">
</head>
<body class="d-flex align-items-center" style="min-height:100vh;">
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-4">
      <div class="card-soft text-center">
        <h4 class="mb-1">Hospital Admin</h4>
        <p class="text-muted small mb-4">System Administration</p>
        <?php if ($error): ?><div class="alert alert-danger py-2"><?= clean($error) ?></div><?php endif; ?>
        <form method="POST" class="text-left">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" name="email" class="form-control" required autofocus>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" class="form-control" required>
          </div>
          <button type="submit" class="btn btn-teal btn-block">Login</button>
        </form>
        <p class="small text-muted mt-3 mb-0">System Admin: admin@hospitalfeedback.com<br>Hospital Admin: rajendran.s1@example.com<br>Password: Admin@123</p>
      </div>
    </div>
  </div>
</div>
</body>
</html>
