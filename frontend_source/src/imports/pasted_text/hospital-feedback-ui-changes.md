Apply ONLY the following targeted changes to the existing Hospital Patient Feedback Form UI. DO NOT redesign, restructure, or change the existing healthcare theme, color palette, typography, spacing system, card styles, branding, shadows, or workflow.

1. PATIENT INFORMATION PAGE — PINCODE & CITY REORDER
In the location fields row, rearrange the order to:
Country → State → Pincode → City

Pincode must appear immediately next to State (right side)
City must appear immediately next to Pincode (right side)
Use the same dropdown/input style already present
Maintain equal column widths in the same row


2. PATIENT INFORMATION PAGE — LARGE CALENDAR DATE PICKER
For ALL date picker fields (Admission Date, Discharge Date, OP Date, IP Date):

Increase the calendar popup size significantly — optimized for tablet screen viewing
Minimum calendar width: 360px, minimum cell size: 48px × 48px
Use large, bold, clearly readable date numbers
Large month/year navigation arrows (touch-friendly)
Highlighted today's date
Selected date shown with teal/blue filled circle
Calendar must be fully visible without scrolling on tablet screens
Maintain existing border radius and healthcare color theme


3. On the Additional Details page, in the "What Made You Choose Apollo Healthcare Center?" section:
Find the subtitle text:

"Select all that apply"

Change ONLY the word "all" to "ALL"
Result should read:

"Select ALL that apply"

DO NOT change anything else — font size, font weight, color, spacing, card layout, option labels, icons, or any other element on the page.

4. SERVICE FEEDBACK PAGE — REMOVE GREETING SECTION
Completely remove the following greeting block from the top of the Service Feedback page:

"Thank you for choosing Apollo Healthcare Center"
"We value your feedback and appreciate you taking the time to share your experience with us."
"Your feedback helps us improve our services and provide better patient care."

Remove the entire card/section. Do not replace with anything.

5. REVIEW & SUBMIT PAGE — ADD GREETING ABOVE SUBMIT BUTTON
Add the same greeting content at the bottom of the Review & Submit page, placed above the Submit Feedback button:

"Thank you for choosing Apollo Healthcare Center"
"We value your feedback and appreciate you taking the time to share your experience with us."
"Your feedback helps us improve our services and provide better patient care."

Style requirements:

Centered alignment
Soft teal/blue gradient background card
Same card border radius and shadow as existing cards
Hospital icon in circular container above the text
Maintain current typography


6. PAGE TITLE — TOP LEFT LABEL ON EVERY PAGE
On every step/page of the form, add a page title label at the top-left corner of the content area (below the progress stepper, above the first card):
StepPage Title1Patient Information2Service Feedback3Additional Details4Review & Submit5Office Use Only
Style requirements:

Font: Bold, 18–20px, dark gray or teal color
Position: Top-left aligned
Add a subtle left border accent (3–4px teal vertical line)
Small subtitle below in lighter gray: e.g., "Step 1 of 5"
Do NOT change the progress stepper above it


7. ADMIN DASHBOARD — NEW MODULE
Create a separate Admin Dashboard page/panel accessible via a login or admin route. This is a new addition — do not modify the existing patient form.
DASHBOARD LAYOUT:

Sidebar navigation (left) with icons
Main content area (right)
Teal/white healthcare color theme matching the main form

SIDEBAR MENU ITEMS:

🏠 Overview
🖼️ Branding Settings
📋 Form Builder
💬 Feedback Responses
⚙️ Display Settings


MODULE A — BRANDING SETTINGS
Fields to configure:

Upload Hospital Logo (image upload)
Hospital Name (text input)
Hospital Address (textarea)
Contact Number
Email
Preview panel showing how header will look with changes
Save Changes button


MODULE B — FEEDBACK RESPONSES VIEWER

Table/list view of all submitted feedback entries
Columns: UHID, Patient Name, Date, Overall Rating, Recommendation
Click on a row → expand to view full feedback detail
Filter by: Date range, Rating, Department
Export button (CSV/PDF)


MODULE C — FORM BUILDER (Main Control Panel)
This is the most important module. Organize into tabs:
TAB 1 — SERVICE FEEDBACK SETTINGS

List all current feedback questions
Admin can: Add / Edit / Delete / Reorder questions
For each question: set question label (English + Tamil)
Rating Mode Toggle per question OR global:

🌟 Star Rating (1–5 stars)
😊 Emoji Rating (Very Bad → Excellent)


Preview how it looks when changed

TAB 2 — ADDITIONAL DETAILS SETTINGS

List all Yes/No questions
Admin can: Add / Edit / Delete questions
For each question set:

Question label (English + Tamil)
Alignment mode:

↔️ Horizontal (Yes | No side by side)
↕️ Vertical (Yes / No stacked)
⬅️ Left aligned
➡️ Right aligned





TAB 3 — PAGE MERGE OPTION

Toggle: "Combine Service Feedback + Additional Details into one page"
When enabled:

Admin can reduce/select which questions appear
Admin can rename the combined page title
Preview shown on right side


When disabled: Pages remain separate (default)

TAB 4 — LANGUAGE SETTINGS

Default language selection: English / Tamil
Option to enable/disable bilingual mode
Suggestion button label: editable text field (English + Tamil)


MODULE D — DISPLAY SETTINGS

Form theme color picker (primary color)
Font size slider (Normal / Large / Extra Large — for elderly users)
Toggle: Show/hide page title labels
Toggle: Enable/disable auto-save indicator


ADMIN DASHBOARD DESIGN RULES:

Clean, minimal dashboard UI
Same teal/blue healthcare color palette
Card-based layout for each setting group
Responsive for tablet and desktop
Use toggle switches, dropdowns, and inline editable fields
Save/Cancel buttons for each section
Do NOT affect or modify the patient-facing form directly in the UI — changes apply on Save


8. IMPORTANT RESTRICTIONS
DO NOT:

Redesign existing patient form UI
Change typography, colors, or card styles
Modify workflow or progress stepper
Remove any existing validated features

ONLY:

Reorder Pincode and City fields
Enlarge calendar date pickers
Uppercase the "Why Choose" option labels
Move greeting section from Service Feedback to Review & Submit
Add page title labels (top-left) on all pages
Add new Admin Dashboard module