-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;
-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(120) UNIQUE,
    password_hash TEXT,
    role VARCHAR(50),
    phone VARCHAR(20),
    village VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
-- PATIENTS TABLE
CREATE TABLE patients (
    id UUID PRIMARY KEY,
    patient_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    age INT,
    trimester INT,
    pregnancy_week INT,
    village VARCHAR(100),
    latitude FLOAT,
    longitude FLOAT,
    blood_group VARCHAR(10),
    contact_number VARCHAR(20),
    emergency_contact VARCHAR(20),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);
-- HEALTH RECORDS TABLE
CREATE TABLE health_records (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    systolic_bp FLOAT,
    diastolic_bp FLOAT,
    hemoglobin FLOAT,
    blood_sugar FLOAT,
    heart_rate FLOAT,
    body_temperature FLOAT,
    weight FLOAT,
    symptoms TEXT,
    source_type VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- PREDICTIONS TABLE
CREATE TABLE predictions (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    anemia_risk VARCHAR(20),
    hypertension_risk VARCHAR(20),
    overall_risk VARCHAR(20),
    confidence_score FLOAT,
    model_version VARCHAR(50),
    ai_summary TEXT,
    recommendation TEXT,
    predicted_at TIMESTAMP DEFAULT NOW()
);
-- ALERTS TABLE
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    severity VARCHAR(20),
    alert_message TEXT,
    status VARCHAR(20),
    resolved_by UUID REFERENCES users(id),
    triggered_at TIMESTAMP DEFAULT NOW()
);
-- OCR REPORTS TABLE
CREATE TABLE ocr_reports (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    report_url TEXT,
    extracted_text TEXT,
    parsed_json JSONB,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
-- NUTRITION RECOMMENDATIONS TABLE
CREATE TABLE nutrition_recommendations (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    recommendation TEXT,
    language VARCHAR(20),
    generated_at TIMESTAMP DEFAULT NOW()
);
-- VILLAGE ANALYTICS TABLE
CREATE TABLE village_analytics (
    id UUID PRIMARY KEY,
    village_name VARCHAR(100),
    high_risk_cases INT,
    medium_risk_cases INT,
    low_risk_cases INT,
    anemia_cases INT,
    hypertension_cases INT,
    updated_at TIMESTAMP DEFAULT NOW()
);
-- VECTOR DATABASE TABLE
CREATE TABLE healthcare_embeddings (
    id UUID PRIMARY KEY,
    content TEXT,
    source VARCHAR(255),
    embedding VECTOR(1536),
    created_at TIMESTAMP DEFAULT NOW()
);