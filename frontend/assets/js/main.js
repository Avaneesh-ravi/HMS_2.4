/* ==========================================================
   Hospital Feedback Form — main.js
   Handles: step wizard, emoji ratings, yes/no toggles,
   conditional textareas, gender pills, autosave draft.
   ========================================================== */

let currentStep = 1;
const totalSteps = 4;

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.emoji-row').forEach(renderEmojiRow);
  initStepper();
  initEmojiRatings();
  initYesNoToggles();
  initGenderPills();
  initOpIpToggle();
  initAutosave();
});

/* ---------------- Step Wizard ---------------- */
function initStepper() {
  showStep(1);

  document.querySelectorAll('.btn-next-step').forEach(btn => {
    btn.addEventListener('click', function () {
      if (!validateStep(currentStep)) return;
      if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        if (currentStep === totalSteps) buildReviewSummary();
      }
    });
  });

  document.querySelectorAll('.btn-prev-step').forEach(btn => {
    btn.addEventListener('click', function () {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  document.querySelectorAll('.step-edit-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      currentStep = parseInt(this.dataset.step, 10);
      showStep(currentStep);
    });
  });
}

function showStep(step) {
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('step-' + step);
  if (target) target.classList.add('active');

  document.querySelectorAll('.step-item').forEach(el => {
    const s = parseInt(el.dataset.step, 10);
    el.classList.remove('active', 'done');
    if (s < step) el.classList.add('done');
    if (s === step) el.classList.add('active');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
  const stepEl = document.getElementById('step-' + step);
  if (!stepEl) return true;
  const requiredFields = stepEl.querySelectorAll('[required]');
  let valid = true;
  requiredFields.forEach(field => {
    if (!field.value || (field.type === 'radio' && !stepEl.querySelector(`[name="${field.name}"]:checked`))) {
      if (field.type !== 'radio' || !stepEl.querySelector(`[name="${field.name}"]:checked`)) {
        field.classList.add('is-invalid');
        valid = false;
      }
    } else {
      field.classList.remove('is-invalid');
    }
  });
  if (!valid) alert('Please fill all required fields before continuing.');
  return valid;
}

/* ---------------- Emoji Rating ---------------- */
const EMOJI_MAP = {
  1: { face: '😞', label: 'Very Bad' },
  2: { face: '🙁', label: 'Poor' },
  3: { face: '😐', label: 'Average' },
  4: { face: '🙂', label: 'Good' },
  5: { face: '😄', label: 'Excellent' },
};

function initEmojiRatings() {
  document.querySelectorAll('.emoji-row').forEach(row => {
    const hiddenInput = document.getElementById(row.dataset.input);
    row.querySelectorAll('.emoji-option').forEach(opt => {
      opt.addEventListener('click', function () {
        const value = this.dataset.value;
        const alreadySelected = this.classList.contains('selected');

        row.querySelectorAll('.emoji-option').forEach(o => o.classList.remove('selected'));

        if (!alreadySelected) {
          this.classList.add('selected');
          if (hiddenInput) hiddenInput.value = value;
        } else {
          if (hiddenInput) hiddenInput.value = '';
        }
      });
    });
  });
}

/** Builds the 5 emoji option buttons inside a given row element */
function renderEmojiRow(rowEl) {
  rowEl.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const opt = document.createElement('div');
    opt.className = 'emoji-option';
    opt.dataset.value = i;
    opt.innerHTML = `<div class="emoji-face">${EMOJI_MAP[i].face}</div><div class="emoji-label">${EMOJI_MAP[i].label}</div>`;
    rowEl.appendChild(opt);
  }
}

/* ---------------- Yes/No Toggles ---------------- */
function initYesNoToggles() {
  document.querySelectorAll('.yesno-toggle').forEach(group => {
    const hiddenInput = document.getElementById(group.dataset.input);
    const conditionalBox = group.dataset.conditional ? document.getElementById(group.dataset.conditional) : null;
    const showOn = group.dataset.showOn || 'No'; // which answer reveals the textarea

    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function () {
        const val = this.dataset.value;
        group.querySelectorAll('button').forEach(b => b.classList.remove('active-yes', 'active-no'));
        this.classList.add(val === 'Yes' ? 'active-yes' : 'active-no');
        if (hiddenInput) hiddenInput.value = val;

        if (conditionalBox) {
          if (val === showOn) {
            conditionalBox.classList.add('show');
          } else {
            conditionalBox.classList.remove('show');
            const ta = conditionalBox.querySelector('textarea');
            if (ta) ta.value = '';
          }
        }
      });
    });
  });
}

/* ---------------- Gender Pills ---------------- */
function initGenderPills() {
  document.querySelectorAll('.gender-group').forEach(group => {
    const hiddenInput = document.getElementById(group.dataset.input);
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function () {
        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (hiddenInput) hiddenInput.value = this.dataset.value;
      });
    });
  });
}

/* ---------------- OP / IP Toggle ---------------- */
function initOpIpToggle() {
  const radios = document.querySelectorAll('input[name="visit_type"]');
  if (!radios.length) return;
  radios.forEach(r => r.addEventListener('change', updateVisitLabel));
  updateVisitLabel();
}
function updateVisitLabel() {
  const checked = document.querySelector('input[name="visit_type"]:checked');
  const labelEl = document.getElementById('visitUhidLabel');
  if (checked && labelEl) {
    labelEl.textContent = 'UHID (' + checked.value + ')';
  }
}

/* ---------------- Autosave Draft (localStorage) ---------------- */
function initAutosave() {
  const form = document.getElementById('feedbackForm');
  if (!form) return;

  const badge = document.getElementById('autosaveBadge');
  let saveTimer;

  form.addEventListener('input', function () {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 800);
  });

  const saveDraftBtn = document.getElementById('saveDraftBtn');
  if (saveDraftBtn) saveDraftBtn.addEventListener('click', () => saveDraft(true));

  function saveDraft(manual) {
    const data = {};
    new FormData(form).forEach((value, key) => { data[key] = value; });
    localStorage.setItem('hospital_feedback_draft', JSON.stringify(data));
    if (badge) {
      badge.style.display = 'block';
      badge.textContent = manual ? 'Draft saved ✓' : 'Auto-saved ✓';
      setTimeout(() => { badge.style.display = 'none'; }, 2000);
    }
  }

  // Restore draft on load
  const saved = localStorage.getItem('hospital_feedback_draft');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field && data[key]) field.value = data[key];
      });
    } catch (e) { /* ignore corrupted draft */ }
  }
}

function clearDraft() {
  localStorage.removeItem('hospital_feedback_draft');
}

/* ---------------- Review Step Summary ---------------- */
function buildReviewSummary() {
  const summaryEl = document.getElementById('reviewSummary');
  if (!summaryEl) return;
  const form = document.getElementById('feedbackForm');
  const name = form.querySelector('[name="full_name"]')?.value || 'Patient Details';
  const uhid = form.querySelector('[name="uhid"]')?.value || '—';

  let ratingsFilled = 0;
  document.querySelectorAll('input[type="hidden"][id^="rating_"]').forEach(inp => {
    if (inp.value) ratingsFilled++;
  });

  const overall = form.querySelector('[name="rating_overall"]')?.value || '—';
  const recommend = form.querySelector('[name="would_recommend"]')?.value || '—';

  summaryEl.innerHTML = `
    <div class="row">
      <div class="col-md-3 col-6 mb-3"><div class="card-soft text-center py-3"><div class="text-muted small">Patient</div><div class="font-weight-bold">${name}</div></div></div>
      <div class="col-md-3 col-6 mb-3"><div class="card-soft text-center py-3"><div class="text-muted small">UHID</div><div class="font-weight-bold">${uhid}</div></div></div>
      <div class="col-md-3 col-6 mb-3"><div class="card-soft text-center py-3"><div class="text-muted small">Ratings Given</div><div class="font-weight-bold">${ratingsFilled} / 13</div></div></div>
      <div class="col-md-3 col-6 mb-3"><div class="card-soft text-center py-3"><div class="text-muted small">Would Recommend</div><div class="font-weight-bold">${recommend}</div></div></div>
    </div>`;
}

/* ---------------- Language Toggle (stub) ---------------- */
function toggleLanguage() {
  document.querySelectorAll('[data-ta]').forEach(el => {
    const en = el.dataset.en || el.textContent;
    if (!el.dataset.en) el.dataset.en = el.textContent;
    el.textContent = el.textContent === el.dataset.en ? el.dataset.ta : el.dataset.en;
  });
}
