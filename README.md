# Hospital Patient Feedback System V2.2

## Project Overview
The Hospital Patient Feedback System is a multi-tenant database-backed web application. It features a patient-facing gateway, a multi-step patient feedback form, and a scoped admin dashboard designed to let hospitals securely collect, review, and add internal "Office Use Only" notes to patient feedback.

## Key Features
- **Multi-tenant Architecture:** A gateway page (`index.php`) allows patients to select a specific hospital to submit feedback for.
- **Patient Authentication:** A UI patient login interface (`patient-login.php`) for verified portal access.
- **Multi-step Feedback Form:** Contains fields for Patient Information, Service Feedback via emoji ratings, Yes/No questions, Suggestions, and Appreciation.
- **Admin Dashboard:** Features overall statistics (total responses, recommendation percentages, average ratings).
- **Admin Response Management:** Dedicated tables to view comprehensive details of submissions with the ability to edit an "Office Use Only" review modal (Corrective Actions, Preventive Actions, etc.).
- **Modern UI Transition:** Includes a React/Vite/Tailwind frontend integration inside `frontend_source/`, injecting polished components into the PHP pages.

## Tech Stack
- **Languages Used:** PHP, TypeScript, JavaScript, HTML, CSS, SQL.
- **Frontend Source:** React 18, Vite, Tailwind CSS v4, Radix UI components (shadcn/ui), Framer Motion, and Embla Carousel.
- **Backend & APIs:** PHP 7.4+ combined with PDO.
- **Database:** MySQL / MariaDB.
- **Package Management (Frontend):** pnpm.

## Folder & File Structure Overview
The project is divided into dedicated directories separating backend application APIs from frontend UI development blocks:

```text
HMS_V2.2/
├── backend/                  # Secure PHP server-side logic
│   ├── admin/                # Admin portal to review responses (login.php, dashboard.php, etc.)
│   ├── ajax/                 # API endpoints accessed via AJAX (e.g. for Office Use updates)
│   ├── config/               # Database connection settings (database.php - Update your DB info here)
│   ├── database/             # Database backups & migrations (schema.sql)
│   ├── includes/             # Shared functional includes (core functions)
│   └── process/              # PHP scripts converting form POST data into DB inserts
├── frontend/                 # Public-facing PHP pages that receive patient data
│   ├── assets/               # CSS/JS output from the frontend_source builds
│   ├── includes/             # Shared layout UI (e.g., patient-facing header.php and footer.php)
│   ├── index.php             # Directory entrance that redirects patients
│   ├── feedback-form.php     # Multi-step feedback page (handles patient inputs)
│   └── patient-login.php     # Portal gateway for patient identity verification
├── frontend_source/          # Isolated React & Node.js development workspace
│   ├── src/                  # React source (components, hooks, UI styling)
│   ├── package.json          # Node.js dependencies (Radix UI, motion, react-hook-form, etc.)
│   └── vite.config.ts        # Vite configuration that exports compiled bundles directly into /frontend/
├── includes/                 # Global include utilities (if required)
├── index.php                 # Global traffic router — redirects users to 'frontend/index.php'
└── README.md                 # Project documentation (this file)
```

## Installation & Setup Instructions

### 1. Project Placement
Place the `HMS_V2.2` project folder inside your web server's document root:
- Windows XAMPP: `C:\xampp\htdocs\New\HMS_V2.2`
- Mac/Linux: `/opt/lampp/htdocs/HMS_V2.2`

### 2. Database Setup
Create a new MySQL database named `hospital_feedback_system`.
Import the schema located at `backend/database/schema.sql` (e.g., via phpMyAdmin or command line).

### 3. Backend Configuration
No `.env` file is used. The application configuration is handled via PHP constants. Update the settings inside `backend/config/database.php` to match your local MySQL server:
- `DB_HOST` (e.g., `'localhost'`)
- `DB_NAME` (e.g., `'hospital_feedback_system'`)
- `DB_USER` (e.g., `'root'`)
- `DB_PASS` (e.g., `''`)

### 4. Frontend Setup
Navigate into the `frontend_source/` directory via terminal, install the packages, and build the UI:
```bash
cd frontend_source
pnpm install
pnpm run build
```
*Note: Building inside `frontend_source` outputs the compiled assets directly into the public `frontend/` directory.*

## Usage Instructions
- **Start the Application:** Run your Apache server and MySQL database.
- **Patient Gateway:** Go to `http://localhost/New/HMS_V2.2/` in your browser.
- **Admin Dashboard:** Access the backend administration area at `http://localhost/New/HMS_V2.2/backend/admin/login.php`.

## Available Scripts
The following npm scripts can be found in `frontend_source/package.json`:
- `pnpm run dev` — Starts the Vite development server for building the UI in isolation.
- `pnpm run build` — Compiles the React/Tailwind frontend into production assets.

## Known Limitations & Notes
- The database connection object relies heavily on a single PDO function definition inside `backend/config/database.php`. Modifying this impacts the whole app.
- Ensure that the PHP script executing user transactions has standard write/read privileges mapped to `/backend/process/` and `/backend/ajax/`.
- The UI integrates standard PHP routing mixed with built React CSS/JS fragments — if elements do not update structurally when changing `frontend_source/src/`, make sure caching is disabled and rerun `pnpm run build`.
