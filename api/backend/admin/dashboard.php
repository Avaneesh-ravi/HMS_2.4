<?php
require_once __DIR__ . '/' . '../config/database.php';
require_once __DIR__ . '/' . '../includes/functions.php';
ensureSession();
requireAdminLogin();

// Prevent browser caching stale JS/CSS
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$assets = getViteAssets(__DIR__ . '/../../../frontend/index.html');
$latestJs = $assets['js'];
$latestCss = $assets['css'];
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Apollo Healthcare Center — Admin Dashboard</title>
    <meta name="robots" content="noindex, nofollow" />
    <script>
      window.ADMIN_HOSPITAL_ID = <?= json_encode((int)($_SESSION['hospital_id'] ?? 0)) ?>;
    </script>
    <style>
      html, body { height: 100%; margin: 0; background: #f9fafb; }
      #root { height: 100%; }
      #error-box { display: none; padding: 20px; background: #fff0f0; border: 1px solid red; color: red; position: fixed; z-index: 9999; top: 0; width: 100%; font-family: monospace; }
    </style>
    <script>
      window.addEventListener('error', function(e) {
        console.error(e);
      });
      window.addEventListener('unhandledrejection', function(e) {
        console.error(e);
      });
    </script>
    
    <script type="module" crossorigin src="../../../frontend/assets/<?= $latestJs ?>?v=<?= time() ?>"></script>
    <link rel="stylesheet" crossorigin href="../../../frontend/assets/<?= $latestCss ?>?v=<?= time() ?>">
  </head>
  <body>
    <div id="error-box"></div>
    <div id="root"></div>
  </body>
</html>
