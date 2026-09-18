-- =========================================================================
-- HOSPITAL MANAGEMENT SYSTEM (HMS) - POSTGRESQL DATABASE SCHEMA DUMP
-- Generated: 2026-09-18T05:07:56.353Z
-- Host: aws-0-ap-northeast-1.pooler.supabase.com
-- Database: postgres
-- =========================================================================

-- -------------------------------------------------------------------------
-- Table structure for: appreciation
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appreciation (
    appreciation_id BIGINT NOT NULL,
    submission_id BIGINT,
    person_name CHARACTER VARYING(150) DEFAULT NULL::character varying,
    department CHARACTER VARYING(100) DEFAULT NULL::character varying,
    comments TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appreciation_pkey PRIMARY KEY (appreciation_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: complaint_review
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaint_review (
    review_id BIGINT NOT NULL,
    submission_id BIGINT,
    review_comments TEXT,
    review_date DATE,
    corrective_action TEXT,
    preventive_action TEXT,
    incharge_name CHARACTER VARYING(150) DEFAULT NULL::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT complaint_review_pkey PRIMARY KEY (review_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: department
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.department (
    department_id INTEGER NOT NULL,
    department_code CHARACTER VARYING(20) DEFAULT NULL::character varying,
    department_name CHARACTER VARYING(100) NOT NULL,
    hospital_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT department_pkey PRIMARY KEY (department_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: device_binding
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.device_binding (
    device_id CHARACTER VARYING(100) NOT NULL,
    hospital_id INTEGER NOT NULL,
    bound_by_admin_id INTEGER NOT NULL,
    bound_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT device_binding_pkey PRIMARY KEY (device_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: feedback_form
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_form (
    feedback_form_id BIGINT NOT NULL,
    name_en CHARACTER VARYING(150) DEFAULT NULL::character varying,
    name_ta CHARACTER VARYING(150) DEFAULT NULL::character varying,
    hospital_id INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status CHARACTER VARYING(100) DEFAULT 'Active'::character varying,
    layout_mode SMALLINT DEFAULT 2,
    combine_pages SMALLINT DEFAULT 0,
    theme_color CHARACTER VARYING(20) DEFAULT '#0d9488'::character varying,
    font_size CHARACTER VARYING(20) DEFAULT 'Normal'::character varying,
    show_title_labels SMALLINT DEFAULT 1,
    departments TEXT,
    CONSTRAINT feedback_form_pkey PRIMARY KEY (feedback_form_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: feedback_form_rating_question
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_form_rating_question (
    id BIGINT NOT NULL,
    feedback_form_id BIGINT NOT NULL,
    question_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 1,
    status CHARACTER VARYING(100) DEFAULT 'Active'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_form_rating_question_pkey PRIMARY KEY (id)
);

-- -------------------------------------------------------------------------
-- Table structure for: feedback_form_yesno_question
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_form_yesno_question (
    id BIGINT NOT NULL,
    feedback_form_id BIGINT NOT NULL,
    yesno_question_id BIGINT NOT NULL,
    display_order INTEGER DEFAULT 1,
    status CHARACTER VARYING(100) DEFAULT 'Active'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_form_yesno_question_pkey PRIMARY KEY (id)
);

-- -------------------------------------------------------------------------
-- Table structure for: feedback_submission
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_submission (
    submission_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    hospital_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    feedback_form_id BIGINT NOT NULL,
    submission_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status CHARACTER VARYING(100) DEFAULT 'Pending'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_submission_pkey PRIMARY KEY (submission_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: feedbacks
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    hospital_id INTEGER NOT NULL,
    q1_cleanliness CHARACTER VARYING(50) NOT NULL,
    q2_staff_behavior CHARACTER VARYING(50) NOT NULL,
    q3_doctor_care CHARACTER VARYING(50) NOT NULL,
    rating INTEGER NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedbacks_pkey PRIMARY KEY (id)
);

-- -------------------------------------------------------------------------
-- Table structure for: hospital
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital (
    hospital_id INTEGER NOT NULL,
    hospital_code CHARACTER VARYING(20) DEFAULT NULL::character varying,
    slug CHARACTER VARYING(100) DEFAULT NULL::character varying,
    name CHARACTER VARYING(200) NOT NULL,
    address1 CHARACTER VARYING(255) DEFAULT NULL::character varying,
    address2 CHARACTER VARYING(255) DEFAULT NULL::character varying,
    mobile CHARACTER VARYING(20) DEFAULT NULL::character varying,
    email CHARACTER VARYING(100) DEFAULT NULL::character varying,
    website CHARACTER VARYING(255) DEFAULT NULL::character varying,
    logo CHARACTER VARYING(255) DEFAULT NULL::character varying,
    status CHARACTER VARYING(100) DEFAULT 'Active'::character varying,
    CONSTRAINT hospital_pkey PRIMARY KEY (hospital_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: hospital_admin
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospital_admin (
    hospital_admin_id INTEGER NOT NULL,
    hospital_id INTEGER NOT NULL,
    admin_name CHARACTER VARYING(150) NOT NULL,
    email CHARACTER VARYING(100) NOT NULL,
    username CHARACTER VARYING(50) NOT NULL,
    password_hash CHARACTER VARYING(255) NOT NULL,
    mobile CHARACTER VARYING(20) DEFAULT NULL::character varying,
    designation CHARACTER VARYING(100) DEFAULT NULL::character varying,
    role CHARACTER VARYING(100) DEFAULT 'Hospital Admin'::character varying,
    status CHARACTER VARYING(100) DEFAULT 'Active'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hospital_admin_pkey PRIMARY KEY (hospital_admin_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: hospitals
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
    id INTEGER NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    location CHARACTER VARYING(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hospitals_pkey PRIMARY KEY (id)
);

-- -------------------------------------------------------------------------
-- Table structure for: patient
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient (
    patient_id BIGINT NOT NULL,
    patient_uuid CHARACTER(36) DEFAULT NULL::bpchar,
    uhid CHARACTER VARYING(50) DEFAULT NULL::character varying,
    first_name CHARACTER VARYING(100) NOT NULL,
    last_name CHARACTER VARYING(100) DEFAULT NULL::character varying,
    age INTEGER,
    gender CHARACTER VARYING(100) DEFAULT NULL::character varying,
    mobile CHARACTER VARYING(20) DEFAULT NULL::character varying,
    p_email CHARACTER VARYING(100) DEFAULT NULL::character varying,
    address TEXT,
    city CHARACTER VARYING(100) DEFAULT NULL::character varying,
    pin_code CHARACTER VARYING(10) DEFAULT NULL::character varying,
    state CHARACTER VARYING(100) DEFAULT NULL::character varying,
    country CHARACTER VARYING(100) DEFAULT 'India'::character varying,
    op_no CHARACTER VARYING(50) DEFAULT NULL::character varying,
    op_date DATE,
    ip_no CHARACTER VARYING(50) DEFAULT NULL::character varying,
    admission_date DATE,
    discharge_date DATE,
    hospital_id INTEGER,
    feedback_form_id BIGINT,
    CONSTRAINT patient_pkey PRIMARY KEY (patient_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: patients
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id INTEGER NOT NULL,
    hospital_id INTEGER NOT NULL,
    full_name CHARACTER VARYING(255) NOT NULL,
    mobile_number CHARACTER VARYING(15) NOT NULL,
    email CHARACTER VARYING(255) DEFAULT NULL::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patients_pkey PRIMARY KEY (id)
);

-- -------------------------------------------------------------------------
-- Table structure for: rating_question
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rating_question (
    question_id INTEGER NOT NULL,
    question_tag CHARACTER VARYING(50) DEFAULT NULL::character varying,
    question_text_en CHARACTER VARYING(255) DEFAULT NULL::character varying,
    question_text_ta TEXT,
    display_order INTEGER,
    active SMALLINT DEFAULT 1,
    rating_grade CHARACTER VARYING(50) DEFAULT NULL::character varying,
    feedback_form_id BIGINT,
    hospital_id INTEGER,
    status CHARACTER VARYING(100) DEFAULT 'Active'::character varying,
    CONSTRAINT rating_question_pkey PRIMARY KEY (question_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: ratings
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ratings (
    rating_id BIGINT NOT NULL,
    question_id INTEGER NOT NULL,
    feedback_form_id BIGINT NOT NULL,
    hospital_id INTEGER NOT NULL,
    patient_id BIGINT NOT NULL,
    rating CHARACTER VARYING(100) DEFAULT NULL::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ratings_pkey PRIMARY KEY (rating_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: referral
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referral (
    referral_id INTEGER NOT NULL,
    patient_id BIGINT NOT NULL,
    referral_source CHARACTER VARYING(100) DEFAULT NULL::character varying,
    referral_other_text CHARACTER VARYING(255) DEFAULT NULL::character varying,
    CONSTRAINT referral_pkey PRIMARY KEY (referral_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: suggestion
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suggestion (
    suggestion_id BIGINT NOT NULL,
    submission_id BIGINT,
    patient_id BIGINT NOT NULL,
    hospital_id INTEGER NOT NULL,
    suggestion_text TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT suggestion_pkey PRIMARY KEY (suggestion_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: system_admin
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_admin (
    admin_id INTEGER NOT NULL,
    admin_name CHARACTER VARYING(100) NOT NULL,
    email CHARACTER VARYING(100) NOT NULL,
    username CHARACTER VARYING(50) NOT NULL,
    password_hash CHARACTER VARYING(255) NOT NULL,
    mobile CHARACTER VARYING(20) DEFAULT NULL::character varying,
    role CHARACTER VARYING(100) DEFAULT 'SUPER_ADMIN'::character varying,
    status CHARACTER VARYING(100) DEFAULT 'Active'::character varying,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT system_admin_pkey PRIMARY KEY (admin_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: yesno_answer
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.yesno_answer (
    yesno_answer_id BIGINT NOT NULL,
    yesno_question_id BIGINT,
    patient_id BIGINT,
    submission_id BIGINT,
    feedback_form_id BIGINT,
    hospital_id INTEGER,
    answer SMALLINT,
    remarks TEXT,
    CONSTRAINT yesno_answer_pkey PRIMARY KEY (yesno_answer_id)
);

-- -------------------------------------------------------------------------
-- Table structure for: yesno_question
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.yesno_question (
    yesno_question_id BIGINT NOT NULL,
    question_en CHARACTER VARYING(255) DEFAULT NULL::character varying,
    question_ta CHARACTER VARYING(255) DEFAULT NULL::character varying,
    answer_for_yes CHARACTER VARYING(255) DEFAULT NULL::character varying,
    answer_for_no CHARACTER VARYING(255) DEFAULT NULL::character varying,
    feedback_form_id BIGINT,
    hospital_id INTEGER,
    status CHARACTER VARYING(100) DEFAULT 'Active'::character varying,
    describe_issue_trigger CHARACTER VARYING(10) DEFAULT 'no'::character varying,
    CONSTRAINT yesno_question_pkey PRIMARY KEY (yesno_question_id)
);
