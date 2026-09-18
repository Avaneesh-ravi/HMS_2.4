# Hospital Management System (HMS) - Patient Feedback & Analytics Platform (V6.6)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live-brightgreen?logo=vercel)](https://hms-2-4.vercel.app)
[![React 18](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?logo=supabase)](https://supabase.com/)

---

## 🏥 Project Overview

The **Hospital Management System (HMS) Patient Feedback & Analytics Platform** is an enterprise-grade web application engineered to capture, aggregate, analyze, and act upon multi-departmental inpatient (IP) and outpatient (OP) patient experiences in real time.

It supports dual deployment modes:
- **Cloud Mode (Recommended)**: Hosted on **Vercel** with Node.js Serverless Functions and a managed **Supabase PostgreSQL** cloud database.
- **Local Intranet Mode**: Deployed on hospital on-premise **XAMPP / Apache / PHP / PostgreSQL / MySQL** networks.

---

## ✨ Key Features

- **Bilingual Patient Feedback Wizard**: Real-time switching between **English** and **தமிழ் (Tamil)**.
- **UHID Auto-Lookup**: Patient identity verification via `/api/get-patient` pre-filling patient records.
- **Dynamic Department Ratings**: Interactive 5-star scales and animated emoji rating cards.
- **Yes / No Service Inquiries**: Binary questions for cleanliness, cost transparency, and doctor treatment.
- **Office Use & Problem Resolution Action Log**: Quality officer workflow to log investigations, corrective actions, preventive policies, and incharge accountability.
- **Dynamic Survey Question Builder**: Add, edit, reorder (drag-and-drop), and manage bilingual labels for survey questions.
- **Clean 3-Section Excel / CSV Export**: Structured report containing Department Ratings summary, Yes/No breakdown, and individual patient responses with office action logs.
- **100% Full-Width A4 Print Engine**: Clean executive print layout without sidebar interference.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Sonner (Toasts) |
| **Interactivity** | `@dnd-kit/core`, `@dnd-kit/sortable` (Drag and Drop) |
| **Cloud Backend** | Vercel Serverless Functions (`api/*.js`), Node.js |
| **Cloud Database** | PostgreSQL (Hosted on Supabase with SSL pooling) |
| **Local Backend** | PHP 8.x, Apache (XAMPP compatibility proxies in `backend/`) |
| **Build & Asset Sync** | Vite + `sync-dist.js` (Multi-target asset synchronization) |

---

## 📂 Project Directory Structure

```plaintext
HMS_V6.6/
├── api/                           # Vercel Serverless API Functions (Node.js)
│   ├── db.js                      # Centralized PostgreSQL Connection Pool
│   ├── get-hospitals.js           # Hospital Profile & Branding Endpoint
│   ├── get-patient.js             # Patient Verification & UHID Lookup
│   ├── get-questions.js           # Dynamic Question Registry API
│   ├── get-responses.js           # Submissions & Complaint Review Fetch API
│   ├── login-ajax.js              # Admin Authentication API
│   ├── save-office-use.js         # Office Complaint Resolution & Actions API
│   ├── save-questions.js          # Dynamic Question CRUD API
│   └── submit-feedback.js         # Patient Feedback Submission Ingestion API
├── archive/                       # Archived Test & Diagnostic Scripts
│   └── test_scripts/              # Historical test and diagnostic PHP/JS scripts
├── backend/                       # Local PHP/XAMPP Integration
│   ├── admin/                     # Dashboard & Login PHP Proxies
│   └── config/                    # Local Database Config
├── frontend/                      # Compiled Production Assets (Synced from Vite)
├── frontend_source/               # React + TypeScript Source Code
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── admin/         # Modular Admin Subcomponents (Sidebar, Header, Modal)
│   │   │   │   ├── common/        # Shared Reusable UI Controls (Stars, Emojis, Toggles)
│   │   │   │   ├── AdminDashboard.tsx   # Admin Coordinator Component
│   │   │   │   ├── HospitalSelection.tsx# Hospital Picker Component
│   │   │   │   └── WelcomePage.tsx      # Welcome Screen Component
│   │   │   ├── App.tsx            # Patient Feedback Wizard Coordinator
│   │   │   └── real_db_data.ts    # Seed & Fallback Mock Data
│   │   ├── services/              # API Client & Export Logic
│   │   │   ├── api.service.ts     # Centralized HTTP Client
│   │   │   ├── export.service.ts  # Structured CSV/Excel Export Engine
│   │   │   └── index.ts
│   │   ├── types/                 # Shared TypeScript Type Definitions
│   │   │   ├── admin.types.ts
│   │   │   ├── feedback.types.ts
│   │   │   ├── office-use.types.ts
│   │   │   └── index.ts
│   │   └── styles/                # CSS & Print Style Rules
├── public/                        # Static Assets & Public Index
├── database_schema.sql            # Complete PostgreSQL Database Schema Dump
├── database_dump_with_data.sql    # Complete Database Dump (Schema + Live Data Records)
├── TOI_DOCUMENT.md                # Official Transfer of Information (TOI) Handover Manual
├── sync-dist.js                   # Build-time multi-target asset sync script
├── vercel.json                    # Vercel Routing & Serverless Configuration
└── README.md                      # Project Documentation (This File)
```

---

## 🔰 Complete Beginner's Guide: Running on Another Computer

Follow this step-by-step guide to set up, run, and deploy this project from scratch on any new computer.

### Step 1: Install Required Software on the Computer
1. **Node.js (LTS Version)**:
   - Download and install Node.js (v18 or higher) from [nodejs.org](https://nodejs.org/).
   - Verify in terminal:
     ```bash
     node -v
     npm -v
     ```
2. **Git**:
   - Download and install Git from [git-scm.com](https://git-scm.com/).
3. **VS Code (Optional)**: Download from [code.visualstudio.com](https://code.visualstudio.com/).

---

### Step 2: Supabase Database Setup (Cloud PostgreSQL)

1. **Create a Supabase Account**:
   - Go to [supabase.com](https://supabase.com/) and click **Start your project** (Sign up with GitHub or Email).
2. **Create a New Project**:
   - Click **New Project**.
   - **Name**: `hms-database` (or any name).
   - **Database Password**: Set a strong password and **save it securely**.
   - **Region**: Select the region closest to you (e.g., `South Asia (Mumbai)` or `Singapore`).
   - Click **Create new project** and wait ~2 minutes for initialization.
3. **Import Database Schema & Data**:
   - In your Supabase project dashboard, click **SQL Editor** from the left menu.
   - Click **New query**.
   - Open the file [`database_dump_with_data.sql`](./database_dump_with_data.sql) from this repository, copy all its text, and paste it into the Supabase SQL Editor.
   - Click **Run** (or press `Ctrl + Enter`).
   - You will see `Success: No rows returned` — all 18 tables and 2,300+ sample records are now imported!
4. **Get Database Connection Details**:
   - In Supabase, go to **Project Settings (gear icon)** $ightarrow$ **Database**.
   - Under **Connection parameters**, note down:
     - **Host**: (e.g., `aws-0-ap-northeast-1.pooler.supabase.com`)
     - **Port**: `5432` (or `6543`)
     - **Database**: `postgres`
     - **User**: `postgres.[PROJECT-REF]`
     - **Password**: Your database password.

---

### Step 3: Clone and Configure the Project Locally

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Avaneesh-ravi/HMS_2.4.git
   cd HMS_2.4
   ```

2. **Configure Database Connection**:
   - Open [`api/db.js`](./api/db.js) in your code editor.
   - Verify or update the connection credentials with your Supabase details:
     ```javascript
     host: process.env.DB_HOST || 'YOUR_SUPABASE_HOST',
     port: parseInt(process.env.DB_PORT || '5432', 10),
     database: process.env.DB_NAME || 'postgres',
     user: process.env.DB_USER || 'YOUR_SUPABASE_USER',
     password: process.env.DB_PASS || 'YOUR_SUPABASE_PASSWORD',
     ```

3. **Install Frontend Dependencies & Run Locally**:
   ```bash
   # Navigate into the frontend_source folder
   cd frontend_source

   # Install all packages
   npm install

   # Start the local development server with hot-reload
   npm run dev
   ```
   - Open your browser at `http://localhost:5173/` (or the URL shown in terminal).

4. **Build Production Assets**:
   ```bash
   npm run build
   ```
   *This automatically bundles the React code and syncs assets to `frontend/`, `api/frontend/`, and `public/`.*

---

### Step 4: Vercel Cloud Deployment Setup

1. **Sign Up on Vercel**:
   - Go to [vercel.com](https://vercel.com/) and sign in with your GitHub account.
2. **Import Repository**:
   - Click **Add New...** $ightarrow$ **Project**.
   - Select your cloned repository `HMS_2.4`.
3. **Configure Environment Variables in Vercel**:
   - Before clicking Deploy, expand the **Environment Variables** section.
   - Add the following keys with your Supabase credentials:
     | Name | Value |
     |---|---|
     | `DB_HOST` | Your Supabase Host (e.g. `aws-0-ap-northeast-1.pooler.supabase.com`) |
     | `DB_PORT` | `5432` |
     | `DB_NAME` | `postgres` |
     | `DB_USER` | Your Supabase User (e.g. `postgres.oeithmuipahqhaoznznd`) |
     | `DB_PASS` | Your Supabase Database Password |
4. **Deploy**:
   - Click **Deploy**. Vercel will build the project in ~1 minute and provide a live URL (e.g., `https://your-project.vercel.app`).

---

### Step 5: (Optional) Local XAMPP Setup (Intranet / Offline Mode)

1. Download and install **XAMPP** from [apachefriends.org](https://www.apachefriends.org/).
2. Move the project folder into `c:\xampp\htdocs\HMS_V6.6`.
3. Open **XAMPP Control Panel** and start **Apache**.
4. Access:
   - **Feedback Form**: `http://localhost/HMS_V6.6/frontend/feedback-form.php?hospital_id=apollo-hospital`
   - **Admin Portal**: `http://localhost/HMS_V6.6/backend/admin/login.php`

---

## ❓ Frequently Asked Questions & Troubleshooting

### 1. "Database connection error / Connection timeout"
- **Fix**: Ensure your computer has active internet access to reach Supabase. Verify the password in [`api/db.js`](./api/db.js) or Vercel Environment Variables.

### 2. "Port 5173 is already in use"
- **Fix**: Vite will automatically switch to port 5174 (`http://localhost:5174/`). Or stop existing Node processes in Task Manager.

### 3. "Changes in frontend_source are not reflecting"
- **Fix**: Run `npm run build` inside `frontend_source/` so `sync-dist.js` updates the static asset directories.

---

## 📖 Handover & Knowledge Transfer (TOI)
For architecture details, ER diagrams, data flow diagrams, and deep maintenance guides, refer to:
📄 **[`TOI_DOCUMENT.md`](./TOI_DOCUMENT.md)**
