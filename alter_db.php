<?php
require 'api/backend/config/database.php';
$pdo = getDBConnection();

try {
    $pdo->exec("ALTER TABLE yesno_question ADD COLUMN describe_issue_trigger VARCHAR(10) DEFAULT 'no'");
    echo "Added describe_issue_trigger.\n";
} catch (Exception $e) {
    echo "describe_issue_trigger err: " . $e->getMessage() . "\n";
}

try {
    $pdo->exec("ALTER TABLE yesno_question ADD COLUMN status VARCHAR(20) DEFAULT 'Active'");
    echo "Added status.\n";
} catch (Exception $e) {
    echo "status err: " . $e->getMessage() . "\n";
}
