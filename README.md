# Hospital Management System (HMS) - Patient Feedback & Analytics Platform (V6.6)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live-brightgreen?logo=vercel)](https://hms-2-4.vercel.app)
[![React 18](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://www.postgresql.org/)

---

## 🏥 Project Overview

The **Hospital Management System (HMS) Patient Feedback & Analytics Platform** is an enterprise-grade feedback collection and clinical quality analytics application. It enables hospitals to capture real-time patient ratings across inpatient (IP) and outpatient (OP) departments, track satisfaction trends, manage complaint investigations with corrective/preventive actions, and generate executive reports.

The platform is designed with a **hybrid cloud & on-premise architecture**:
- **Cloud Mode**: Deployed on **Vercel** with Node.js Serverless Functions and a cloud **PostgreSQL** database.
- **Local Intranet Mode**: Deployable to on-premise **XAMPP / Apache / PHP / PostgreSQL / MySQL** hospital networks.

---

## ✨ Key Features

### 1. Bilingual Patient Feedback Wizard
- **Instant Language Toggle**: Seamless switching between **English** and **தமிழ் (Tamil)** with real-time UI text translation.
- **UHID Auto-Lookup**: Patient verification via `/api/get-patient` pre-populating patient identity and department.
- **Dynamic Department Ratings**: Interactive star scales (1★ to 5★) and animated emoji rating cards.
- **Yes / No Service Checkpoints**: Binary/trinary service checks for hygiene, billing transparency, and doctor treatment.
- **Auto-Reset Inactivity Timer**: Automatically returns to the welcome screen after 60 seconds of inactivity.

### 2. Administrative Analytics Dashboard
- **Executive KPIs**: Total responses, overall average rating, recommendation rate, today's submissions count, and response breakdown.
- **Feedback Responses Log**: Searchable, filterable table with multi-criteria filters (Date range, Department, Visit Type, Rating, Resolution status).
- **Office Use & Problem Resolution Workflow**: Modal interface for quality officers to log complaint investigations, corrective actions, preventive policies, and incharge accountability.
- **Dynamic Question Builder**: Add, edit, reorder (drag-and-drop via `@dnd-kit`), and manage bilingual labels for survey questions.
- **Structured 3-Section Excel / CSV Export**: Exports clean reports with UTF-8 BOM encoding for Excel compatibility:
  - *Section 1*: Department Rating Questions Summary (5★ distribution).
  - *Section 2*: Department Yes/No Questions Breakdown.
  - *Section 3*: Individual Patient Responses & Office Resolution Log.
- **100% Full-Width A4 Print Engine**: Clean print layout without sidebar interference and 2-column card grid fitting standard A4 paper.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Sonner (Toasts) |
| **Interactivity** | `@dnd-kit/core`, `@dnd-kit/sortable` (Drag and Drop) |
| **Cloud Backend** | Vercel Serverless Functions (`api/*.js`), Node.js |
| **Database** | PostgreSQL (Supabase / Neon cloud database with SSL connection pooling) |
| **Local Backend** | PHP 8.x, Apache (XAMPP compatibility proxies in `backend/`) |
| **Build & Sync** | Vite build runner + `sync-dist.js` (Multi-target asset synchronization) |

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
│   │   │   │   ├── admin/         # Modular Admin Subcomponents
│   │   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   │   ├── AdminHeader.tsx
│   │   │   │   │   └── OfficeUseModal.tsx
│   │   │   │   ├── common/        # Shared Reusable UI Controls
│   │   │   │   │   ├── StarRating.tsx
│   │   │   │   │   ├── EmojiRating.tsx
│   │   │   │   │   ├── ToggleSwitch.tsx
│   │   │   │   │   ├── ThreeStateToggle.tsx
│   │   │   │   │   └── SelectableCard.tsx
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

## 🗄️ Database Backups & Schema Files

This repository contains ready-to-use database backup files:

1. **[`database_schema.sql`](./database_schema.sql)**:
   - Contains all 18 table structures (`CREATE TABLE`), primary keys, default values, and foreign constraints.
2. **[`database_dump_with_data.sql`](./database_dump_with_data.sql)**:
   - Full backup containing both table schemas and all 2,300+ live data records (feedback submissions, complaint reviews, department ratings, and questions).

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- (Optional for local PHP) XAMPP / Apache

### 1. Clone the Repository
```bash
git clone https://github.com/Avaneesh-ravi/HMS_2.4.git
cd HMS_2.4
```

### 2. Frontend Source Setup & Development
```bash
# Navigate to the frontend source
cd frontend_source

# Install dependencies
npm install

# Start Vite hot-reload development server
npm run dev

# Build production bundles (automatically syncs to dist, frontend/, api/frontend/, and public/)
npm run build
```

### 3. Local XAMPP Intranet Setup
1. Copy the project into your Apache document root: `c:\xampp\htdocs\HMS_V6.6`.
2. Start **Apache** in XAMPP Control Panel.
3. Access Feedback Form: `http://localhost/HMS_V6.6/frontend/feedback-form.php?hospital_id=apollo-hospital`.
4. Access Admin Portal: `http://localhost/HMS_V6.6/backend/admin/login.php`.

### 4. Cloud Deployment (Vercel)
- Push changes to the `main` branch.
- Vercel automatically builds the project and deploys the Serverless API functions in `/api`.
- Live URL: **[https://hms-2-4.vercel.app](https://hms-2-4.vercel.app)**

---

## 📡 RESTful API Endpoints Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/get-hospitals` | `GET` | Fetches hospital profile, branding, and config |
| `/api/get-patient` | `GET` | Validates UHID and returns patient registration data |
| `/api/get-questions` | `GET` | Returns list of active and past dynamic feedback questions |
| `/api/get-responses` | `GET` | Returns feedback submissions merged with complaint review actions |
| `/api/submit-feedback`| `POST` | Ingests new patient feedback submissions |
| `/api/save-office-use`| `POST` | Upserts complaint reviews, corrective, and preventive actions |
| `/api/save-questions` | `POST` | Saves custom questions, bilingual labels, and ordering |
| `/api/login-ajax` | `POST` | Validates admin credentials and issues session token |

---

## 📖 Knowledge Transfer & Handover Documentation

For complete technical handover, architecture diagrams, data flow lifecycles, and maintenance instructions, please refer to:
📄 **[`TOI_DOCUMENT.md`](./TOI_DOCUMENT.md)**
