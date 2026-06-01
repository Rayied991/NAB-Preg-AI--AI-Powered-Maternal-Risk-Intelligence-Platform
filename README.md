# NAB Preg AI — AI-Powered Maternal Risk Intelligence Platform

> Predicting pregnancy risks before they become emergencies.

## Overview

NAB Preg AI is an AI-powered maternal healthcare platform that combines OCR, machine learning, and clinical rules to identify pregnancy-related health risks from medical reports.

The platform extracts clinical values from uploaded reports, analyzes maternal health indicators, predicts risk levels, and provides explainable recommendations for healthcare workers and patients.

---

## Current Features

✅ Upload PDF, JPG, and PNG medical reports

✅ OCR extraction using Tesseract.js

✅ Automatic extraction of:
- Hemoglobin
- Blood Pressure
- Blood Sugar
- Heart Rate

✅ AI-powered maternal risk prediction

✅ Multi-output XGBoost prediction model

✅ Clinical rule-based risk scoring

✅ Explainable AI recommendations

✅ Clinical findings generation

✅ Confidence scoring

✅ Modern healthcare dashboard UI

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

## Tech Stack

| Layer | Technologies |
|---------|-------------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| OCR | Tesseract.js |
| Backend | FastAPI, Python |
| AI Model | XGBoost MultiOutput Classifier |
| Database | Supabase PostgreSQL |
| Charts | Recharts |

---

## Project Structure

```text
NAB-Preg-AI/
├── frontend/
│   ├── app/
│   ├── components/
│   └── services/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── services/
│   │   └── main.py
│
├── ai_engine/
│   ├── models/
│   └── src/
│
└── docs/
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
