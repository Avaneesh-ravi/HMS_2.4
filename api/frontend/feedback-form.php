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

$assets = getViteAssets(__DIR__ . '/../../frontend/index.html');
$latestJs = $assets['js'];
$latestCss = $assets['css'];
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= clean($hospitalName) ?> — Patient Feedback Form</title>
    <meta name="description" content="Streamline patient feedback collection with an intuitive, bilingual form that enhances hospital service evaluation and improves patient experience." />
    <meta name="robots" content="noindex, nofollow" />
    <style>html, body { height: 100%; margin: 0; } #root { height: 100%; }</style>
    
    <script type="module" crossorigin src="./assets/<?= $latestJs ?>"></script>
    <link rel="stylesheet" crossorigin href="./assets/<?= $latestCss ?>">
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Observer for feedback form validation banner
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && node.textContent.includes('Please fix the errors')) {
                const invalidInputs = document.querySelectorAll('.border-red-500');
                if (invalidInputs.length > 0) {
                  const labels = Array.from(invalidInputs).map(input => {
                    let label = '';
                    const id = input.id;
                    if (id) {
                      const labelEl = document.querySelector(`label[for="${id}"]`);
                      if (labelEl) label = labelEl.textContent.replace('*', '').trim();
                    }
                    if (!label) {
                      const parent = input.closest('div');
                      if (parent) {
                        const labelEl = parent.querySelector('label');
                        if (labelEl) label = labelEl.textContent.replace('*', '').trim();
                      }
                    }
                    return label || 'Unknown Field';
                  });
                  node.textContent = '⚠️ Please fix: ' + labels.join(', ');
                }
              }
            });
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    </script>
  </body>
</html>
