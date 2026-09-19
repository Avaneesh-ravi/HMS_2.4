# QA Defect Resolution Matrix & ChatGPT Prompt Kit

This document provides:
1. **The Master Prompt for ChatGPT / Claude** to generate professional QA Test Report tables matching your company's QA spreadsheet format.
2. **The Complete Pre-Filled QA Defect Resolution Table** (All 27 Test Scenarios with exact QA columns, Priority, Status, and Technical Corrections).

---

## 📋 1. Prompt for ChatGPT / Claude

Copy and paste this prompt into ChatGPT or Claude:

```markdown
Please format the following QA bug reports and development corrections into a formal, multi-column QA Test Report & Defect Resolution Matrix. 

The output MUST be a clean Markdown and HTML table following this exact standard QA defect tracking structure:

Columns Required:
1. S.No / Ticket ID
2. Scenarios / Module
3. Repro Steps
4. Expected Result
5. Unexpected Result (Defect Reported)
6. Reference (Ref #)
7. Priority (P1-Critical, P2-High, P3-Medium, P4-Low)
8. Fixed Status & Release Version
9. Developer Comments & Technical Correction Made
10. Verification & Approver Status

Here is the data of all logged defects and corrections to include:

[TICKETS DATA]
- Ticket 1 (Ref 1): In service feedback, title text not showing when changing language. Fixed reactive state in App.tsx to update translations dynamically. Priority: 2. Fixed in V6.6. Status: Verified & Approved.
- Ticket 2 (Ref 2): Form validation message missing field guidance. Added localized field-level error toasts in English & Tamil. Priority: 3. Fixed in V6.6. Status: Verified & Approved.
- Ticket 3 (Ref 3): OTP verification button state unclickable on re-entry. Enabled reactive 6-digit regex validation. Priority: 2. Fixed in V6.6. Status: Verified & Approved.
- Ticket 4 (Ref 4): Default language preference not retained. Added language persistence in session state. Priority: 2. Fixed in V6.6. Status: Verified & Approved.
- Ticket 5 (Ref 5): Back navigation from submission redirecting to search hospital page. Retained active hospital context in routing state. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 6 (Ref 5): Mandatory field validation for Last Name. Adjusted form validation schema so First Name is required and Last Name is optional. Priority: 2. Fixed in V6.6. Status: Verified & Approved.
- Ticket 7: Back to Form button in Admin Dashboard navigating to login screen. Updated AdminSidebar.tsx to route directly to feedback-form.php?hospital_id=... with active hospital ID. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 8: Submitted feedback not reflecting in Apollo Hospital report. Unified SQL queries and hospital_id filtering in /api/get-responses. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 9 (Ref 6): Export CSV button not downloading file. Built export.service.ts with UTF-8 BOM encoding and browser download trigger. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 10 (Ref 7): Question label displaying numeric IDs (e.g. 123) instead of names. Mapped question registry labels dynamically with 'Deleted from Form' badge. Priority: 2. Fixed in V6.6. Status: Verified & Approved.
- Ticket 11 (Ref 8): Forgot Password button inactive. Added modal dialog with IT administrator contact guidance. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 12 (Ref 9): Email ID validation missing. Enforced RFC standard email regex validation. Priority: 4. Fixed in V6.6. Status: Verified & Approved.
- Ticket 13 (Ref 10): Age field accepting negative numbers. Added min=1 and max=120 numeric constraints. Priority: 4. Fixed in V6.6. Status: Verified & Approved.
- Ticket 14 (Ref 11): Service Feedback Tamil title text containing corrupted characters and invalid symbols. Replaced malformed encoding with authentic UTF-8 Unicode translations. Priority: 3. Fixed in V6.6. Status: Verified & Approved.
- Ticket 15 (Ref 12): Unable to enter Patient Name in Tamil font (validation alert triggered). Updated name regex in App.tsx to /^[\p{L}\s.]+$/u and Tamil Unicode range [஀-௿]. Priority: 2. Fixed in V6.6. Status: Verified & Approved.
- Ticket 16 (Ref 13): Questionnaire page Tamil text having invalid symbols. Cleaned and normalized all Yes/No question definitions in database. Priority: 3. Fixed in V6.6. Status: Verified & Approved.
- Ticket 17 (Ref 14): Save Configuration button in Form Builder not saving changes. Built /api/save-questions and wired @dnd-kit sortable state. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 18 (Ref 15): Empty form submission generic error message. Added localized Sonner toasts in Tamil & English. Priority: 3. Fixed in V6.6. Status: Verified & Approved.
- Ticket 19 (Ref 16): Save Office Use Details button not working in response modal. Created /api/save-office-use endpoint connecting to PostgreSQL complaint_review table; wired OfficeUseModal.tsx state. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 20 (Ref 17): Edit Office Review button inactive on resolved rows. Implemented handleEditOfficeReview pre-populating existing investigation notes, dates, and actions. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 21 (Ref 18): Saved office use data not reflecting under Resolved tab. Synchronized local React dictionary state with database join in /api/get-responses, updating counters immediately. Priority: 2. Fixed in V6.6. Status: Verified & Approved.
- Ticket 22: Missing Download Report button in Feedback Report view. Added Download Report button; built export.service.ts producing 3-section structured CSV/Excel report. Priority: 3. Fixed in V6.6. Status: Verified & Approved.
- Ticket 23 (Ref 19): Government Hospital Tamil responses not showing in admin report. Enforced UTF-8 charset encoding across PostgreSQL connection pool, serverless APIs, and React table renderers. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 24 (Ref 24): Direct URL copy-paste not opening form properly. Implemented getEffectiveHospitalId resolving URL parameters and localStorage without blank screens. Priority: 2. Fixed in V6.6. Status: Verified & Approved.
- Ticket 25: Resolve Problem button in unresolved report view inactive. Bound button in FeedbackReportSection to open OfficeUseModal with pre-filled patient info. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 26: Edit Office Review button in resolved report view inactive. Bound button to open OfficeUseModal with existing complaint investigation logs for editing. Priority: 1. Fixed in V6.6. Status: Verified & Approved.
- Ticket 27: Print Feedback Report displaying blank page and left green sidebar taking up 30% of page. Set aside/header to display:none !important; width:0; position:absolute; left:-99999px; expanded report to 100% full width with 2-column card grid. Priority: 1. Fixed in V6.6. Status: Verified & Approved.

Please render the complete, detailed table with professional corporate styling.
```
