Apply ONLY the following addition to the 
Patient Information page.
DO NOT redesign, change colors, typography, 
spacing, card styles, or any existing form fields.

==================================================
STEP 1 — REMOVE PREVIOUS CHANGES:
==================================================

First, remove these previously added elements:

- Remove the small teal helper texts added 
  below field labels:
  "Auto-filters State list"
  "Auto-filters City list" 
  "Auto-fills State, City & Country"
  "Auto-fills State & Country"

- Remove the teal highlight border 
  currently on the Pincode field

- Remove placeholder text 
  "Enter pincode for Chennai" from Pincode

- Keep all fields (Country, State, 
  Pincode, City) exactly as original

==================================================
STEP 2 — ADD NEW SEARCH ROW ABOVE LOCATION FIELDS:
==================================================

ADD A SINGLE FULL-WIDTH SEARCH INPUT ROW
placed ABOVE the Country / State / Pincode / City 
row (between Address label and location dropdowns).

LABEL ABOVE THE SEARCH INPUT:
"Search Location"
- Font: 14px, semibold, dark (#374151)
- Same style as other field labels

SEARCH INPUT FIELD:
- Full width (spanning all 4 columns)
- Height: same as other input fields
- Placeholder text: 
  "Type State, District, City or Pincode 
   to auto-fill below fields..."
- Left icon: 🔍 search icon in gray
- Border: 1.5px solid #e5e7eb
- Border radius: 10px (same as other fields)
- On focus: teal border #0D9488
- Background: white

RIGHT SIDE OF SEARCH INPUT:
- Small pill tag: "⚡ Auto Fill"
- Background: #f0fdfa (light teal)
- Text color: #0D9488
- Border: 1px solid #99f6e4
- Font: 11px bold
- Border radius: 20px

==================================================
BEHAVIOR:
==================================================

WHEN USER TYPES in the search box:

Show a dropdown suggestion list BELOW 
the search input with matching results.

SUGGESTION DROPDOWN STYLE:
- White background
- Border: 1px solid #e5e7eb
- Border radius: 10px
- Box shadow: 0 4px 16px rgba(0,0,0,0.1)
- Max height: 200px, scrollable

EACH SUGGESTION ROW:
- 📍 icon on left (teal)
- Main text: City/District name (bold, 14px)
- Sub text: State, Country (gray, 12px)
- Pincode shown on right (gray, 12px)
- Hover: light teal background (#f0fdfa)
- Padding: 10px 14px

EXAMPLE SUGGESTIONS shown while typing:

If user types "Chennai":
  📍 Chennai
     Tamil Nadu, India          600001

If user types "Coimbatore":
  📍 Coimbatore
     Tamil Nadu, India          641001

If user types "641":
  📍 Coimbatore
     Tamil Nadu, India          641001

If user types "Tamil":
  📍 Chennai — Tamil Nadu, India      600001
  📍 Coimbatore — Tamil Nadu, India   641001
  📍 Madurai — Tamil Nadu, India      625001
  📍 Salem — Tamil Nadu, India        636001

==================================================
ON SELECTING A SUGGESTION:
==================================================

When user clicks a suggestion row:

1. Search input shows selected value
   (e.g., "Chennai, Tamil Nadu, India")

2. Below fields AUTO-FILL instantly:
   - Country → "India"
   - State → "Tamil Nadu"
   - City → "Chennai"
   - Pincode → "600001"

3. Each auto-filled field shows a brief 
   green background flash (100ms animation)
   then returns to normal white

4. A small green "✓ Filled" badge appears 
   temporarily (2 seconds) above the 
   location row, then fades out

5. Search input gets a green checkmark 
   on the right side after selection

==================================================
SAMPLE DATA FOR SUGGESTIONS:
==================================================

600001 → Chennai, Tamil Nadu, India
600002 → Chennai, Tamil Nadu, India  
641001 → Coimbatore, Tamil Nadu, India
625001 → Madurai, Tamil Nadu, India
636001 → Salem, Tamil Nadu, India
620001 → Tiruchirappalli, Tamil Nadu, India
627001 → Tirunelveli, Tamil Nadu, India
638001 → Erode, Tamil Nadu, India
632001 → Vellore, Tamil Nadu, India
613001 → Thanjavur, Tamil Nadu, India
624001 → Dindigul, Tamil Nadu, India
631001 → Kanchipuram, Tamil Nadu, India
639001 → Karur, Tamil Nadu, India
607001 → Cuddalore, Tamil Nadu, India
628001 → Thoothukudi, Tamil Nadu, India
637001 → Namakkal, Tamil Nadu, India
635109 → Hosur, Tamil Nadu, India
629001 → Nagercoil, Tamil Nadu, India
626001 → Virudhunagar, Tamil Nadu, India
110001 → New Delhi, Delhi, India
400001 → Mumbai, Maharashtra, India
560001 → Bengaluru, Karnataka, India
500001 → Hyderabad, Telangana, India
700001 → Kolkata, West Bengal, India

==================================================
FINAL LAYOUT STRUCTURE:
==================================================

[ Search Location field — full width        ⚡ Auto Fill ]
[ Suggestion dropdown appears below when typing ]

Country        State          Pincode        City
[ India    ▼ ] [ Tamil Nadu ▼] [ 600001     ] [ Chennai  ▼]

==================================================
IMPORTANT RESTRICTIONS:
==================================================

DO NOT:
- Change Country, State, Pincode, City 
  field design or size
- Move or reorder existing fields
- Change card layout or outer structure
- Modify progress stepper or header
- Change any other page or section
- Remove the existing 4 location fields

ONLY:
- Add the new Search Location input 
  row above the 4 location fields
- Add dropdown suggestion behavior
- Add auto-fill animation on selection
- Remove previously added helper texts
  and teal highlight from pincode field