<?php
$pageTitle = 'Hospital Login';
require_once __DIR__ . '/' . '../backend/includes/functions.php';
require_once __DIR__ . '/' . '../backend/config/database.php';

$hospitalId = (int)($_GET['hospital_id'] ?? 1);
$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT name FROM hospital WHERE hospital_id = ?");
$stmt->execute([$hospitalId]);
$hospitalName = $stmt->fetchColumn() ?: 'Healthcare Center';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $hId = (int)$_POST['hospital_id'];
    $userid = trim($_POST['userid'] ?? '');
    $pass = $_POST['password'] ?? '';
    
    // Check if the user is an admin in the database
    $stmt = $pdo->prepare("SELECT * FROM hospital_admin WHERE email = :e OR username = :u LIMIT 1");
    $stmt->execute([':e' => $userid, ':u' => $userid]);
    $adminUser = $stmt->fetch();
    
    if ($adminUser) {
        // They typed admin credentials
        if ($adminUser['hospital_id'] != $hId && $adminUser['hospital_id'] != 0) {
            $error = 'These credentials do not belong to this hospital. Access denied.';
        } else {
            // Verify password
            $isValid = str_starts_with($adminUser['password_hash'], '$2y$') ? password_verify($pass, $adminUser['password_hash']) : hash('sha256', $pass) === $adminUser['password_hash'];
            if (!$isValid) {
                $error = 'Invalid password.';
            } else {
                // Log them in and redirect to feedback form as requested for the kiosk unlock scenario
                $_SESSION['admin_id'] = $adminUser['hospital_admin_id'];
                $_SESSION['admin_username'] = $adminUser['username'];
                $_SESSION['hospital_id'] = $adminUser['hospital_id'];
                $_SESSION['role'] = $adminUser['role'];
                
                // Set cookies for Vercel stateless session persistence
                $token = md5($adminUser['hospital_admin_id'] . $adminUser['password_hash'] . 'secret_key_123');
                setcookie('hms_admin_auth', $adminUser['hospital_admin_id'], time() + 86400, '/');
                setcookie('hms_admin_token', $token, time() + 86400, '/');
                setcookie('hms_hospital_id', $adminUser['hospital_id'], time() + 86400, '/');

                // Correctly forward to the patient feedback portal
                redirect("feedback-form.php?hospital_id=" . $adminUser['hospital_id']);
            }
        }
    } else {
        // If they are not an admin, we assume it's a patient dummy login
        // For security, if they typed anything that looks like an attempt, we can let them through 
        // to the patient form OR require a real check. The prompt implies they wanted an error for WRONG credentials.
        if ($userid === 'patient' || empty($userid)) {
            redirect("feedback-form.php?hospital_id=" . $hId);
        } else {
            $error = 'Invalid patient ID or unregistered user.';
        }
    }
}
require_once 'includes/header.php';
?>

<div class="container d-flex align-items-center justify-content-center" style="min-height: 85vh;">
    <div class="card-soft text-center position-relative" style="width: 100%; max-width: 440px; padding: 40px; border-left: none;">
        
        <div style="position: relative; z-index: 1;">
            <div class="icon-circle mx-auto mb-4" style="width: 80px; height: 80px; font-size: 2.5rem; background: var(--blue-light); color: var(--primary); box-shadow: 0 8px 16px rgba(13,148,136,0.15); display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 50%;">
                <img src="<?= clean($headerHospitalLogo) ?>" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.outerHTML='🏥'">
            </div>
            
            <h3 class="mb-1" style="color:var(--navy); font-weight:700; font-size: 30px;"><?= clean($hospitalName) ?></h3>
            <p class="mb-4" style="color: var(--text-secondary); font-size: 14px; font-weight: 400;">Patient Feedback Portal</p>
            
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger" style="font-size: 14px; padding: 10px; border-radius: 8px; margin-bottom: 20px;"><?= clean($error) ?></div>
            <?php endif; ?>

            <form method="POST">
                <input type="hidden" name="hospital_id" value="<?= $hospitalId ?>">
                
                <div class="form-group text-left mb-3">
                    <label style="font-size: 14px; font-weight: 500; color: var(--text-label); margin-bottom: 8px; display: block;">Email / User ID</label>
                    <input type="text" name="userid" class="form-control form-control-lg" placeholder="Enter your ID" required style="border-radius: 8px; font-size: 16px; padding: 12px 16px;">
                </div>
                
                <div class="form-group text-left mb-4">
                    <label style="font-size: 14px; font-weight: 500; color: var(--text-label); margin-bottom: 8px; display: block;">Password</label>
                    <input type="password" name="password" class="form-control form-control-lg" placeholder="Enter password" required style="border-radius: 8px; font-size: 16px; padding: 12px 16px;">
                </div>
                
                <button type="submit" class="btn btn-teal btn-lg btn-block mb-4" style="font-size: 16px; font-weight: 700; padding: 14px; border-radius: 12px;">LOGIN TO CONTINUE</button>
                
                <div class="d-flex justify-content-between align-items-center small mt-3 pt-3" style="border-top: 1px solid var(--border-soft);">
                    <a href="#" style="color: var(--text-secondary); font-size: 14px;" class="text-decoration-none hover-primary transition">Forgot password?</a>
                    <a href="index.php" style="color: var(--primary); font-size: 14px; font-weight: 700;" class="text-decoration-none">Change Hospital</a>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
.hover-primary:hover { color: var(--primary) !important; }
.transition { transition: all 0.3s ease; }
</style>

<?php require_once 'includes/footer.php'; ?>
