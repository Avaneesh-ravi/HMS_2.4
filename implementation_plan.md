# Implementation Plan: Vanilla JS DOM Overrides

## Goal Description
The React source code (`frontend_source/src/`) is missing from the project, making it impossible to directly edit the UI components. However, since the React application is hosted inside `dashboard.php` and `feedback-form.php`, we can implement a **pure JavaScript injection workaround**.

We will inject a `<script>` block at the end of the PHP files that uses `MutationObserver` to intercept the React-rendered DOM and mutate it on the fly to fulfill your 4 requests.

## User Review Required
> [!WARNING]
> This approach injects "hacky" Vanilla JavaScript into the wrapper to override the compiled React DOM. While this will solve your immediate requests, if the React layout classes change in the future, these scripts may need adjusting. 

## Proposed Changes

### 1. `api/frontend/feedback-form.php`
#### [MODIFY] [feedback-form.php](file:///c:/xampp/htdocs/HMS_V2.2/api/frontend/feedback-form.php)
- Inject a script that observes the DOM for the "Please fix the errors..." banner (toast block).
- When the banner appears, query the DOM for all invalid inputs (`.border-red-500`).
- Extract the labels surrounding those inputs.
- Rewrite the banner text on-the-fly to explicitly state which fields are missing (e.g. `⚠️ Please fix: Mobile Number, Age`).

### 2. `api/backend/admin/dashboard.php`
#### [MODIFY] [dashboard.php](file:///c:/xampp/htdocs/HMS_V2.2/api/backend/admin/dashboard.php)
- Inject a script observing the mounting of the Feedback Responses `table`.
- **S.No Column**: As React mounts `<tr class="border-b">`, dynamically prepend a `<th>S.No</th>` to the header row, and `<td>1</td>`, `<td>2</td>` to the body rows.
- **Filtering System**: Add an Event Listener to the non-functional "Filter" button. When clicked, it will read the dates and any custom injected filters (e.g., star rating dropdown), then loop through the `<tbody><tr>` elements and apply `display: none` to those that don't match, or rearrange them for sorting.
- **Print Button**: Use an observer to watch for the Feedback Detail modal opening. Inject a `<button>Print</button>` into the modal. When clicked, it will temporarily apply print CSS to hide the background, set the page title to the Patient's Name, trigger `window.print()`, and revert.

## Verification Plan
### Manual Verification
- **Patient info errors**: Load form, submit empty, ensure the banner says exactly which fields are invalid.
- **S.No Column**: Load dashboard, verify the left-most column is S.No and increments.
- **Filter**: Use the custom filter script on the dashboard table to sort and filter rows without page reload.
- **Print**: Open a feedback detail, click Print, verify the print dialog opens displaying only the modal content with the correct filename.
