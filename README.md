# NAB Preg AI — AI-Powered Maternal Risk Intelligence Platform

> Predicting maternal health risks before they become emergencies.

## Overview

NAB Preg AI is an AI-powered maternal healthcare intelligence platform designed to support healthcare workers, NGOs, and public health programs in identifying high-risk pregnancies early.

The platform combines OCR, machine learning, clinical risk scoring, retrieval-augmented generation (RAG), and population-level analytics to transform maternal health data into actionable clinical insights.

---

## Core Capabilities

### AI Maternal Risk Prediction
- Overall Maternal Risk
- Anemia Risk
- Hypertension Risk

### OCR Medical Report Analysis
- PDF Reports
- JPG Images
- PNG Images

Automatically extracts:
- Hemoglobin
- Blood Pressure
- Blood Sugar
- Heart Rate

### Explainable Risk Intelligence
- Clinical Risk Score
- Clinical Findings
- Confidence Score
- AI Summary
- Risk Explanations

### AI Recommendations Engine
Personalized recommendations based on detected risk indicators.

### Clinical AI Copilot
Generates:
- Clinical Summary
- Key Concerns
- Recommendations

Powered by Mistral AI.

### RAG Clinical Assistant
Uses WHO and UNICEF maternal health knowledge with ChromaDB and LangChain.

### Patient Management
- Patient Registration
- Patient Records
- Pregnancy Tracking
- Clinical History

### Village-Level Analytics
- High-risk pregnancy counts
- Anemia prevalence
- Hypertension prevalence

### Heatmap Intelligence
- Village Risk Heatmaps
- Maternal Health Clusters

### Healthcare Analytics Dashboard
- Total Patients
- High-Risk Patients
- Maternal Health Trends

---

## Current Features Checklist

✅ OCR Medical Report Upload
✅ Maternal Risk Prediction Engine
✅ Explainable Risk Scoring
✅ AI Recommendations
✅ Clinical Findings Generation
✅ AI Summary Generation
✅ Clinical Copilot
✅ RAG Clinical Assistant
✅ Patient Management
✅ Patient History
✅ Analytics Dashboard
✅ Village Analytics
✅ Heatmap Visualization
✅ Supabase Integration

---

## AI Pipeline

Medical Report
↓
OCR Extraction
↓
Structured Clinical Data
↓
XGBoost Prediction Model
↓
Clinical Rule Engine
↓
Risk Scoring
↓
Recommendations
↓
AI Dashboard

---

## AI Model

The prediction engine uses a trained MultiOutput XGBoost classifier.

Predicted outputs:

- Overall Maternal Risk
- Anemia Risk
- Hypertension Risk

The ML prediction is combined with a clinical rule engine based on:

- Hemoglobin
- Blood Pressure
- Blood Sugar
- Heart Rate

This hybrid approach improves explainability and transparency.

---

## Explainable Risk Scoring

Clinical Risk Score is calculated using:

| Indicator | Risk Condition |
|------------|---------------|
| Hemoglobin | < 11 g/dL |
| Blood Pressure | ≥ 140/90 mmHg |
| Blood Sugar | ≥ 126 mg/dL |
| Heart Rate | ≥ 100 bpm |

The score is displayed alongside AI predictions to provide clear reasoning behind the final risk classification.

---

## Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI
- **Database**: Supabase PostgreSQL
- **OCR**: Tesseract.js
- **Machine Learning**: XGBoost
- **AI Assistant**: Mistral AI
- **RAG**: LangChain + ChromaDB

---

## Project Structure

```text
NAB-Preg-AI/
│
├── frontend/                          # Next.js UI application
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Home page
│   │   ├── dashboard/                 # Risk dashboard
│   │   ├── upload/                    # Report upload & analysis
│   │   ├── alerts/                    # Alert management
│   │   ├── analytics/                 # Village-level analytics
│   │   ├── history/                   # Patient history
│   │   ├── patients/                  # Patient management
│   │   └── assistant/                 # Clinical assistant (RAG)
│   │
│   ├── components/
│   │   ├── cards/                     # RiskCard, AlertCard, StatsCard
│   │   ├── charts/                    # RiskPieChart, BPTrendChart, VillageAnalyticsChart
│   │   ├── layout/                    # DashboardLayout, Navbar, Sidebar, ThemeProvider
│   │   ├── maps/                      # VillageHeatmap
│   │   └── ui/                        # Reusable UI components
│   │
│   ├── services/
│   │   ├── api.ts                     # API base configuration
│   │   ├── prediction.service.ts      # Prediction API calls
│   │   ├── patient.service.ts         # Patient management
│   │   ├── ocr.service.ts             # OCR processing
│   │   ├── alert.service.ts           # Alert management
│   │   ├── analytics.service.ts       # Village analytics
│   │   ├── rag.service.ts             # Clinical assistant (RAG)
│   │   └── ...                        # Other services
│   │
│   ├── hooks/                         # Custom React hooks
│   ├── types/                         # TypeScript interfaces
│   ├── utils/                         # Utility functions
│   ├── styles/                        # Global styles
│   ├── public/                        # Static assets
│   └── package.json
│
├── backend/                           # FastAPI server
│   ├── app/
│   │   ├── main.py                    # App entry point
│   │   │
│   │   ├── api/
│   │   │   ├── predictions.py         # Prediction endpoints
│   │   │   └── routes/
│   │   │
│   │   ├── core/
│   │   │   ├── supabase.py            # Supabase client
│   │   │   ├── alert_storage.py       # Alert operations
│   │   │   └── village_coordinates.py # Location data
│   │   │
│   │   ├── services/
│   │   │   ├── prediction_storage.py  # Save predictions
│   │   │   ├── report_parser.py       # Parse medical reports
│   │   │   ├── ocr_report_storage.py  # OCR results storage
│   │   │   └── village_analytics_storage.py
│   │   │
│   │   ├── models/                    # Database models
│   │   └── schemas/                   # Request/response schemas
│   │
│   ├── pyproject.toml
│   └── README.md
│
├── ai_engine/                         # ML prediction pipeline
│   ├── src/
│   │   ├── predictor.py               # Main prediction logic
│   │   ├── inference.py               # Model inference
│   │   ├── preprocessing.py           # Data preprocessing
│   │   ├── risk_rules.py              # Clinical rule engine
│   │   ├── recommendation_engine.py   # Generate recommendations
│   │   └── constants.py               # Thresholds & config
│   │
│   ├── models/                        # Trained XGBoost models
│   ├── notebooks/                     # Jupyter notebooks
│   ├── prompts/                       # AI prompt templates
│   ├── report.py
│   ├── test_ai.py
│   └── __init__.py
│
├── docs/                              # Documentation
│   ├── AI_ENGINE.md                   # AI pipeline docs
│   ├── data_schema.md                 # Database schema
│   └── nabpregai_master_dataset.csv
│
├── infra/                             # Infrastructure configs
├── tests/                             # Test suite
├── requirements.txt                   # Python dependencies
├── LICENSE
└── README.md
```

---

## Getting Started

### Backend

```bash
uv run uvicorn backend.app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

## Impact

NAB Preg AI helps frontline healthcare workers identify maternal health risks early by transforming routine medical reports into actionable clinical insights.

Potential benefits:

- Early anemia detection
- Hypertension screening
- Gestational diabetes awareness
- Faster clinical triage
- Improved maternal monitoring in low-resource settings

---

## Future Roadmap

- Save predictions to Supabase
- Patient history tracking
- Village-level analytics
- Healthcare worker dashboard
- Cloud deployment

---

Built for maternal healthcare innovation and early risk detection.
