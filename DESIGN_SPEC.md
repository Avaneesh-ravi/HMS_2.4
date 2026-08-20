═══════════════════════════════════════════════════════════════════
HOSPITAL PATIENT FEEDBACK FORM — COMPLETE DESIGN SPECIFICATION
Extracted directly from source code. All values are exact.
═══════════════════════════════════════════════════════════════════


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAGE & LAYOUT
─────────────────────────────────────────────────────────────────
#f0fdfa  (teal-50)    Page background gradient — start
#eff6ff  (blue-50)    Page background gradient — middle
#ffffff  (white)      Page background gradient — end
                      Gradient direction: bottom-right (135deg)

#ffffff               Header bar background
                      Shadow: 0 4px 6px rgba(0,0,0,0.07) (shadow-md)

#f3f4f6  (gray-100)   Language toggle pill container background


BRAND / PRIMARY
─────────────────────────────────────────────────────────────────
#0d9488  (teal-600)   Primary action color — used on:
                        Primary buttons (Next, Verify, Save)
                        Progress step circle fill (completed + active border)
                        Progress connector line (completed)
                        Language toggle active pill background
                        Page title left-border accent bar
                        Icon backgrounds (teal-50 circle with teal-600 icon)
                        FeedbackCard icon color
                        Focus ring on all inputs (ring-teal-500)
                        SelectableCard selected border
                        Admin Panel button background

#0f766e  (teal-700)   Hover state for all teal-600 buttons


CARD & SURFACE
─────────────────────────────────────────────────────────────────
#ffffff               All card backgrounds (patient info, feedback, review)
#e5e7eb  (gray-200)   Card border color (default, 1px solid)
#f9fafb  (gray-50)    Inner sub-section backgrounds (OTP reveal area,
                        appreciation entry rows, review summary gradient overlay)


TEXT
─────────────────────────────────────────────────────────────────
#111827  (gray-900)   Page main title, card headings, input values,
                        step label (active/completed)
#4b5563  (gray-600)   Page subtitle, header address line,
                        body text, input placeholders (partial)
#374151  (gray-700)   All form field labels, secondary body text
#6b7280  (gray-500)   Page title subtitle ("Step X of 4"),
                        inactive step label text, placeholder text
#9ca3af  (gray-400)   Inactive step number text
#ffffff               Button text on teal/green/red backgrounds
#1d4ed8  (blue-700)   (Not used directly — see blue badge below)
#0d9488  (teal-600)   Tamil subtitle in FeedbackCard, teal accent text


FORM INPUT STATES
─────────────────────────────────────────────────────────────────
#e5e7eb  (gray-200)   Input border — default state (1px)
#0d9488  (teal-500)   Input border + ring — focus state (ring: 2px, offset: 0)
#ccfbf1  (teal-100)   Input background — auto-filled/flash state
#0d9488  (teal-600)   Input border — auto-filled/flash state (2px)
#ef4444  (red-500)    Input border — invalid pincode state (1px)


EMOJI RATING — SELECTED BACKGROUNDS
─────────────────────────────────────────────────────────────────
#dc2626               Level 1 "Very Bad"   — card fill when selected
#ea580c               Level 2 "Poor"       — card fill when selected
#ca8a04               Level 3 "Average"    — card fill when selected
#16a34a               Level 4 "Good"       — card fill when selected
#15803d               Level 5 "Excellent"  — card fill when selected

EMOJI RATING — UNSELECTED BORDERS
─────────────────────────────────────────────────────────────────
#fca5a5  (red-300)    Level 1 border (unselected)
#fdba74  (orange-300) Level 2 border (unselected)
#fde047  (yellow-300) Level 3 border (unselected)
#bef264  (lime-300)   Level 4 border (unselected)
#86efac  (green-300)  Level 5 border (unselected)

EMOJI RATING — GLOW SHADOWS (selected state)
─────────────────────────────────────────────────────────────────
rgba(239,68,68,0.35)   Level 1 glow
rgba(249,115,22,0.35)  Level 2 glow
rgba(234,179,8,0.35)   Level 3 glow
rgba(34,197,94,0.35)   Level 4 glow
rgba(21,128,61,0.35)   Level 5 glow


YES/NO TOGGLE BUTTONS
─────────────────────────────────────────────────────────────────
#dbeafe  (blue-100)   Button background — selected state
#93c5fd  (blue-300)   Button border — selected state (2px)
#1e3a8a  (blue-900)   Button text — selected state
#ffffff               Button background — unselected state
#e5e7eb  (gray-200)   Button border — unselected state (2px)
#6b7280  (gray-500)   Button text — unselected state


SPECIAL SECTIONS
─────────────────────────────────────────────────────────────────
#fffbeb  (amber-50)   Overall Experience card background gradient — start
#fef3c7  (amber-100)  Overall Experience card background gradient — end
#fbbf24  (amber-400)  Overall Experience card border (2px)
#78350f  (amber-900)  Overall Experience heading text
#92400e  (amber-800)  Overall Experience badge text

#eff6ff  (blue-50)    Privacy notice banner background
#bfdbfe  (blue-200)   Privacy notice banner border

#f0fdfa  (teal-50)    Review summary gradient — start
#eff6ff  (blue-50)    Review summary gradient — end

#dcfce7  (green-100)  Mobile/email verified state background
#15803d  (green-700)  Verified text color

#fef9c3  (yellow-100) Auto-fill "Filled" badge background
#16a34a  (green-600)  Auto-fill "Filled" badge text + border

#f0fdfa  (teal-50)    Auto-fill badge (Sparkles icon) background
#0d9488  (teal-600)   Auto-fill badge border + text


NAVIGATION BUTTONS
─────────────────────────────────────────────────────────────────
#ffffff               Previous button background
#e5e7eb  (gray-200)   Previous button border
#374151  (gray-700)   Previous button text
#0d9488  (teal-600)   Next button background
#16a34a  (green-600)  Submit Feedback button background
#ffffff               Next + Submit button text


BADGES & STATUS
─────────────────────────────────────────────────────────────────
#ccfbf1  (teal-100)   OTP reveal area background (teal-50)
#99f6e4  (teal-200)   OTP reveal area border (teal-100)
#ef4444  (red-500)    Required asterisk (*) on labels
#e5e7eb  (gray-200)   Admin / Logout button background (header)
#374151  (gray-700)   Admin / Logout button text


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — TYPOGRAPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Font family: System UI / Tailwind default sans-serif stack
  (Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto)

STYLE 1 — Page Main Title
  Element:   "Patient Feedback Form" (center, above stepper)
  Size:      30px  (text-3xl)
  Weight:    700   (font-bold)
  Color:     #111827

STYLE 2 — Page Subtitle
  Element:   "Your feedback helps us improve our services"
  Size:      14px  (text-sm)
  Weight:    400   (font-normal)
  Color:     #4b5563

STYLE 3 — Header Hospital Name
  Element:   Hospital name in sticky header
  Size:      20px  (text-xl)
  Weight:    700   (font-bold)
  Color:     #111827

STYLE 4 — Header Address
  Element:   Address line below hospital name in header
  Size:      14px  (text-sm)
  Weight:    400
  Color:     #4b5563

STYLE 5 — Section Card Heading (large)
  Element:   "Patient Information" inside card, "Review & Submit"
  Size:      24px  (text-2xl)
  Weight:    700
  Color:     #111827

STYLE 6 — Section Card Heading (medium)
  Element:   "Questions", "Suggestions", "Appreciation"
  Size:      20px  (text-xl)
  Weight:    700
  Color:     #111827

STYLE 7 — FeedbackCard Category Title
  Element:   "Reception staff behavior" etc. in service feedback cards
  Size:      15px  (text-[15px])
  Weight:    700
  Color:     #111827

STYLE 8 — FeedbackCard Tamil Subtitle
  Element:   Tamil translation line below category title
  Size:      14px  (text-sm)
  Weight:    400
  Color:     #0d9488

STYLE 9 — PageTitle Accent Heading
  Element:   "Patient Information", "Service Feedback" etc.
             (with left teal bar accent)
  Size:      20px  (text-xl)
  Weight:    700
  Color:     #111827

STYLE 10 — PageTitle Step Indicator
  Element:   "Step 1 of 4" below page title
  Size:      14px  (text-sm)
  Weight:    400
  Color:     #6b7280

STYLE 11 — Form Field Label
  Element:   "UHID", "First Name", "Pincode" etc.
  Size:      14px  (text-sm)
  Weight:    500   (font-medium)
  Color:     #374151

STYLE 12 — Input Value / Placeholder
  Element:   Text typed into inputs; placeholder text
  Size:      16px  (text-base, inherited)
  Weight:    400
  Color (value):       #111827
  Color (placeholder): #9ca3af

STYLE 13 — Button Text (primary)
  Element:   "Next", "Previous", "Verify", "Submit Feedback"
  Size:      16px  (text-base)
  Weight:    700   (font-bold)
  Color:     #ffffff (on teal/green) or #374151 (on white/gray)

STYLE 14 — Button Text (small, header)
  Element:   "Admin", "Admin Panel", "Logout" in header
  Size:      14px  (text-sm)
  Weight:    500
  Color:     #374151 (gray) or #ffffff (teal)

STYLE 15 — Progress Step Label (English)
  Element:   "Patient Information" etc. under step circle
  Size:      11px  (text-[11px])
  Weight:    700
  Color:     #111827 (active/completed) or #9ca3af (future)

STYLE 16 — Progress Step Label (Tamil)
  Element:   Tamil translation below English step label
  Size:      10px  (text-[10px])
  Weight:    500
  Color:     #0d9488 (active/completed) or #9ca3af (future)

STYLE 17 — Progress Step Number
  Element:   "1", "2", "3", "4" inside step circles
  Size:      14px  (text-sm)
  Weight:    600   (font-semibold)
  Color:     #ffffff (completed), #0d9488 (active), #9ca3af (future)

STYLE 18 — Language Toggle Text
  Element:   "English" / "தமிழ்"
  Size:      16px  (text-base)
  Weight:    500   (font-medium)
  Color:     #ffffff (active), #4b5563 (inactive)

STYLE 19 — Emoji Card Label
  Element:   "Very Bad", "Poor", "Average", "Good", "Excellent"
  Size:      13px
  Weight:    600
  Color:     #ffffff (selected card), #374151 (unselected card)

STYLE 20 — Yes/No Button Text
  Element:   "No" / "Yes" inside ThreeStateToggle
  Size:      16px  (text-base)
  Weight:    700   (font-bold)
  Color:     #1e3a8a (selected), #6b7280 (unselected)

STYLE 21 — SelectableCard Label
  Element:   "Advertisement / News / Social Media" etc.
  Size:      14px  (text-sm)
  Weight:    500
  Color:     #0f766e / teal-700 (selected), #374151 (unselected)

STYLE 22 — Overall Experience Heading
  Element:   "Overall Experience*" special card title
  Size:      18px  (text-lg)
  Weight:    700
  Color:     #78350f (amber-900)

STYLE 23 — Review Summary Value
  Element:   "Patient Details", "8 / 13", "4/5 ⭐" in summary grid
  Size:      16px  (text-base)
  Weight:    600   (font-semibold)
  Color:     #111827 (patient/ratings), #0d9488 (overall rating)

STYLE 24 — Privacy Notice / Info Text
  Element:   Privacy notice banner body
  Size:      14px  (text-sm)
  Weight:    400
  Color:     #374151


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — SPACING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAGE CONTAINER
─────────────────────────────────────────────────────────────────
Max width:             1152px  (max-w-6xl)
Horizontal padding:    16px each side  (px-4)
Top padding:           32px  (py-8)
Bottom padding:        32px  (py-8)

HEADER BAR
─────────────────────────────────────────────────────────────────
Inner container max-width: 1152px
Horizontal padding:        16px  (px-4)
Vertical padding:          16px  (py-4)
Gap between logo and text: 16px  (gap-4)
Gap between right items:   16px  (gap-4)
Logo circle size:          56px × 56px  (w-14 h-14)
Icon inside logo:          32px × 32px  (w-8 h-8)

PAGE TITLE BLOCK (above stepper)
─────────────────────────────────────────────────────────────────
Bottom margin:         32px  (mb-8)
Gap below title text:  8px   (mb-2)
Gap above subtitle:    8px   (mt-2)

PROGRESS STEPPER
─────────────────────────────────────────────────────────────────
Bottom margin:         48px  (mb-12)
Bottom padding:        16px  (pb-4, for scroll)
Min width:             700px
Horizontal padding:    16px  (px-4)
Step circle size:      40px × 40px  (w-10 h-10)
Step label block width:128px  (w-32)
Step label top margin: 12px  (mt-3)
Connector line height: 2px   (h-0.5)
Connector top margin:  20px  (mt-5, aligns with circle center)
Connector side padding:8px   (px-2)

PAGE TITLE COMPONENT (left bar accent)
─────────────────────────────────────────────────────────────────
Bottom margin:         24px  (mb-6)
Accent bar size:       4px × 48px  (w-1 h-12)
Gap bar to text:       12px  (gap-3)
Top margin of subtitle:4px   (mt-1)

MAIN CONTENT CARDS (patient info, questions, review)
─────────────────────────────────────────────────────────────────
Border radius:         12px  (rounded-xl)
Padding (default):     24px  (p-6)
Padding (large):       24px top/bottom, 24px sides (p-6 md:p-8 = 32px)
Bottom margin between cards: 24px  (space-y-6 = gap-6)
Shadow:                0 1px 3px rgba(0,0,0,0.1),
                       0 1px 2px rgba(0,0,0,0.06)  (shadow-lg)

SECTION HEADING INSIDE CARD
─────────────────────────────────────────────────────────────────
Bottom margin: 24px  (mb-6)

FORM FIELD GROUP
─────────────────────────────────────────────────────────────────
Grid gap (2-col):      24px  (gap-6)
Grid gap (4-col loc):  24px  (gap-6)
Between field groups:  24px  (space-y-6)
Label bottom margin:   8px   (mb-2)

FORM INPUTS
─────────────────────────────────────────────────────────────────
Horizontal padding:    16px  (px-4)
Vertical padding:      12px  (py-3)
Border radius:         8px   (rounded-lg)
Border width:          1px   (default), 2px (flash/selected)
Min height:            ~48px (py-3 + text line height)

SERVICE FEEDBACK GRID
─────────────────────────────────────────────────────────────────
Columns:               2  (desktop), 1  (mobile)
Gap between cards:     18px  (gap-[18px])

FEEDBACK CARD (FeedbackCard component)
─────────────────────────────────────────────────────────────────
Padding:               20px  (p-5)
Border radius:         12px  (rounded-xl)
Icon circle size:      36px × 36px  (w-9 h-9)
Gap (icon to text):    12px  (gap-3)
Icon row bottom margin:16px  (mb-4)
Icon row min height:   44px

EMOJI RATING ROW
─────────────────────────────────────────────────────────────────
Container padding:     8px all sides  (p-2)
Gap between cards:     10px  (gap-[10px])
Card inner padding:    14px top/bottom, 10px left/right  (14px 10px)
Card border radius:    16px
Emoji container size:  80px × 80px (default), 90px (Overall Experience)
Label top margin:      10px  (marginTop: 10px)

YES/NO TOGGLE
─────────────────────────────────────────────────────────────────
Outer container padding:   20px  (p-5)
Outer container radius:    12px  (rounded-xl)
Label bottom margin:       20px  (mb-5)
Grid gap between buttons:  16px  (gap-4)
Button vertical padding:   20px  (py-5)
Button horizontal padding: 24px  (px-6)
Button border radius:      16px  (rounded-2xl)
Button border width:       2px

SELECTABLE CARD (Why Choose Us)
─────────────────────────────────────────────────────────────────
Padding:               24px  (p-6)
Border radius:         12px  (rounded-xl)
Border width:          2px
Icon circle size:      48px × 48px  (w-12 h-12)
Icon circle bottom margin: 12px  (mb-3)
Check badge size:      24px × 24px  (w-6 h-6), top-right 12px inset

SELECTABLE CARDS GRID
─────────────────────────────────────────────────────────────────
Mobile:   2 columns
Tablet:   3 columns  (md:grid-cols-3)
Desktop:  4 columns  (lg:grid-cols-4)
Gap:      16px  (gap-4)

REVIEW SUMMARY GRID
─────────────────────────────────────────────────────────────────
Columns:               4  (desktop), 2  (tablet), 1  (mobile)
Gap:                   16px  (gap-4)
Card padding:          16px  (p-4)
Card border radius:    8px   (rounded-lg)
Outer section padding: 24px  (p-6)

NAVIGATION BUTTONS
─────────────────────────────────────────────────────────────────
Top margin:            48px  (mt-12)
Top padding:           32px  (pt-8)
Top border:            1px solid #f3f4f6
Horizontal padding:    32px  (px-8)
Vertical padding:      16px  (py-4)
Border radius:         12px  (rounded-xl)
Gap (icon to text):    12px  (gap-3)
Next button (wider):   px-10 = 40px horizontal


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY BUTTON (Next, Verify, Save)
─────────────────────────────────────────────────────────────────
Background:   #0d9488
Text:         #ffffff
Border:       none
Border-radius:12px  (rounded-xl) for nav buttons;
              8px   (rounded-lg) for smaller buttons
Shadow:       0 4px 6px rgba(13,148,136,0.25)  (shadow-teal-100)
Hover bg:     #0f766e
Hover transform: translateY(-2px)  (hover:-translate-y-0.5)

SUBMIT BUTTON
─────────────────────────────────────────────────────────────────
Background:   #16a34a
Text:         #ffffff
Border:       none
Border-radius:12px
Shadow:       0 4px 6px rgba(22,163,74,0.25)
Hover bg:     #15803d
Hover transform: translateY(-2px)

SECONDARY BUTTON (Previous, Cancel, Gray actions)
─────────────────────────────────────────────────────────────────
Background:   #ffffff
Border:       1px solid #e5e7eb
Text:         #374151
Border-radius:12px  (nav) or 8px  (modal/smaller)
Shadow:       0 1px 2px rgba(0,0,0,0.05)
Hover bg:     #f9fafb

TERTIARY BUTTON (Admin, Logout in header)
─────────────────────────────────────────────────────────────────
Background:   #e5e7eb
Text:         #374151
Border:       none
Border-radius:8px
Hover bg:     #d1d5db

TEXT INPUTS & SELECTS
─────────────────────────────────────────────────────────────────
Background:   #ffffff
Border:       1px solid #e5e7eb  (default)
Border-radius:8px
Focus border: 2px solid #0d9488 (replaced by ring)
Focus ring:   2px, color #0d9488, offset 0
Transition:   all 300ms

TEXTAREA
─────────────────────────────────────────────────────────────────
Identical to inputs above
Min rows specified:   3 (detail fields) or 5 (suggestions)
Resize: vertical (browser default)

DATE PICKER INPUT
─────────────────────────────────────────────────────────────────
Identical styling to text inputs
Uses react-datepicker with custom datepicker.css overrides

LANGUAGE TOGGLE PILL CONTAINER
─────────────────────────────────────────────────────────────────
Background:   #f3f4f6  (gray-100)
Border-radius:8px   (rounded-lg)
Padding:      4px   (p-1)
Gap between pills: none (buttons sit flush inside container)

LANGUAGE TOGGLE INDIVIDUAL PILL
─────────────────────────────────────────────────────────────────
Padding:      8px vertical, 16px horizontal  (py-2 px-4)
Border-radius:6px  (rounded-md)
Active bg:    #0d9488
Active text:  #ffffff
Active shadow:0 1px 2px rgba(0,0,0,0.05)
Inactive bg:  transparent
Inactive text:#4b5563
Transition:   all 150ms

PROGRESS STEP CIRCLE
─────────────────────────────────────────────────────────────────
Size:         40px × 40px
Border-radius:50%  (rounded-full)
Border-width: 2px
Transition:   all 300ms

  Completed state:
    Background:  #0d9488
    Border:      #0d9488
    Number color:#ffffff

  Active (current) state:
    Background:  #ffffff
    Border:      #0d9488  (2px)
    Ring:        4px, color #ccfbf1  (ring-teal-100), offset 0
    Number color:#0d9488

  Future (upcoming) state:
    Background:  #ffffff
    Border:      #d1d5db  (gray-300, 2px)
    Number color:#9ca3af
    Hover border:#5eead4  (teal-400)

PROGRESS CONNECTOR LINE
─────────────────────────────────────────────────────────────────
Height:       2px
Completed:    background #0d9488
Upcoming:     background #d1d5db
Transition:   all 500ms

EMOJI RATING CARD
─────────────────────────────────────────────────────────────────
Border-radius:16px
Border-width: 2px  (unselected), 3px  (selected)
Shadow default: 0 1px 4px rgba(0,0,0,0.06)
Shadow hover:   0 8px 16px rgba(0,0,0,0.12)
Shadow selected:0 6px 20px [color-specific rgba at 0.35 opacity]
transform-origin: center center
Transition:   200ms ease-out (hover/lift), 250ms ease (select)

YES/NO BUTTON
─────────────────────────────────────────────────────────────────
Border-radius:16px  (rounded-2xl)
Border-width: 2px
Shadow hover: 0 10px 15px rgba(0,0,0,0.1)  (hover:shadow-lg)
Transition:   all 300ms

SELECTABLE CARD (Why Choose Us)
─────────────────────────────────────────────────────────────────
Border-radius:12px  (rounded-xl)
Border-width: 2px
Default border: #e5e7eb
Selected border:#0d9488
Selected bg:    #f0fdfa  (teal-50)
Selected shadow:0 10px 15px rgba(0,0,0,0.1)  (shadow-lg)
Hover transform: scale(1.05)

FEEDBACK CARD (wrapper)
─────────────────────────────────────────────────────────────────
Border-radius:12px  (rounded-xl)
Border:       1px solid #e5e7eb
Shadow default: 0 1px 2px rgba(0,0,0,0.05)  (shadow-sm)
Shadow hover:   0 4px 6px rgba(0,0,0,0.07)  (shadow-md)

OVERALL EXPERIENCE SPECIAL CARD
─────────────────────────────────────────────────────────────────
Border:       2px solid #fbbf24  (amber-400)
Border-radius:12px  (rounded-xl)
Shadow:       0 10px 15px rgba(0,0,0,0.1)  (shadow-lg)

AUTO-FILL BADGE
─────────────────────────────────────────────────────────────────
Border-radius:9999px  (rounded-full)
Border:       1px solid #99f6e4  (teal-200)
Background:   #f0fdfa  (teal-50)
Padding:      4px vertical, 12px horizontal

OTP VERIFIED BADGE
─────────────────────────────────────────────────────────────────
Background:   #dcfce7  (green-100)
Text:         #15803d  (green-700)
Border-radius:8px  (rounded-lg)
No explicit border

PRIVACY NOTICE BANNER
─────────────────────────────────────────────────────────────────
Background:   #eff6ff  (blue-50)
Border:       1px solid #bfdbfe  (blue-200)
Border-radius:8px  (rounded-lg)
Padding:      16px  (p-4)

MODAL (Admin Login, Edit Question, etc.)
─────────────────────────────────────────────────────────────────
Background:   #ffffff
Border-radius:16px  (rounded-2xl)
Shadow:       0 25px 50px rgba(0,0,0,0.25)  (shadow-2xl)
Max-width:    384px  (max-w-sm for login), 448px  (max-w-md for edit)
Padding:      32px  (p-8)
Overlay:      rgba(0,0,0,0.60)  (bg-black/60), fixed inset-0

TOAST NOTIFICATIONS
─────────────────────────────────────────────────────────────────
Position:  top-right
Variant:   richColors (sonner library default rich styling)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROGRESS STEPPER — STEP CIRCLE STATES
─────────────────────────────────────────────────────────────────
State: FUTURE (not yet reached)
  Circle background:  #ffffff
  Circle border:      2px solid #d1d5db
  Number color:       #9ca3af
  English label:      11px, 700 weight, color #9ca3af
  Tamil label:        10px, 500 weight, color #9ca3af
  Connector line:     #d1d5db  (gray-300)
  Hover border:       #5eead4  (teal-400) — on group hover only

State: ACTIVE (current step)
  Circle background:  #ffffff
  Circle border:      2px solid #0d9488
  Ring:               4px solid #ccfbf1, offset 0  (ring-4 ring-teal-100)
  Number color:       #0d9488
  English label:      11px, 700 weight, color #111827
  Tamil label:        10px, 500 weight, color #0d9488
  Connector to left:  #0d9488  (teal — shows previous step is complete)
  Connector to right: #d1d5db  (gray — next step not yet reached)

State: COMPLETED (steps before current)
  Circle background:  #0d9488  (solid filled)
  Circle border:      2px solid #0d9488
  Number color:       #ffffff
  English label:      11px, 700 weight, color #111827
  Tamil label:        10px, 500 weight, color #0d9488
  Connector to right: #0d9488  (teal)

All state transitions: duration 300ms (circle), 500ms (connector line)


LANGUAGE TOGGLE — PILL STATES
─────────────────────────────────────────────────────────────────
State: INACTIVE (unselected language)
  Background:   transparent  (no fill inside gray container)
  Text:         #4b5563  (gray-600)
  Border:       none
  Shadow:       none

State: ACTIVE (selected language)
  Background:   #0d9488  (teal-600)
  Text:         #ffffff
  Border:       none
  Shadow:       0 1px 2px rgba(0,0,0,0.05)  (shadow-sm)

Container (always):
  Background:   #f3f4f6  (gray-100)
  Border-radius:8px
  Padding:      4px

Transition:     all 150ms  (transition-all on each pill)


EMOJI RATING CARD — STATES
─────────────────────────────────────────────────────────────────
State: DEFAULT (nothing selected)
  Background:   #ffffff
  Border:       2px solid [color-specific, see unselected borders above]
  Shadow:       0 1px 4px rgba(0,0,0,0.06)
  Scale:        1.0
  Emoji Y:      translateY(0)

State: HOVER (mouse over, nothing selected yet)
  Card:         translateY(-4px), scale stays 1.0
  Emoji:        translateY(-8px)
  Shadow:       0 8px 16px rgba(0,0,0,0.12)
  Border:       brightens to slightly more saturated hue
  Transition:   200ms ease-out

State: SELECTED
  Background:   color-specific solid fill (e.g. #16a34a for Good)
  Border:       3px solid same color
  Shadow:       0 6px 20px [color glow at 0.35 opacity]
  Scale:        1.08
  Emoji Y:      translateY(0)
  Label:        #ffffff
  Inner ring:   inset 0 0 0 2px rgba(255,255,255,0.30)

State: SELECTED + HOVER
  Emoji:        translateY(-6px)
  Shadow:       0 10px 20px [color glow — stronger]
  Card:         translateY(-4px)

State: SIBLING OF SELECTED (another card is selected)
  Scale:        0.97
  Hover while sibling selected: translateY(-4px) at scale 0.97

Transition all states: 200ms ease-out (hover), 250ms ease (selection)


YES/NO BUTTON — STATES
─────────────────────────────────────────────────────────────────
State: DEFAULT (null — nothing chosen)
  Background:   #ffffff
  Border:       2px solid #e5e7eb
  Text:         #6b7280

State: HOVER
  Border:       2px solid #93c5fd  (blue-300)
  Shadow:       0 10px 15px rgba(0,0,0,0.1)  (shadow-lg)
  Background:   #ffffff

State: SELECTED
  Background:   #dbeafe  (blue-100)
  Border:       2px solid #93c5fd  (blue-300)
  Text:         #1e3a8a  (blue-900)

Note: both "No" and "Yes" use identical styling in their
selected state — only the text label differs.


SELECTABLE CARD (Why Choose Us) — STATES
─────────────────────────────────────────────────────────────────
State: DEFAULT
  Background:   #ffffff
  Border:       2px solid #e5e7eb
  Icon bg:      #f3f4f6  (gray-100)
  Icon color:   #4b5563  (gray-600)
  Label:        #374151
  Check badge:  hidden
  Scale:        1.0

State: HOVER
  Border:       2px solid #5eead4  (teal-300)
  Scale:        1.05  (hover:scale-105)
  Transition:   all 150ms

State: SELECTED
  Background:   #f0fdfa  (teal-50)
  Border:       2px solid #0d9488  (teal-600)
  Icon bg:      #ccfbf1  (teal-100)
  Icon color:   #0d9488
  Label:        #0f766e  (teal-700)
  Shadow:       0 10px 15px rgba(0,0,0,0.1)
  Check badge:  24px circle, bg #0d9488, white check icon,
                positioned absolute top-right at 12px inset


FORM INPUTS — STATES
─────────────────────────────────────────────────────────────────
State: DEFAULT
  Border:   1px solid #e5e7eb
  Background: #ffffff

State: FOCUS
  Border:   2px solid #0d9488  (replaced visually by ring)
  Ring:     2px solid #0d9488, offset 0
  Outline:  none

State: AUTO-FILLED / FLASH
  Background: #ccfbf1  (teal-100)
  Border:     2px solid #0d9488  (teal-600)
  Duration:   500ms transition-all, resets after 2000ms

State: INVALID (pincode not found)
  Border:     1px solid #ef4444  (red-500)
  Icon:       XCircle in #dc2626

State: VALID (pincode matched)
  Icon:       Check in #16a34a

═══════════════════════════════════════════════════════════════════
END OF SPECIFICATION
═══════════════════════════════════════════════════════════════════