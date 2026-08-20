<?php
/**
 * Shared header for all PATIENT-facing pages.
 * Expects (optional) $pageTitle to be set before including.
 */
if (!isset($pageTitle)) { $pageTitle = 'Patient Feedback Form'; }

// Initialize defaults for the header brand block
$headerHospitalName = 'Healthcare Center';
$headerHospitalAddress = '';
$headerHospitalPhone = '';
$headerHospitalLogo = 'assets/images/logo-placeholder.png';
$showBrand = false;

// If we are NOT on the index page (Select Hospital), we want to show the hospital brand
if ($pageTitle !== 'Select Hospital') {
    $showBrand = true;
    // Attempt to fetch hospital details if a valid ID is provided
    if (isset($_GET['hospital_id']) || isset($hospitalId)) {
        $hId = (int)($_GET['hospital_id'] ?? $hospitalId);
        if ($hId > 0) {
            try {
                // Ensure $pdo is available
                if (!isset($pdo)) {
                    require_once __DIR__ . '/../../backend/config/database.php';
                    $pdo = getDBConnection();
                }
                $stmtH = $pdo->prepare("SELECT name, address1, address2, mobile, logo FROM hospital WHERE hospital_id = ?");
                $stmtH->execute([$hId]);
                $hRow = $stmtH->fetch(PDO::FETCH_ASSOC);
                
                if ($hRow) {
                    $headerHospitalName = $hRow['name'] ?: 'Healthcare Center';
                    
                    $addrParts = [];
                    if (!empty($hRow['address1'])) $addrParts[] = $hRow['address1'];
                    if (!empty($hRow['address2'])) $addrParts[] = $hRow['address2'];
                    $headerHospitalAddress = implode(', ', $addrParts);
                    
                    $headerHospitalPhone = $hRow['mobile'] ?: '';
                    
                    if (!empty($hRow['logo'])) {
                        $headerHospitalLogo = '../backend/uploads/' . $hRow['logo'];
                    }
                }
            } catch (Exception $e) {
                // Ignore DB errors in header context, keep defaults
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= clean($pageTitle) ?> | <?= clean($headerHospitalName) ?></title>

<!-- Bootstrap 4.5.2 -->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap" rel="stylesheet">
<!-- Custom theme -->
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<header class="site-header sticky-top">
  <div class="container d-flex align-items-center justify-content-between flex-wrap py-4 px-4">
    <?php if ($showBrand): ?>
    <div class="d-flex align-items-center hospital-brand">
      <img src="<?= clean($headerHospitalLogo) ?>" alt="Hospital Logo" class="hospital-logo mr-3" onerror="this.src='assets/images/logo-placeholder.png'">
      <div>
        <div class="hospital-name"><?= clean($headerHospitalName) ?></div>
        <?php if (!empty($headerHospitalAddress) || !empty($headerHospitalPhone)): ?>
        <div class="hospital-meta">
            <?= clean($headerHospitalAddress) ?>
            <?= (!empty($headerHospitalAddress) && !empty($headerHospitalPhone)) ? ' &bull; ' : '' ?>
            <?= clean($headerHospitalPhone) ?>
        </div>
        <?php endif; ?>
      </div>
    </div>
    <?php else: ?>
    <div></div> <!-- Empty spacer to keep lang toggle on the right -->
    <?php endif; ?>
  </div>
</header>

<main class="py-4">
