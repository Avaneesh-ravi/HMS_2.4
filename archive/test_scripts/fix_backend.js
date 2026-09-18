const fs = require('fs');

['C:/xampp/htdocs/HMS_V6 .1/HMS_V2.2/api/backend/ajax/get-responses.php', 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/api/backend/ajax/get-responses.php'].forEach(f => {
    let code = fs.readFileSync(f, 'utf8');
    
    // Fix ratings DB query filtering
    let search = `WHERE r.patient_id = ?");
        $rStmt->execute([$row['patient_id']]);`;
        
    let replacement = `WHERE r.patient_id = ? AND r.feedback_form_id = ? AND DATE(r.created_at) = DATE(?)");
        $rStmt->execute([$row['patient_id'], $row['feedback_form_id'], $row['submitted_at']]);`;
        
    code = code.replace(search, replacement);
    fs.writeFileSync(f, code);
});

console.log('Fixed get-responses.php');
