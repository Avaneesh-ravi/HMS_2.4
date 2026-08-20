<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();
try {
    $pdo->exec("ALTER TABLE yesno_question ADD COLUMN describe_issue_trigger VARCHAR(10) DEFAULT 'no'");
    echo 'ADDED COLUMN';
} catch(Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false || strpos($e->getMessage(), 'already exists') !== false) {
        echo 'ALREADY EXISTS';
    } else {
        echo $e->getMessage();
    }
}
