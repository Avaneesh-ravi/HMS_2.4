Modify the existing Hospital Patient Feedback Form UI WITHOUT changing the current overall layout, color palette, spacing structure, card style, typography, branding, or workflow. Maintain the current clean healthcare-focused modern UI and only apply the following feature improvements and layout adjustments.

==================================================
GENERAL UI RULES
==================================================

- Keep the existing UI design, theme, colors, shadows, rounded cards, typography, icons, and responsiveness exactly the same.
- Do NOT redesign the entire application.
- Only update the mentioned components and improve usability.
- Maintain Bootstrap 4.5.2 compatible structure.
- Keep the professional healthcare appearance.
- Maintain existing progress stepper and page flow.

==================================================
1. PERSONAL INFORMATION SECTION CHANGES
==================================================

Inside the existing "Patient Information" card:

LAYOUT UPDATE:
Use a clean responsive 2-column layout.

LEFT COLUMN:
- UHID
- First Name
- Last Name

RIGHT COLUMN:
- Age
- Gender (display vertically one below another instead of inline)

Below both columns:

ADDRESS SECTION:
- Add dropdown fields:
  - City
  - State
  - Country
- Dropdowns should support searchable select lists.
- City dropdown should display predefined city options.
- Keep same modern input style.

Below location dropdowns:
- Add a full-width large Address textarea.
- Address field should be longer and more spacious.

CONTACT VERIFICATION:
Below address section:
- Mobile Number field
- Email field

Add:
- OTP verification UI for mobile number
- Email verification UI
- Use small modern "Verify" buttons
- Show success state after verification
- Keep UI minimal and aligned with existing design

DATE PICKER UPDATE:
For all date fields:
- Admission Date
- Discharge Date
- OP Date
- IP Date

Enable:
- Calendar date picker popup
- Modern calendar icon
- User should select date instead of manual typing

==================================================
2. LANGUAGE TOGGLE UPDATE
==================================================

Currently bilingual text is shown together.

Change this behavior:

- Add a language toggle switch/button at the top header.
- Options:
  - English
  - Tamil

When user selects:
- English → show only English labels
- Tamil → show only Tamil labels

Do NOT show both languages simultaneously.

Maintain same typography and spacing.

==================================================
3. VISIT DETAILS SECTION
==================================================

Keep the current OP/IP selection card UI exactly same.

Improve:
- Date selection with calendar picker
- Better spacing alignment
- Smooth active state animation for OP/IP cards

No major design changes.

==================================================
4. ADD NEW PAGE AFTER PERSONAL INFO
==================================================

Add a new second step/page:

PAGE TITLE:
"Why Did You Choose Us?"

SUBTITLE:
"Select all that apply"

Use card-based selectable options exactly like modern healthcare survey UI.

OPTIONS:
- Self Decision
- Advertisement / News
- Friends / Relatives
- Corporate
- Employee
- Referral Doctor
- Others

UI REQUIREMENTS:
- Large selectable cards
- Icons for each option
- Multi-select enabled
- Maintain existing card shadows and rounded style
- Keep same blue/teal theme

Place this as:
Step 2 in progress flow.

Updated flow:
1. Patient Information
2. Why Choose Us
3. Service Feedback
4. Additional Details
5. Review & Submit

==================================================
5. FEEDBACK RATING UI UPDATE
==================================================

In "Patient Feedback Form" page:

Replace existing STAR ratings with:

- Large attractive smiley emoji rating system
- Emojis should be clearly visible for elderly and non-technical users
- Use 5 rating levels in the following order:

😡 Very Bad  
😟 Poor  
😐 Average  
😊 Good  
😍 Excellent

UI STYLE:
- Large emoji buttons
- Hover animation
- Selected glow effect
- Mobile friendly
- Accessible spacing

Do NOT change card layout.

==================================================
6. YES / NO TOGGLE UPDATE
==================================================

Current toggle defaults to "No".

Change behavior:

- Toggle should start in CENTER neutral state.
- No default selection.
- User must actively choose:
  - Yes
  - No

Use:
- 3-state segmented toggle OR centered switch design.

Maintain same styling.

==================================================
7. APPRECIATION SECTION UPDATE
==================================================

Currently user can appreciate only one staff member.

Update feature:

Add a "+" Add More button.

When clicked:
- Dynamically add another appreciation block containing:
  - Staff Name
  - Department Dropdown
  - Appreciation Note

Allow multiple staff appreciations.

Use smooth expand animation.

Keep same card style and spacing.

==================================================
8. REVIEW & SUBMIT PAGE UPDATE
==================================================

Remove this confirmation statement completely:

"I confirm that the information provided is accurate and I agree to share my feedback with the hospital for service improvement purposes."

Keep:
- Privacy Notice
- Summary
- Ratings Overview
- Submit Button

No other layout changes.

==================================================
9. UX ENHANCEMENTS
==================================================

Keep existing UI but improve interactions:

- Smooth transitions between steps
- Better hover effects
- Soft button animations
- Responsive mobile layout
- Sticky progress header
- Real-time auto-save indicator
- Inline validation
- Accessible form spacing

==================================================
10. IMPORTANT DESIGN RESTRICTIONS
==================================================

DO NOT:
- Change overall color palette
- Change existing cards structure
- Change typography style
- Change current branding
- Change current spacing system drastically
- Change the modern healthcare theme
- Redesign the entire UI

ONLY:
- Enhance usability
- Improve layout arrangement
- Add requested features
- Modernize interactions while preserving current UI

Maintain the exact existing visual identity while implementing these feature updates.