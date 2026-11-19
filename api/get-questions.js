import { query } from './db.js';

function resolveHospitalId(rawId) {
  const str = String(rawId || '').toLowerCase().trim();
  if (str === '1' || str.includes('apl') || str.includes('apollo')) return 1;
  if (str === '2' || str.includes('cmc') || str.includes('city')) return 2;
  if (str === '3' || str.includes('gov') || str.includes('govt')) return 3;
  const num = parseInt(str, 10);
  return isNaN(num) ? 1 : num;
}

const FALLBACK_QUESTIONS_BY_HOSPITAL = {
  1: [
    { id: "30", label: "Responsiveness at Reception", tamilLabel: "வரவேற்பறையில் கவனிப்பு", ratingMode: "emoji" },
    { id: "31", label: "Admission Process", tamilLabel: "உள்சேர்க்கை முறை", ratingMode: "emoji" },
    { id: "32", label: "Billing Services", tamilLabel: "பில்லிங் சேவைகள்", ratingMode: "emoji" },
    { id: "33", label: "Doctor's Treatment", tamilLabel: "மருத்துவரின் கவனிப்பு", ratingMode: "emoji" },
    { id: "34", label: "Nursing Care", tamilLabel: "செவிலியர் சேவை", ratingMode: "emoji" },
    { id: "35", label: "Pharmacy Services", tamilLabel: "மருந்தக சேவைகள்", ratingMode: "emoji" }
  ],
  2: [
    { id: "45", label: "Responsiveness at Reception", tamilLabel: "வரவேற்பறையில் கவனிப்பு", ratingMode: "emoji" },
    { id: "46", label: "Admission Process", tamilLabel: "உள்சேர்க்கை முறை", ratingMode: "emoji" },
    { id: "47", label: "Billing Services", tamilLabel: "பில்லிங் சேவைகள்", ratingMode: "emoji" },
    { id: "48", label: "Doctor's Treatment", tamilLabel: "மருத்துவர் சிகிச்சை", ratingMode: "emoji" },
    { id: "49", label: "Nursing Care", tamilLabel: "செவிலியர் கவனிப்பு", ratingMode: "emoji" },
    { id: "50", label: "Pharmacy Services", tamilLabel: "மருந்தக சேவைகள்", ratingMode: "emoji" },
    { id: "81", label: "X-ray and Scan", tamilLabel: "எக்ஸ்-ரே மற்றும் ஸ்கேன்", ratingMode: "emoji" },
    { id: "84", label: "Physiotherapy", tamilLabel: "பிசியோதெரபி", ratingMode: "emoji" }
  ],
  3: [
    { id: "11", label: "Responsiveness at Reception", tamilLabel: "வரவேற்பறையில் பதிலளிக்கும் தன்மை", ratingMode: "emoji" },
    { id: "12", label: "Admission Process", tamilLabel: "உள்சேர்க்கை முறை", ratingMode: "emoji" },
    { id: "13", label: "Billing Services", tamilLabel: "பில்லிங் சேவைகள்", ratingMode: "emoji" },
    { id: "14", label: "Doctor's Treatment", tamilLabel: "மருத்துவரின் கவனிப்பு", ratingMode: "emoji" },
    { id: "15", label: "Nursing Care", tamilLabel: "செவிலியர் சேவை", ratingMode: "emoji" },
    { id: "43", label: "Pharmacy Services", tamilLabel: "மருந்தக சேவைகள்", ratingMode: "emoji" }
  ]
};

const FALLBACK_YESNO_BY_HOSPITAL = {
  1: [
    { id: "40", label: "Cleanliness of the hospital environment (Toilets / Other areas)", tamilLabel: "மருத்துவமனையின் சுற்றுப்புற தூய்மை (கழிப்பறைகள் / மற்ற இடங்கள்)" },
    { id: "41", label: "Were you informed about the estimated cost of treatment at admission counter?", tamilLabel: "நீங்கள் உள்நோயாளியாக சேரும்போது மதிப்பிட்டு சிகிச்சைக் கட்டணம் எவ்வளவு ஆகும் என்று கூறப்பட்டதா?" },
    { id: "42", label: "Would you refer (Hospital name)____ to your family / friends?", tamilLabel: "மருத்துவமனையின் சேவையை உங்கள் குடும்பத்திற்கும், நண்பர்களுக்கும் பரிந்துரைப்பீர்களா?" }
  ],
  2: [
    { id: "37", label: "Did you face any cleanliness issues?", tamilLabel: "தூய்மை பிரச்சினைகளை எதிர்கொண்டீர்களா?" },
    { id: "38", label: "Was the cost explained at the time of admission?", tamilLabel: "சேர்க்கையின் போது செலவு விளக்கப்பட்டதா?" },
    { id: "39", label: "Would you recommend our hospital to friends and family?", tamilLabel: "எங்கள் மருத்துவமனையை பரிந்துரைப்பீர்களா?" }
  ],
  3: [
    { id: "1", label: "Cleanliness of the hospital environment", tamilLabel: "மருத்துவமனையின் தூய்மை" },
    { id: "2", label: "Cost explained during admission?", tamilLabel: "சிகிச்சை கட்டணம் தெரிவிக்கப் பட்டதா?" },
    { id: "3", label: "Would you refer this hospital?", tamilLabel: "இம்மருத்துவமனையை பரிந்துரைப்பீர்களா?" }
  ]
};

const FALLBACK_DEPTS_BY_HOSPITAL = {
  1: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine", "ENT", "Oncology & Radiotherapy", "Emergency Department (ED/Casualty)", "Intensive Care Unit"],
  2: ["Cardiology", "Orthopedics", "General Medicine", "Neurology", "ENT", "ICU", "OPD / Outpatient"],
  3: ["Cardiology", "Orthopedics", "ENT", "General Medicine"]
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hospitalId = resolveHospitalId(req.query.hospital_id || req.query.id);

  try {
    // 1. Get the feedback form for this hospital
    let formRes = await query(
      `SELECT * FROM feedback_form WHERE hospital_id = $1 ORDER BY feedback_form_id ASC LIMIT 1`,
      [hospitalId]
    );
    let form = formRes.rows[0];

    // 2. Fetch rating questions linked to this form via feedback_form_rating_question (and active in rating_question)
    let qRes = null;
    if (form) {
      qRes = await query(
        `SELECT q.question_id as id, q.question_text_en as label, q.question_text_ta as "tamilLabel", q.rating_grade, ffrq.display_order
         FROM feedback_form_rating_question ffrq
         JOIN rating_question q ON q.question_id = ffrq.question_id
         WHERE ffrq.feedback_form_id = $1 AND ffrq.status = 'Active' AND (q.status = 'Active' OR q.active = 1)
         ORDER BY ffrq.display_order ASC, ffrq.id ASC`,
        [form.feedback_form_id]
      );
    }

    // Fallback if no questions are mapped to the form yet
    if (!qRes || qRes.rows.length === 0) {
      qRes = await query(
        `SELECT question_id as id, question_text_en as label, question_text_ta as "tamilLabel", rating_grade
         FROM rating_question 
         WHERE (hospital_id = $1 OR hospital_id IS NULL OR question_id IN (30,31,32,33,34,35))
           AND (status = 'Active' OR active = 1)
         ORDER BY question_id ASC`,
        [hospitalId]
      );
    }

    let questions = [];
    if (qRes && qRes.rows.length > 0) {
      questions = qRes.rows.map(q => {
        let ratingMode = 'emoji';
        let cardColor = undefined;
        if (q.rating_grade) {
          const parts = q.rating_grade.split('|');
          ratingMode = parts[0] || 'emoji';
          if (parts.length > 1) cardColor = parts[1];
        }
        return {
          id: String(q.id),
          label: (q.label || '').trim(),
          tamilLabel: (q.tamilLabel || '').trim(),
          ratingMode,
          cardColor
        };
      });
    }

    if (questions.length === 0) {
      questions = FALLBACK_QUESTIONS_BY_HOSPITAL[hospitalId] || FALLBACK_QUESTIONS_BY_HOSPITAL[1];
    }

    // 3. Fetch Yes/No questions
    let ynRes = null;
    if (form) {
      ynRes = await query(
        `SELECT yq.yesno_question_id as id, yq.question_en as label, yq.question_ta as "tamilLabel", ffyq.display_order
         FROM feedback_form_yesno_question ffyq
         JOIN yesno_question yq ON yq.yesno_question_id = ffyq.yesno_question_id
         WHERE ffyq.feedback_form_id = $1 AND ffyq.status = 'Active' AND yq.status = 'Active'
         ORDER BY ffyq.display_order ASC, ffyq.id ASC`,
        [form.feedback_form_id]
      );
    }

    if (!ynRes || ynRes.rows.length === 0) {
      ynRes = await query(
        `SELECT yesno_question_id as id, question_en as label, question_ta as "tamilLabel" 
         FROM yesno_question 
         WHERE (hospital_id = $1 OR hospital_id IS NULL OR yesno_question_id IN (40,41,42,1,2,3))
           AND status = 'Active'
         ORDER BY yesno_question_id ASC LIMIT 3`,
        [hospitalId]
      );
    }

    let yesno = [];
    if (ynRes && ynRes.rows.length > 0) {
      yesno = ynRes.rows.map(y => ({
        id: String(y.id),
        label: (y.label || y.tamilLabel || '').trim(),
        tamilLabel: (y.tamilLabel || y.label || '').trim()
      }));
    }

    if (yesno.length === 0) {
      yesno = FALLBACK_YESNO_BY_HOSPITAL[hospitalId] || FALLBACK_YESNO_BY_HOSPITAL[1];
    }

    // 4. Fetch Departments from department table where is_active = true
    let departments = [];
    try {
      const deptRes = await query(
        `SELECT department_name FROM department WHERE hospital_id = $1 AND is_active = true ORDER BY department_id ASC`,
        [hospitalId]
      );
      if (deptRes && deptRes.rows.length > 0) {
        departments = deptRes.rows.map(r => r.department_name);
      }
    } catch (e) {}

    if (departments.length === 0) {
      departments = FALLBACK_DEPTS_BY_HOSPITAL[hospitalId] || FALLBACK_DEPTS_BY_HOSPITAL[1];
    }

    res.status(200).json({
      success: true,
      data: questions,
      yesno_data: yesno,
      departments,
      settings: {
        departments,
        layoutMode: form?.layout_mode === 1 ? '1-column' : '2-column',
        combinePages: !!form?.combine_pages,
        themeColor: form?.theme_color || undefined,
        fontSize: form?.font_size || undefined,
        showPageTitleLabels: form?.show_title_labels !== undefined ? !!form.show_title_labels : true
      }
    });

  } catch (err) {
    const questions = FALLBACK_QUESTIONS_BY_HOSPITAL[hospitalId] || FALLBACK_QUESTIONS_BY_HOSPITAL[1];
    const yesno = FALLBACK_YESNO_BY_HOSPITAL[hospitalId] || FALLBACK_YESNO_BY_HOSPITAL[1];
    const departments = FALLBACK_DEPTS_BY_HOSPITAL[hospitalId] || FALLBACK_DEPTS_BY_HOSPITAL[1];

    res.status(200).json({
      success: true,
      data: questions,
      yesno_data: yesno,
      departments,
      settings: {
        departments,
        layoutMode: '2-column',
        combinePages: false,
        showPageTitleLabels: true
      }
    });
  }
}
