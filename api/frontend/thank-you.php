<?php
require_once __DIR__ . '/' . '../backend/includes/functions.php';
require_once __DIR__ . '/' . '../backend/config/database.php';

$hospital_id = (int)($_GET['hospital_id'] ?? 1);
$hospitalName = 'Healthcare Center';

if ($hospital_id > 0) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT name FROM hospital WHERE hospital_id = ?");
        $stmt->execute([$hospital_id]);
        $name = $stmt->fetchColumn();
        if ($name) $hospitalName = $name;
    } catch (Exception $e) {}
}

$pageTitle = 'Thank You';
require_once __DIR__ . '/includes/header.php';
?>
<div class="container d-flex align-items-center justify-content-center" style="min-height: 80vh;">
  <div class="card-soft text-center position-relative" style="width: 100%; max-width: 500px; padding: 50px 40px; border-left: none;">
    
    <div style="position: relative; z-index: 1;">
        <div class="icon-circle mx-auto mb-4 success-anim" style="width: 90px; height: 90px; font-size: 3rem; background: #dcfce7; color: var(--secondary); box-shadow: 0 8px 20px rgba(22,163,74,0.2);">✔️</div>
        
        <h2 class="mt-3 mb-2" style="font-family: 'Open Sans', sans-serif; font-weight: 800; color: var(--navy); font-size: 2.2rem;">Thank You!</h2>
        <p class="text-muted mb-4" style="font-size: 1.1rem; line-height: 1.6;">Your feedback has been submitted successfully and will help us improve our services.</p>
        
        <a id="backBtn" href="feedback-form.php?hospital_id=<?= $hospital_id ?>" class="btn btn-teal btn-lg d-inline-flex align-items-center justify-content-center" style="padding: 14px 24px; font-size: 1.05rem;" onclick="clearDraft()">
            <span class="mr-2">←</span> Back to Patient Feedback Form
        </a>
        <p class="small text-muted mt-3 mb-0" style="font-size: 0.9rem;">நோயாளி கருத்து படிவத்திற்கு திரும்பு</p>
    </div>
  </div>
</div>

<style>
.success-anim {
    animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}
</style>

<script>
function clearDraft() {
    localStorage.removeItem('feedbackFormDraft');
}

// Preserve hospital_id dynamically if available in storage or query params
(function() {
    var storedHospitalId = localStorage.getItem('selected_hospital_id');
    var currentUrlParam = new URLSearchParams(window.location.search).get('hospital_id');
    var finalHospitalId = currentUrlParam || storedHospitalId || '<?= $hospital_id ?>' || '1';
    var backBtn = document.getElementById('backBtn');
    if (backBtn && finalHospitalId) {
        backBtn.href = 'feedback-form.php?hospital_id=' + encodeURIComponent(finalHospitalId);
    }
})();
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
