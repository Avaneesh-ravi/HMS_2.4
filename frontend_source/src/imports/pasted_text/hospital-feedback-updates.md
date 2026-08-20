Apply ONLY the following targeted UI and interaction updates to the existing Hospital Patient Feedback Form.
DO NOT redesign, restructure, or change the existing healthcare UI theme, typography, spacing system, color palette, branding, shadows, card styles, or overall workflow.

Maintain the exact same modern healthcare-style UI and apply ONLY the requested improvements below.

==================================================

1. TOP 6-STEP PROGRESS HEADER UPDATE
   ==================================================

Currently completed steps display tick/check icons.

REMOVE:

* Tick/check symbols inside completed step circles

UPDATE REQUIREMENT:

* Keep all step circles numbered only
* Active step should still be highlighted
* Completed steps should NOT change into tick icons
* Maintain the same circular step design and spacing

IMPORTANT:
Do NOT redesign the stepper.
Only remove the tick symbol behavior.

==================================================
2. CITY DROPDOWN DEFAULT VALUE UPDATE
=====================================

Currently:
City field shows “Chennai” as default selected value.

REMOVE default city selection completely.

NEW BEHAVIOR:

* City dropdown should initially display placeholder:
  “Select city”
* User must manually choose the city

CITY DROPDOWN CONTENT:
Populate the dropdown with Tamil Nadu cities including:

* Chennai
* Coimbatore
* Madurai
* Salem
* Tiruchirappalli
* Tirunelveli
* Erode
* Vellore
* Thanjavur
* Dindigul
* Kanchipuram
* Karur
* Cuddalore
* Thoothukudi
* Namakkal
* Hosur
* Nagercoil
* Sivakasi
* Pollachi
* Virudhunagar
* and other Tamil Nadu cities

Maintain:

* same dropdown styling
* same spacing
* same searchable behavior

==================================================
3. MERGE SECOND PAGE WITH ADDITIONAL DETAILS PAGE
=================================================

Currently:
“What Made You to Choose Apollo Healthcare Center ?”
exists as a separate page.

UPDATE REQUIREMENT:
Merge this entire section into the “Additional Details” page.

NEW STRUCTURE:
Inside “Additional Details” page include:

* What Made You to Choose Apollo Healthcare Center ?
* Suggestions
* Appreciation
* Additional details fields

REMOVE separate navigation step for this page.

UPDATED STEPPER ORDER:

1. Patient Information
2. Service Feedback
3. Additional Details
4. Review & Submit
5. Office Use Only

Maintain:

* same card styles
* same spacing
* same healthcare UI theme

==================================================
4. SUGGESTION SECTION TEXT UPDATE
=================================

Currently suggestion helper text:
“Share your valuable suggestions to help us improve”

REPLACE WITH:
“If your concern is not covered in any of the above, please provide your suggestions for improvement”

Maintain:

* same typography
* same spacing
* same textarea styling

==================================================
5. APPRECIATION SECTION – ADD MORE BUTTON UPDATE
================================================

Currently:
“Add More” button appears at the top right.

MOVE BUTTON:
Place “Add More” BELOW the Appreciation Note textarea.

NEW BEHAVIOR:

* When a new appreciation block is added,
  the “Add More” button should dynamically move downward below the newly created block

BUTTON COLOR UPDATE:
Change button color to:

* Soft Slate Gray

Maintain:

* same rounded style
* same button size
* same typography
* same hover effects

IMPORTANT:
Do NOT redesign the appreciation card.

==================================================
6. REVIEW & SUBMIT PAGE – SUMMARY UPDATE
========================================

Currently summary contains:

* Patient
* Overall Rating
* Would Recommend
* Ratings Provided

REMOVE:

* Would Recommend

NEW SUMMARY ORDER:

1. Patient
2. Ratings Provided
3. Overall Rating

==================================================
7. REVIEW SUMMARY – EDIT BUTTONS
================================

For EACH summary item:

* Patient
* Ratings Provided
* Overall Rating

ADD:

* Small “Edit” button below each item

BUTTON STYLE:

* Light Neutral Gray background
* Minimal modern healthcare UI style
* Small rounded button
* Soft hover effect

INTERACTION:
Clicking Edit should redirect user to the original corresponding page for review/editing.

Maintain:

* same summary card layout
* same spacing system
* same typography

==================================================
8. IMPORTANT DESIGN RESTRICTIONS
================================

DO NOT:

* redesign the UI
* change typography
* alter spacing system
* modify branding
* change healthcare theme
* redesign cards
* modify component styles unnecessarily
* change workflow except requested merge

ONLY:

* remove stepper tick icons
* remove default city value
* populate Tamil Nadu city dropdown
* merge “What Made You Choose” into Additional Details
* update suggestion helper text
* reposition Add More button
* recolor Add More button
* simplify Review Summary
* add Edit buttons

Maintain the exact same existing healthcare UI while applying only these requested usability and layout improvements.
