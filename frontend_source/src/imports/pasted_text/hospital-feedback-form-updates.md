Apply the following UI updates to the existing Hospital Patient Feedback Form WITHOUT changing the current overall design, theme, layout structure, card style, typography, colors, spacing system, branding, or workflow.

Maintain the current healthcare-focused modern UI and only update the following specific features.

==================================================
1. PATIENT INFORMATION SECTION ALIGNMENT UPDATE
==================================================

Update the alignment inside the existing "Patient Information" card.

USE A 2-COLUMN LAYOUT.

LEFT COLUMN (Vertical Alignment):
Arrange the following fields one below another in vertical form:

- UHID*
- First Name*
- Last Name*

All fields should appear stacked vertically with equal spacing.

RIGHT COLUMN (Vertical Alignment):
Arrange the following fields one below another in vertical form:

- Age*
- Gender*

GENDER UPDATE:
Replace radio button selection with:
- Modern dropdown select field
- Options:
  - Male
  - Female
  - Other

Maintain the same input styling, rounded appearance, spacing, and card alignment.

==================================================
2. LOCATION FIELD ORDER UPDATE
==================================================

Rearrange location dropdown fields in the following order:

LEFT → RIGHT:
1. Country
2. State
3. City

Country should appear first on the left side.

Use searchable modern dropdowns.

==================================================
3. ADDRESS SECTION UPDATE
==================================================

Below the Country / State / City row:

- Add a full-width Address textarea
- Keep the address box large and spacious
- Maintain the same border radius and input style

==================================================
4. CONTACT VERIFICATION UPDATE
==================================================

Below the Address field:

Add:
- Mobile Number field
- Email field

Include:
- OTP verification for mobile number
- Email verification option
- Small modern Verify button
- Verified success state UI

Keep minimal modern styling.

==================================================
5. VISIT DETAILS SECTION UPDATE
==================================================

Update the "Visit Details" section exactly like the uploaded reference image.

BEHAVIOR:
- Initially show only:
  - Visit Type cards (OP / IP)

WHEN USER SELECTS OP:
Display only:
- OP Number
- OP Date

WHEN USER SELECTS IP:
Display only:
- IP Number
- IP Date
- Date of Admission
- Date of Discharge

Use:
- Smooth reveal animation
- Dynamic conditional fields
- Calendar picker for all dates
- Maintain same card design

IMPORTANT:
The interaction and layout should behave exactly like the uploaded reference images.

==================================================
6. LANGUAGE TOGGLE UPDATE
==================================================

Currently bilingual labels are shown together.

Change this behavior:

- Add a language toggle switch/button in the header
- Options:
  - English
  - Tamil

WHEN SELECTED:
- English → show only English labels
- Tamil → show only Tamil labels

Do NOT display both languages simultaneously.

Maintain existing typography and spacing.

==================================================
7. ADD "WHY DID YOU CHOOSE US?" PAGE
==================================================

Add a new second step/page after Patient Information.

PAGE TITLE:
"Why Did You Choose Us?"

SUBTITLE:
"Select all that apply"

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
- Same card shadows and rounded style
- Maintain current blue/teal healthcare theme

UPDATED STEP FLOW:
1. Patient Information
2. Why Choose Us
3. Service Feedback
4. Additional Details
5. Review & Submit

==================================================
8. FEEDBACK RATING UI ENHANCEMENT
==================================================

Replace the current emoji set with:
- Premium modern expressive emoji components from Figma community plugins/UI kits
- Use high-quality 3D or gradient-style reaction emojis
- Emojis should look modern, friendly, and visually attractive
- Use touch-friendly large emoji cards suitable for elderly and non-technical users

RATING ORDER:
1. Very Bad
2. Poor
3. Average
4. Good
5. Excellent

EMOJI STYLE REQUIREMENTS:
- Use expressive face reactions from modern Figma emoji libraries
- Prefer glossy, animated, or soft-gradient emoji styles
- Avoid default plain system emojis
- Use emotionally expressive icons with clear visual difference

INTERACTION ENHANCEMENT:
When user selects a rating:

- Entire emoji card background color should change dynamically based on emotion.

COLOR STATES:
- Very Bad → Dark Red
- Poor → Soft Red / Orange
- Average → Yellow
- Good → Light Green
- Excellent → Bright Green

ADDITIONAL EFFECTS:
- Smooth hover animation
- Glow effect on selection
- Soft scaling animation
- Active shadow effect
- Smooth transition between states

Maintain existing card spacing and layout.

==================================================
9. YES / NO / NEUTRAL BUTTON UI ENHANCEMENT
==================================================

The current Yes / No / Neutral segmented buttons look plain and visually weak.

Redesign ONLY this component while keeping the overall UI theme same.

REQUIREMENTS:
- Create a modern attractive segmented selection component
- Use premium healthcare-style UI
- Add soft shadows and rounded pill-style buttons
- Add subtle hover animations
- Add active glow effect
- Use modern micro interactions

BUTTON STATES:
- No → Soft red theme
- Neutral / N/A → Gray-blue neutral theme
- Yes → Soft green/teal theme

INTERACTION:
- No default selection
- Neutral should remain centered
- User must manually choose an option
- Selected option should:
  - Slightly scale up
  - Show active shadow
  - Change background color
  - Highlight text color

VISUAL STYLE:
- More modern and attractive than the current flat design
- Add icons with labels:
  - ❌ No
  - ➖ Neutral
  - ✅ Yes

OPTIONAL:
- Use glassmorphism or soft neumorphism effect lightly
- Smooth animated selection transition

Maintain responsive layout and accessibility.

==================================================
10. APPRECIATION SECTION UPDATE
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
11. REVIEW & SUBMIT PAGE UPDATE
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
12. REMOVE FOOTER TEXT FROM ALL PAGES
==================================================

Remove the following footer content from ALL pages:

"Thank you for taking the time to share your feedback. Your input is valuable to us."

"© 2026 Apollo Healthcare Center. All rights reserved. | Privacy Policy"

Remove completely.

Do not replace with any other footer text.

==================================================
13. UX ENHANCEMENTS
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
14. IMPORTANT DESIGN RESTRICTIONS
==================================================

DO NOT:
- Change existing UI structure
- Change current color palette drastically
- Redesign cards
- Modify typography system
- Change current spacing style
- Change branding
- Change stepper flow

ONLY:
- Improve alignment
- Add conditional interactions
- Improve emoji experience
- Improve Yes/No selection UI
- Improve dropdown UX
- Remove footer
- Match uploaded reference behavior

Maintain the exact same modern healthcare UI appearance while applying these feature updates.