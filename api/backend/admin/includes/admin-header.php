<?php if (!isset($pageTitle)) { $pageTitle = 'Admin Dashboard'; } ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= clean($pageTitle) ?> | Admin</title>
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Roboto:wght@400;700&display=swap">
<link rel="stylesheet" href="../../frontend/assets/css/style.css">
</head>
<body>
<?php 
$hospitalName = 'Hospital Admin';
if (!empty($_SESSION['hospital_id'])) {
    if (!empty($_SESSION['hospital_name'])) {
        $hospitalName = $_SESSION['hospital_name'];
    } else {
        global $pdo;
        if (isset($pdo)) {
            $stmt = $pdo->prepare("SELECT name FROM hospital WHERE hospital_id = ?");
            $stmt->execute([$_SESSION['hospital_id']]);
            $hospitalName = $stmt->fetchColumn() ?: 'Hospital Admin';
            $_SESSION['hospital_name'] = $hospitalName;
        }
    }
}
?>
<div class="d-flex flex-wrap">
  <nav class="admin-sidebar col-12 col-md-2 p-3">
    <h6 class="text-uppercase text-muted small mb-3 px-2">
      <?php if (empty($_SESSION['hospital_id'])): ?>
        🌍 System Admin
      <?php else: ?>
        🏥 <?= clean($hospitalName) ?>
      <?php endif; ?>
    </h6>
    <a href="dashboard.php" class="<?= ($active ?? '') === 'dashboard' ? 'active' : '' ?>">📊 Overview</a>
    <a href="responses.php" class="<?= ($active ?? '') === 'responses' ? 'active' : '' ?>">📝 Feedback Responses</a>
    <a href="form-builder.php" class="<?= ($active ?? '') === 'form-builder' ? 'active' : '' ?>">🛠️ Form Builder</a>
    <a href="logout.php" class="text-danger mt-4">🚪 Logout</a>
  </nav>
  <main class="col-12 col-md-10 p-4">
    <div class="d-flex justify-content-between align-items-center flex-wrap mb-4">
      <h4 class="mb-0"><?= clean($pageTitle) ?></h4>
      <span class="text-muted small">Logged in as <?= clean($_SESSION['admin_username'] ?? 'Admin') ?></span>
    </div>
