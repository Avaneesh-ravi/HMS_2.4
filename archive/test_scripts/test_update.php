<?php
require 'backend/config/database.php';
$pdo = getDBConnection();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
try {
    $stmt = $pdo->prepare("UPDATE feedback_form SET layout_mode = ?, combine_pages = ?, theme_color = ?, font_size = ?, show_title_labels = ?, departments = ? WHERE feedback_form_id = ?");
    $stmt->execute([1, 1, '#0d9488', 'Normal', 1, '["Cardiology"]', 1]);
    echo "Success!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
