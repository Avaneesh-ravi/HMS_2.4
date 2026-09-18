<?php
$base = __DIR__;

// 1. Create directories
@mkdir("$base/frontend");
@mkdir("$base/frontend/includes");
@mkdir("$base/backend");
@mkdir("$base/backend/includes");

// 2. Move files
rename("$base/index.php", "$base/frontend/index.php");
rename("$base/feedback-form.php", "$base/frontend/feedback-form.php");
rename("$base/thank-you.php", "$base/frontend/thank-you.php");
rename("$base/assets", "$base/frontend/assets");

rename("$base/includes/header.php", "$base/frontend/includes/header.php");
rename("$base/includes/footer.php", "$base/frontend/includes/footer.php");

rename("$base/includes/functions.php", "$base/backend/includes/functions.php");
rename("$base/config", "$base/backend/config");
rename("$base/process", "$base/backend/process");
rename("$base/ajax", "$base/backend/ajax");
rename("$base/admin", "$base/backend/admin");
rename("$base/database", "$base/backend/database");

// Create new root index.php
file_put_contents("$base/index.php", "<?php header('Location: frontend/index.php'); exit;");

// 3. Update paths in frontend/index.php
$c = file_get_contents("$base/frontend/index.php");
$c = str_replace("require_once 'includes/functions.php';", "require_once '../backend/includes/functions.php';", $c);
$c = str_replace("require_once 'config/database.php';", "require_once '../backend/config/database.php';", $c);
file_put_contents("$base/frontend/index.php", $c);

// 4. Update paths in frontend/feedback-form.php
$c = file_get_contents("$base/frontend/feedback-form.php");
$c = str_replace("require_once 'includes/functions.php';", "require_once '../backend/includes/functions.php';", $c);
$c = str_replace("action=\"process/submit-feedback.php\"", "action=\"../backend/process/submit-feedback.php\"", $c);
file_put_contents("$base/frontend/feedback-form.php", $c);

// 5. Update paths in backend/process/submit-feedback.php
$c = file_get_contents("$base/backend/process/submit-feedback.php");
$c = str_replace("redirect('../thank-you.php');", "redirect('../../frontend/thank-you.php');", $c);
file_put_contents("$base/backend/process/submit-feedback.php", $c);

// 6. Update paths in backend/admin/includes/admin-header.php
$c = file_get_contents("$base/backend/admin/includes/admin-header.php");
$c = str_replace("href=\"../assets/css/style.css\"", "href=\"../../frontend/assets/css/style.css\"", $c);
$c = str_replace("href=\"../index.php\"", "href=\"../../frontend/index.php\"", $c);
file_put_contents("$base/backend/admin/includes/admin-header.php", $c);

// 7. Update paths in backend/admin/login.php
$c = file_get_contents("$base/backend/admin/login.php");
$c = str_replace("href=\"../assets/css/style.css\"", "href=\"../../frontend/assets/css/style.css\"", $c);
file_put_contents("$base/backend/admin/login.php", $c);

// 8. Update paths in frontend/includes/header.php
$c = file_get_contents("$base/frontend/includes/header.php");
// already points to "assets/css/style.css" which is correct for frontend/
file_put_contents("$base/frontend/includes/header.php", $c);

echo "Refactoring complete.";
?>
