<?php
$pageTitle = 'Select Hospital';
require_once(__DIR__ . '/../backend/includes/functions.php');
require_once __DIR__ . '/' . '../backend/config/database.php';
require_once 'includes/header.php';

$pdo = getDBConnection();
$stmt = $pdo->query("SELECT * FROM hospital WHERE status = 'Active'");
$hospitals = $stmt->fetchAll();
?>

<div class="container d-flex flex-column align-items-center justify-content-center" style="min-height: 80vh;">
    
    <div class="text-center mb-5">
        <h2 class="mb-3" style="color:var(--navy); font-size: 30px; font-weight: 700;">Welcome</h2>
        <p class="mb-4" style="color:var(--text-secondary); font-size: 14px; font-weight: 400; max-width: 500px; margin: 0 auto;">Please select your healthcare center to continue providing your valuable feedback.</p>
    </div>

    <div class="card-soft" style="width: 100%; max-width: 600px; padding: 2rem; border-left: none;">
        <div class="form-group mb-4 position-relative">
            <div class="search-location-icon" style="left: 16px; top: 50%; transform: translateY(-50%); position: absolute; z-index: 10; font-size: 16px; color: var(--text-secondary);">🔍</div>
            <input type="text" id="hospitalSearch" class="form-control form-control-lg pl-5" style="border-radius: 8px; font-size: 16px; padding: 12px 16px 12px 40px;" placeholder="Search your hospital..." onkeyup="filterHospitals()">
        </div>

        <div class="list-group text-left" id="hospitalList" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
            <?php foreach ($hospitals as $hospital): ?>
                <a href="patient-login.php?hospital_id=<?= (int)$hospital['hospital_id'] ?>" class="list-group-item list-group-item-action hospital-item d-none align-items-center" style="border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--border-soft); padding: 16px 20px; transition: all 0.3s ease; background: #fff;">
                    <div class="icon-circle mr-3" style="width: 50px; height: 50px; font-size: 1.5rem; background: var(--blue-light); color: var(--primary); display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 50%;">
                        <?php if(!empty($hospital['logo'])): ?>
                            <img src="../backend/uploads/<?= clean($hospital['logo']) ?>" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.outerHTML='🏥'">
                        <?php else: ?>
                            🏥
                        <?php endif; ?>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-1 text-dark font-weight-bold hospital-name" style="font-size: 1.1rem; font-family: 'Open Sans', sans-serif;"><?= clean($hospital['name']) ?></h6>
                        <small class="text-muted d-flex align-items-center">
                            <span class="mr-1" style="font-size:0.8rem">📍</span> <?= strtolower(str_replace(' ', '', clean($hospital['name']))) ?>.feedback.com
                        </small>
                    </div>
                    <div class="text-muted" style="font-size: 1.2rem;">→</div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<style>
.hospital-item:hover {
    border-color: var(--primary) !important;
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
    z-index: 1;
}
.hospital-item:hover .icon-circle {
    background: var(--primary) !important;
    color: #fff !important;
}
.hospital-item:hover .text-muted {
    color: var(--primary) !important;
}
</style>

<script>
function filterHospitals() {
    let input = document.getElementById('hospitalSearch').value.toLowerCase().trim();
    let items = document.getElementsByClassName('hospital-item');
    for (let i = 0; i < items.length; i++) {
        let name = items[i].getElementsByClassName('hospital-name')[0].innerText.toLowerCase();
        if (input.length >= 2 && name.indexOf(input) > -1) {
            items[i].classList.remove('d-none');
            items[i].classList.add('d-flex');
        } else {
            items[i].classList.remove('d-flex');
            items[i].classList.add('d-none');
        }
    }
}
</script>

<?php require_once 'includes/footer.php'; ?>
