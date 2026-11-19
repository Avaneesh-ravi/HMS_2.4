# Hospital Management System (HMS) - QA Test Reports & Bug Resolution Log

This document provides a comprehensive log of all historical QA test scenarios, defect reports, user feedback tickets, and the **technical corrections and architectural fixes** implemented across the application.

---

## 📊 Summary of Resolved Test Issues

| Category | Total Logged | Resolved | Status |
|---|---|---|---|
| **Office Use & Problem Resolution** | 6 | 6 | ✅ 100% Fixed |
| **Bilingual & Tamil Font Encoding** | 6 | 6 | ✅ 100% Fixed |
| **Form Validation, OTP & Navigation** | 11 | 11 | ✅ 100% Fixed |
| **Reporting, Export & Print Layout** | 7 | 7 | ✅ 100% Fixed |
| **Admin Configuration & Dynamic Questions** | 5 | 5 | ✅ 100% Fixed |
| **Authentication, Session & Access Control** | 4 | 4 | ✅ 100% Fixed |
| **Total Test Scenarios** | **39** | **39** | ✅ **All Verified & Live** |

---

## 🛠️ Detailed Test Cases, Bug Descriptions & Corrections

### 1. Office Use & Problem Resolution Workflow

#### Ticket #19 (Ref 16): Save Office Use Details Button Not Working
- **Repro Steps**: Login as Admin $\rightarrow$ Feedback Responses $\rightarrow$ Click Resolved $\rightarrow$ Click Eye icon $\rightarrow$ Scroll down to "For Office Use Only" $\rightarrow$ Enter details and click **Save Office Details**.
- **Reported Defect**: Button was not responding or persisting data.
- **Root Cause**: Missing API route for office use updates and disconnected form state in the popup modal.
- **Correction Made**:
  1. Created `/api/save-office-use` (and local PHP handler) connecting to the PostgreSQL `complaint_review` table.
  2. Implemented `OfficeUseModal.tsx` with dedicated state bindings for `reviewOfComplaint`, `dateOfReview`, `correctiveAction`, `preventiveAction`, and `inchargeName`.
  3. Added toast notification and automatic table refresh upon successful save.

#### Ticket #20 (Ref 17): Edit Office Review Button Not Working
- **Repro Steps**: Admin Dashboard $\rightarrow$ Feedback Responses $\rightarrow$ Click Resolved $\rightarrow$ Click **Edit Office Review** button.
- **Reported Defect**: Button was unclickable or did not load existing data.
- **Correction Made**:
  1. Implemented `handleEditOfficeReview` trigger in both Feedback Responses Table and Feedback Report Section.
  2. Pre-populates `OfficeUseModal` with existing review comments, corrective action, and reviewer timestamp for seamless editing.

#### Ticket #21 (Ref 18): Saved Office Use Data Not Reflecting Under Resolved Tab
- **Repro Steps**: Admin Dashboard $\rightarrow$ Feedback Responses $\rightarrow$ Fill Office Use details $\rightarrow$ Go to Feedback Report $\rightarrow$ Verify resolved status.
- **Reported Defect**: Response still appeared under unresolved and did not update counters.
- **Correction Made**:
  1. Synchronized state in `useAdminData` / `AdminDashboard.tsx` to immediately update `officeUseByResponse` state.
  2. Updated SQL join in `/api/get-responses` to merge `complaint_review` records on `uhid` / `submission_id`.

#### Ticket #25: Action Buttons: "Resolve Problem" & "Edit Office Review" in Feedback Report
- **Reported Defect**: Buttons inside the Dedicated Problem Resolution View tabs were inactive.
- **Correction Made**:
  - Bound **Resolve Problem** button on unresolved items to open `OfficeUseModal` with pre-filled patient info.
  - Bound **Edit Office Review** button on resolved items to allow modifying previously logged corrective/preventive actions.

#### Ticket #26: Edit Office Review Button in Resolved Report View Inactive
- **Reported Defect**: Clicking Edit Office Review inside the Resolved Cards view did not open the edit dialog.
- **Correction Made**:
  - Bound the button to trigger `OfficeUseModal` populated with previous investigation notes, enabling real-time updates to `complaint_review`.

#### Ticket #31: Office Use Saved Details Not Displaying After Browser Refresh
- **Repro Steps**: Fill Office Use fields in Feedback Detail Modal $\rightarrow$ Click Save Office Details (success toast appears) $\rightarrow$ Refresh the browser page (`F5` / `Ctrl+R`) $\rightarrow$ Re-open the feedback detail modal.
- **Reported Defect**: Office Use fields appeared empty after page reload; table row lost `Resolved ✓` indicator if API latency occurred.
- **Root Cause**:
  1. Initial React state `officeUseByResponse` was initialized as empty object `{}` instead of hydrating from `localStorage`.
  2. Incoming API response fetch wiped local in-memory state if server records were slightly delayed.
  3. Single-key indexing mismatch between `uhid` and submission `id`.
- **Correction Made**:
  1. Added `getSavedOfficeUse()` hydration helper in `AdminDashboard.tsx` reading and sanitizing `localStorage.getItem('hms_saved_office_use')`.
  2. Initialized `officeUseByResponse` and initial `responses` by merging cached Office Use entries.
  3. Multi-key indexing (`uhid` and `id`) in `hms_saved_office_use` and `hms_new_submissions`.
  4. Added `CREATE TABLE IF NOT EXISTS complaint_review` in Node and PHP APIs with dual camelCase/snake_case payload normalization.
  5. Verified with automated end-to-end browser reload testing.

---

### 2. Bilingual & Tamil Font Rendering

#### Ticket #14 (Ref 11): Corrupted Text & Malformed Symbols in Service Feedback (e.g. `உள்சேர்க்கை முறை`)
- **Reported Defect**: Tamil title text rendered mojibake symbols or failed to show.
- **Root Cause**: Inconsistent character encoding (Latin-1 vs UTF-8) and escaped HTML entity artifacts.
- **Correction Made**:
  1. Standardized all bilingual Tamil strings in `real_db_data.ts` and PostgreSQL database to authentic UTF-8 Unicode (`வரவேற்பு பதில்`, `சேர்க்கை செயல்முறை`, `பில்லிங் சேவைகள்`, `மருத்துவர் சிகிச்சை`).
  2. Enforced UTF-8 charset headers in all API responses.

#### Ticket #15 (Ref 12): Unable to Add Patient Name in Tamil Font (Validation Alert Triggered)
- **Reported Defect**: Entering Tamil names (e.g., `நந்தினி`, `இளங்கோவன்`) triggered a validation error blocking the Next button.
- **Root Cause**: Regular expression on the Name input field restricted characters to `[A-Za-z]`.
- **Correction Made**:
  - Updated input validation regex in `App.tsx` to support Unicode character ranges including Tamil script (`[஀-௿]`) and international alphabets: `/^[\p{L}\s.]+$/u`.

#### Ticket #16 (Ref 13): Tamil Text Having Invalid Symbols on Questionnaire Page
- **Reported Defect**: Yes/No and questionnaire pages displayed broken symbols in Tamil mode.
- **Correction Made**:
  - Cleaned all questionnaire definitions in `real_db_data.ts` and PostgreSQL `yesno_question` table, replacing corrupted strings with standard Tamil terms (`மருத்துவமனையின் சுற்றுப்புற தூய்மை`, `சிகிச்சைச் செலவு`, etc.).

#### Ticket #23 (Ref 19): Government Hospital Feedback Saved in Tamil Not Showing in Admin
- **Reported Defect**: Responses submitted in Tamil were omitted from admin reporting.
- **Correction Made**:
  - Fixed database collation and JSONB serialization in `/api/submit-feedback` and `/api/get-responses` so UTF-8 Tamil text is stored and returned with zero loss.

#### Ticket #4 (Ref 4): Default Language Preference Not Retained
- **Correction Made**: Persisted chosen language in active session state and local storage so navigation retains the user's preferred language.

---

### 3. Reporting, Export & Print Layout

#### Ticket #22: Missing Download Report Button in Feedback Report
- **Reported Defect**: No option to export the aggregated feedback report to Excel/CSV.
- **Correction Made**:
  1. Added **Download Report** button in Feedback Report header.
  2. Engineered [`export.service.ts`](./frontend_source/src/services/export.service.ts) generating a 3-section structured spreadsheet report with UTF-8 BOM (`\uFEFF`):
     - *Section 1*: Department Rating Questions Summary (5★ distribution).
     - *Section 2*: Department Yes/No Questions Breakdown.
     - *Section 3*: Individual Patient Responses & Office Resolution Log.

#### Ticket #27: Print Feedback Report Blank Page & Left Sidebar Misalignment
- **Reported Defect**: Printing the report resulted in blank pages and cards squeezed into a narrow column due to persistent 30% sidebar.
- **Root Cause**: Tailwind CSS `overflow-hidden` containers, flex layout restrictions, and sidebar visibility during `@media print`.
- **Correction Made**:
  1. Enforced `display: none !important; width: 0; height: 0; position: absolute; left: -99999px;` on `<aside>` sidebar and `<header>`.
  2. Released `#root`, `.print-layout-root`, and `.print-main-content` to `display: block !important; width: 100% !important`.
  3. Formatted cards into a clean **2-column grid** across the full A4 page width with `break-inside: avoid`.

#### Ticket #8: Submitted Feedback Not Reflecting in Apollo Hospital Report
- **Correction Made**: Unified SQL queries and `hospital_id` filtering in `/api/get-responses` to accurately tally all submissions.

#### Ticket #9 (Ref 6): Export CSV Button Not Downloading File
- **Correction Made**: Built `export.service.ts` with browser download triggers and MIME type headers.

---

### 4. Patient Feedback Wizard, Validation & Navigation

#### Ticket #1 (Ref 1): Title Text Not Showing on Language Switch
- **Correction Made**: Wired reactive state in `App.tsx` to immediately re-render question titles in the active language (`en` or `ta`).

#### Ticket #2 (Ref 2): Missing Field Guidance Message
- **Correction Made**: Added clear field-specific validation indicators in both English and Tamil.

#### Ticket #3 (Ref 3): OTP Verification Button State
- **Correction Made**: Enabled reactive validation for 6-digit OTP inputs, allowing instant re-verification upon correction.

#### Ticket #5 (Ref 5): Post-Submission Navigation Redirecting to Search
- **Correction Made**: Retained hospital context in URL/state so the Thank You screen returns to the active hospital feedback form after the 60-second timer.

#### Ticket #6 (Ref 5): Mandatory Field Validation for Name
- **Correction Made**: Made First Name and UHID strictly required with clear visual indicators, while leaving optional fields clearly labeled.

#### Ticket #7: Admin "Back to Form" Button
- **Correction Made**: Updated `AdminSidebar.tsx` to preserve `hospital_id` parameter and route directly to `feedback-form.php?hospital_id=...` instead of the login gate.

#### Ticket #11 (Ref 8): Forgot Password Button
- **Correction Made**: Added modal dialog providing contact information for hospital IT administration password resets.

#### Ticket #12 (Ref 9): Email ID Validation
- **Correction Made**: Added standard RFC regex email validation preventing single-digit or invalid string submissions.

#### Ticket #13 (Ref 10): Age Field Negative Values
- **Correction Made**: Enforced `min="1"` and `max="120"` numeric bounds on the Age input field.

#### Ticket #24 (Ref 24): URL Direct Access Navigation
- **Correction Made**: Built `getEffectiveHospitalId` to automatically read URL parameters (`?hospital_id=...`), fall back to `localStorage`, or display clean hospital selection cards without blank screens.

#### Ticket #28: OTP Verification & Email Button Blocking on Invalid Input
- **Repro Steps**: Enter 3 digits or invalid characters in OTP field $\rightarrow$ observe Verify OTP button state.
- **Reported Defect**: Verify OTP was clickable prematurely; incomplete email addresses allowed triggering email verification.
- **Correction Made**:
  1. Disabled Verify OTP button until strict 6-digit numeric length is reached.
  2. Disabled Send OTP and email actions until email string satisfies RFC standard email format.

#### Ticket #29: Mandatory OP / IP Date Fields Validation & Alerts
- **Repro Steps**: Select OP $\rightarrow$ leave OP Date empty $\rightarrow$ click Next. Select IP $\rightarrow$ leave Admission/Discharge date empty $\rightarrow$ click Next.
- **Reported Defect**: User was allowed to proceed without entering mandatory visit/admission dates.
- **Correction Made**:
  1. For `visitType === 'OP'`: `opNumber` and `opDate` are strictly required.
  2. For `visitType === 'IP'`: `ipNumber`, `admissionDate`, and `dischargeDate` are strictly required.
  3. Added bilingual warning toasts ("Please enter OP Date" / "Please enter Admission and Discharge Dates") blocking step navigation until completed.

#### Ticket #30: Streamlined Hospital Navigation & URL Routing
- **Reported Defect**: Redundant "Change Hospital" button caused confusion when hospital administrators insisted on fixed URL selection (`https://hms-2-4.vercel.app/?hospital_id=apollo-hospital`).
- **Correction Made**:
  - Removed confusing "Change Hospital" button from the feedback wizard header and standardized direct hospital routing through URL parameters.

---

### 5. Admin Form Builder & Dynamic Questions

#### Ticket #17 (Ref 14): Save Configuration Button in Form Builder Not Working
- **Reported Defect**: Changing questions or orders in Form Builder was not saving to database.
- **Correction Made**:
  1. Built `/api/save-questions` to upsert question labels, types, and categories into PostgreSQL `questions` table.
  2. Integrated `@dnd-kit` drag-and-drop state to persist question ordering indices.

#### Ticket #10 (Ref 7): Question Label Showing IDs (e.g., `123`) Instead of Names
- **Reported Defect**: Deleted or legacy questions displayed numeric IDs.
- **Correction Made**:
  - Added "Deleted from Form (Past Data)" badge and dynamic label resolution so past historical questions retain their original question title.

#### Ticket #18 (Ref 15): Empty Form Submission Generic Error Message
- **Correction Made**: Added localized Sonner toasts in Tamil & English guiding the user to required sections.

---

### 6. LRL QA Defect Report & Resolution (Phase 2)

#### Ticket #32 (Ref 9, Priority 1): Unauthorized Feedback Form Access via URL Tampering
- **Repro Steps**: Log in as Apollo Hospital $\rightarrow$ Observe URL parameter `?hospital_id=1` $\rightarrow$ Change URL to `?hospital_id=2` or other IDs.
- **Reported Defect**: System permitted navigating to another hospital's feedback form without re-authenticating, and hospital IDs were sequentially guessable integers.
- **Root Cause**: Feedback wizard form in `App.tsx` parsed `hospital_id` directly from `window.location.search` without verifying whether an active authenticated session belonged to that specific hospital.
- **Correction Made**:
  1. Enforced session protection markers (`hms_auth_hospital_id`, `hms_auth_hospital_code`, `hms_auth_hospital_name`) in `sessionStorage` set upon successful login in `HospitalSelection.tsx`.
  2. In `App.tsx`, added authorization guard verifying `sessionStorage` against requested hospital ID. Unauthorized or tampered requests immediately clear the URL, redirect back to Hospital Selection, and show an "Access restricted" toast.
  3. Replaced sequential integer IDs in public navigation with mixed alphanumeric codes (`apl-8092`, `cmc-4719`, `gov-3185`), preventing parameter enumeration.
  4. Added `resolveHospitalId` resolvers across backend endpoints (`api/login-ajax.js`, `api/get-responses.js`, `api/submit-feedback.js`) to support alphanumeric identifiers.

#### Ticket #33 (Priority 1): Shared Admin Password Across Multiple Hospitals
- **Repro Steps**: Open Hospital Selection $\rightarrow$ Select Apollo Hospital $\rightarrow$ Enter Apollo admin user with Government Hospital's password (`Admin@123`).
- **Reported Defect**: All hospitals shared the same global default password, allowing cross-hospital administrative login.
- **Root Cause**: Backend `/api/login-ajax` and frontend `HospitalSelection.tsx` accepted a global fallback password `'Admin@123'` without verifying hospital-to-password uniqueness.
- **Correction Made**:
  1. Assigned distinct, non-shared credentials and passwords to each hospital:
     - **Apollo Hospital (ID 1)**: `admin_apollo` / `Apollo@Admin8092`
     - **City Medical Centre (ID 2)**: `admin_city` / `City@Admin4719`
     - **Government Hospital (ID 3)**: `admin_govt` / `Govt@Admin3185`
  2. Implemented strict hospital-level password verification and SHA-256 hash checking in `/api/login-ajax.js`.
  3. Added cross-hospital lockout logic (`isCrossHospitalPassword`) that detects and explicitly rejects login attempts using another hospital's password.
  4. Removed the insecure global fallback password.

#### Ticket #34 (Ref 2, Priority 2): Duplicate Feedback Submissions in Admin Dashboard
- **Repro Steps**: Submit feedback for City Medical Centre $\rightarrow$ Log in to Admin Dashboard $\rightarrow$ View Recent Activity.
- **Reported Defect**: Feedback records were duplicated (e.g., patient records appeared twice with identical timestamps).
- **Root Cause**: Multiple factors: lack of button debouncing allowed rapid double-clicking of the Submit button; client-side caching in `AdminDashboard.tsx` failed to deduplicate offline and online arrays; PostgreSQL SQL join on `complaint_review` returned duplicate rows when multiple review notes existed for a submission.
- **Correction Made**:
  1. Added `isSubmitting` state guard and disabled state with a `Loader2` spinner on the Submit Feedback button in `App.tsx`.
  2. Implemented `deduplicateResponses` helper in `AdminDashboard.tsx` filtering duplicates by submission ID, UHID, and patient name + timestamp.
  3. Applied `SELECT DISTINCT ON (fs.submission_id)` in `/api/get-responses.js` and joined a deduplicated `complaint_review` subquery to prevent database join duplicates.

#### Ticket #35 (Ref 3, Priority 2): Report Data Formatting & Tamil Font Corruption in Microsoft Excel
- **Repro Steps**: Log in as Admin $\rightarrow$ Click **Download Report** $\rightarrow$ Open downloaded `.csv` file in Microsoft Excel on Windows.
- **Reported Defect**: Tamil character column headers and feedback responses rendered corrupted mojibake symbols (e.g., `à®µà®°à®µà¯‡à®±à¯...`) and star ratings rendered `5â˜…` in Microsoft Excel, despite opening correctly in Google Sheets.
- **Root Cause**: Microsoft Excel on Windows assumes ANSI/Windows-1252 encoding for `.csv` files by default and often misinterprets comma-delimited UTF-8 bytes and UTF-8 BOMs.
- **Correction Made**:
  1. Created `generateFeedbackReportExcel` in `export.service.ts` outputting native `.xls` format (HTML/XML with `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">` and Excel workbook namespaces).
  2. Replaced raw star glyphs `★` with formatted descriptive ratings (`5 Star (Excellent)`, `4 Star (Good)`, etc.) to avoid glyph rendering artifacts across different office suites.
  3. Updated Admin Dashboard "Download Report" button to trigger `generateFeedbackReportExcel` and `downloadExcel`, delivering 100% crisp Tamil Unicode rendering in both Microsoft Excel on Windows and Google Sheets.

#### Ticket #36 (Ref 4, Priority 1): Multi-Hospital Admin Dashboard Data Crossover & Strict Scoping
- **Repro Steps**: Log in to Admin Dashboard for Apollo Healthcare Center (`?hospital_id=apl-8092`) $\rightarrow$ Observe 29 responses and recent activity $\rightarrow$ Log in to Admin Dashboard for City Medical Centre (`?hospital_id=cmc-4719`) $\rightarrow$ Observe dashboard.
- **Reported Defect**: Both hospital admin portals displayed the exact identical 29 feedback responses, identical metrics (Total Responses: 29, Recommend Rate: 55%, Average Rating: 4.7), and identical patient activity (Rahul M, Avaneesh R, etc.), despite having distinct hospital names and logos.
- **Root Cause**:
  1. `frontend_source/src/app/real_db_data.ts` previously bundled an unpartitioned static response array that lacked explicit `hospital_id` attributes, causing all hospital admin views to fall back to the exact same 29 records.
  2. `AdminDashboard.tsx` initialized `responses` state directly from `REAL_DB_RESPONSES` and `localStorage.hms_new_submissions` without filtering by the effective hospital ID.
  3. `api/get-questions.js` and `api/save-questions.js` used `parseInt(req.query.hospital_id, 10)`, which evaluated alphanumeric IDs (`apl-8092`, `cmc-4719`, `gov-3185`) to `NaN` and defaulted to Hospital 1.
  4. Client-side branding, questions, and departments shared global `localStorage` keys without hospital-specific partitioning.
- **Correction Made**:
  1. **Partitioned Historical Submissions & Questions**: Extracted and partitioned all 152 authentic submissions, distinct rating questions, and departments from `database_dump_with_data.sql`:
     - **Hospital 1 (Apollo Healthcare Center)**: 99 submissions (48 deduplicated), 39 rating questions, 9 departments.
     - **Hospital 2 (City Medical Centre)**: 31 submissions (28 deduplicated, e.g. Deepa Balan, Suresh Gounder, Sivakumar Raj), 34 rating questions, 7 departments.
     - **Hospital 3 (Government Hospital)**: 22 submissions (18 deduplicated, e.g. Muthu Perumal, Bhavani Gounder, Meena Menon), 6 rating questions, 4 departments.
  2. **Scoped Admin Dashboard State**:
     - Added `filterResponsesByHospital` in `AdminDashboard.tsx` filtering responses by both explicit `hospital_id`/`hospitalId` and UHID prefix (`APL`/`ABC` for Apollo, `CMC`/`CTY` for City Medical, `GH`/`GOV` for Government Hospital).
     - Applied `filterResponsesByHospital` to `responses` initial state, `fetchResponses()` API data, and new submission cache.
     - Partitioned question and branding cache in `localStorage` under `hms_questions_hospital_${hid}`, `hms_yesno_hospital_${hid}`, `hms_departments_hospital_${hid}`, and `hms_branding_hospital_${hid}`.
  3. **Robust API Multi-Hospital Resolution**:
     - Added `resolveHospitalId` to `api/get-questions.js`, `api/save-questions.js`, `api/get-responses.js`, and created `api/save-branding.js` resolving alphanumeric tokens (`apl-8092`, `cmc-4719`, `gov-3185`, `hosp-X`).
     - Added hospital-partitioned fallback responses in `api/fallback_data.js` and `api/get-responses.js` ensuring 100% strict isolation even when the cloud database pooler is offline.
  4. **Dynamic Support for Future Hospitals**: Any new hospital created will automatically receive its own isolated dataset, questions, form builder configuration, and branding scope.

#### Ticket #37 (Priority 2): Recent Activity Card Displaying Outdated Entries Instead of Latest Submissions
- **Repro Steps**: Log in to Admin Dashboard -> View 'Recent Activity' widget on the Overview tab.
- **Reported Defect**: The widget displayed older January/February 2026 submissions (Elango Krishnan, Anand Menon, Hemalatha Balan) instead of the newest submissions (Rahul M, Avaneesh R, Bharani Verified).
- **Root Cause**: `recentActivities` previously sliced the unsorted array (`[...responses].slice(0, 5)`), reflecting whatever initial order the database or mock array had.
- **Correction Made**:
  1. Implemented a robust `parseDateToMs` helper supporting ISO timestamps (`YYYY-MM-DD HH:mm:ss`), standard date strings, and Indian format (`DD/MM/YYYY`).
  2. Updated `recentActivities` in `AdminDashboard.tsx` to sort descending by `parseDateToMs` and ID (`tB - tA`), guaranteeing that the newest submissions always appear at the top.
  3. Applied the same descending timestamp sort across `deduplicateResponses` and the Feedback Responses table date sorter.

#### Ticket #38 (Priority 1): 'Back to Form' and 'Logout' Causing Redirect Loops and 404 Errors on Vercel
- **Repro Steps**: Log in to Admin Dashboard -> Click 'Back to Form' or 'Logout'.
- **Reported Defect**: In SPA mode on Vercel, clicking 'Back to Form' redirected to `feedback-form.php?hospital_id=1` (causing a 404 error) or triggered 'Access denied: Please authenticate to access...', while 'Logout' sometimes looped back into the dashboard or redirected to `login.php` (404 error).
- **Root Cause**:
  1. `onClose()` and `onLogout()` inside `AdminDashboard.tsx` assumed a legacy multi-page PHP server structure and navigated to `.php` endpoints not present on the Vercel SPA build.
  2. `isDashboardPage` checked `view=admin` or `admin=true` in the URL; without stripping query params, the SPA remained locked in dashboard mode.
  3. `sessionStorage` authentication tokens (`hms_auth_hospital_id`, `hms_auth_hospital_code`) were not preserved when exiting the dashboard to the hospital's feedback form, triggering the session protection guard.
- **Correction Made**:
  1. Differentiated environment behavior: on PHP deployments (`.php`), it navigates to the respective PHP views; on Vercel SPA, it performs in-app state transitions using `window.history.pushState` with clean query params (`?hospital_id=<code-or-id>`).
  2. In `onClose()` ('Back to Form'): strips `view=admin` and `admin=true`, preserves authenticated session markers (`hms_auth_hospital_id`), and switches cleanly to the patient feedback form for that hospital without any 404.
  3. In `onLogout()`: clears all session and local storage auth keys (`hms_is_admin`, `hms_admin_role`, `hms_admin_user`, `hms_auth_hospital_*`, `is_admin_logged_in`, `selected_hospital_id`) and redirects cleanly to the root domain.

#### Ticket #39 (Priority 1): Form Builder Questions, Combine Pages Toggle & Custom Branding Reverting on Session Re-entry
- **Repro Steps**: Log in to Admin Dashboard -> Add a new rating question -> Toggle 'Combine Service Feedback + Questionary Page' -> Add a new yes/no question -> Add a new department -> Change branding location/address -> Click Save -> Log out and re-enter Apollo Hospital feedback form.
- **Reported Defect**: After logging out and returning to the hospital form or dashboard, all modifications vanished and reverted to the factory default form.
- **Root Cause**:
  1. In `App.tsx`, the initial `branding` state hardcoded `123 Health Street, Chennai - 600001` and ignored custom branding saved in `localStorage`.
  2. `tryFetchQuestions()` and `tryFetchHospQuestions()` in `App.tsx` fetched `/api/get-questions` and unconditionally called `setQuestions(data.data)` and `setCombinePages(data.settings.combinePages)`. Because fallback data does not have user customizations, it immediately overwrote the user's custom saved questions and reset `combinePages = false` in `localStorage`.
  3. `save-questions.js`, `save-branding.js`, `get-questions.js`, and `get-responses.js` lacked an in-memory runtime cache for serverless environments when the remote PostgreSQL pooler is unreachable.
- **Correction Made**:
  1. Created `api/_lib/store.js` providing persistent in-memory dictionaries `SAVED_QUESTIONS_BY_HOSPITAL` and `SAVED_BRANDING_BY_HOSPITAL`.
  2. Updated `api/save-questions.js` and `api/save-branding.js` to cache configurations in memory with `is_custom: true`, and updated `api/get-questions.js` to serve these custom configurations even during database disconnects.
  3. In `AdminDashboard.tsx`, `handleSaveQuestions` and `handleSaveBranding` persist custom configurations under `hms_has_custom_config_hospital_${hid}` and `hms_has_custom_branding_hospital_${hid}`.
  4. In `App.tsx`, `tryFetchQuestions()` and `handleHospitalSelect()` check `hasCustomConfig` and `hasCustomBranding`. If the client has custom configurations saved and the server response is not custom, the custom questions, yes/no questions, departments, layout mode, combine pages toggle, and custom address are strictly preserved.
  5. Built and compiled the frontend bundle (`dist/assets/index-fO6XNCVg.js`), deployed and pushed to production.

---

## 🏆 Verification & Test Sign-off

All 39 test scenarios above have been corrected, verified across both local and cloud environments, and deployed to production.

- **Live Application**: [https://hms-2-4.vercel.app](https://hms-2-4.vercel.app)
- **Database Backup**: [`database_dump_with_data.sql`](./database_dump_with_data.sql)
- **Architecture & Handover Manual**: [`TOI_DOCUMENT.md`](./TOI_DOCUMENT.md)
