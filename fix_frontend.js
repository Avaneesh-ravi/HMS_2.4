const fs = require('fs');

const f = 'C:/xampp/htdocs/HMS_V6/HMS_V2.2/frontend_source/src/app/components/AdminDashboard.tsx';
let code = fs.readFileSync(f, 'utf8');

// Fix 1: recommend logic using question_text instead of question_en
code = code.replace(
    /const recObj = item\.rawYesNo\.find\(\(y: any\) => String\(y\.question_en\)\.toLowerCase\(\)\.includes\('recommend'\)\);/,
    "const recObj = item.rawYesNo.find((y: any) => String(y.question_text || y.question_en || y.question_text_en).toLowerCase().includes('recommend'));"
);

fs.writeFileSync(f, code);
console.log('Fixed AdminDashboard frontend logic for Recommend Yes/No computation.');
