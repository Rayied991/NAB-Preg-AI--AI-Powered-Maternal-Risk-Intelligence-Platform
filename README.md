# NAB Preg AI — AI-Powered Maternal Risk Intelligence Platform

> Predicting pregnancy risks before they become emergencies.

NAB Preg AI is an AI-powered maternal healthcare platform that uses OCR-extracted medical reports, health data, and AI analytics to enable early detection of anemia, hypertension, and other pregnancy complications — built for underserved and rural communities where continuous maternal care is out of reach.

---

## The Problem

Pregnant women in rural and underserved communities often lack access to continuous maternal healthcare. Limited medical infrastructure, delayed diagnoses, and irregular monitoring mean conditions like anemia, hypertension, and other complications frequently go undetected — leading to preventable maternal emergencies.

---

## What It Does

- **OCR Report Upload** — Upload JPG, PNG, or PDF medical reports; the system automatically extracts hemoglobin, blood pressure, blood sugar, heart rate, and other vitals
- **AI Risk Prediction** — Real-time maternal risk scoring (HIGH / MEDIUM / LOW) with confidence scores powered by XGBoost
- **Clinical Findings** — Automated rule-based clinical reasoning flags abnormal values with explanations
- **AI Recommendations** — Structured, actionable healthcare recommendations generated per patient
- **AI Summary** — Plain-language risk summaries for healthcare workers
- **Interactive Dashboard** — Modern analytics dashboard built with Next.js and Recharts
- **Supabase Integration** — Cloud PostgreSQL storage for patients, alerts, predictions, and reports

---

## AI Engine Features

- Maternal risk prediction using XGBoost MultiOutputClassifier
- Confidence scoring system
- AI-generated healthcare recommendations
- Rule-based clinical reasoning
- Risk explanation engine
- Structured AI reporting

---

## Full Request Flow

```
Frontend Upload Page
        ↓
OCR Extraction (Tesseract / PIL)
        ↓
prediction.service.ts
        ↓
FastAPI /api/predict
        ↓
AI Engine
        ↓
XGBoost MultiOutput Model
        ↓
Rule Engine → Reasons + Recommendations
        ↓
Frontend receives:
  • overall_risk (HIGH / MEDIUM / LOW)
  • confidence_score
  • ai_recommendations[]
  • ai_summary
  • clinical_findings[]
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python, FastAPI, PostgreSQL, Redis |
| **AI Engine** | XGBoost, RAG pipeline, multi-agent system |
| **OCR** | Tesseract, PIL, automated extraction from medical reports |
| **Frontend** | Next.js, TypeScript, Tailwind CSS |
| **Database** | Supabase PostgreSQL |
| **Charts & Visualization** | Recharts |

---

## Project Structure

```
nab-preg-ai/
├── backend/              # FastAPI app — auth, patients, predictions, alerts, OCR
│   ├── app/
│   │   ├── api/          # Route handlers (auth, patients, predictions, analytics, alerts, ocr)
│   │   ├── core/         # Config, database, security, Redis
│   │   ├── models/       # ORM models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── main.py
│   └── requirements.txt
│
├── ai_engine/            # ML models, agents, RAG, and prompts
│   ├── models/           # Trained model artifacts
│   ├── src/              # Inference, preprocessing, anomaly detection, embeddings
│   ├── agents/           # Nutrition, alert, risk explainer, village analytics agents
│   ├── rag/              # Retrieval pipeline, vector store, chunking, knowledge base
│   └── prompts/          # Prompt templates (nutrition, alerts, summarization, multilingual)
│
├── frontend/             # Next.js dashboard
│   └── app/
│       ├── dashboard/
│       ├── analytics/
│       ├── alerts/
│       ├── patients/
│       └── upload/       # OCR upload + AI prediction result page
│
├── tests/                # API, AI, OCR, frontend, and integration tests
├── scripts/              # Seed data, load embeddings, bootstrap
└── docs/                 # Architecture, API contracts, data schema, deployment guides
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- [`uv`](https://github.com/astral-sh/uv) (Python package manager)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/nab-preg-ai.git
cd nab-preg-ai
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Fill in your credentials and config values
```

### 3. Backend Setup

```bash
cd backend

# Activate virtual environment
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
uv pip install -r requirements.txt

# Start the server
uv run uvicorn app.main:app --reload
```

API available at `http://localhost:8000`.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Dashboard available at `http://localhost:3000`.

### 5. AI Engine Setup

```bash
cd ai_engine

# Create and activate virtual environment
uv venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
uv pip install -r requirements.txt
```

---

## AI Agents

| Agent | Role |
|---|---|
| `nutrition_agent` | Personalized dietary recommendations based on patient data |
| `alert_agent` | Real-time risk escalation and healthcare worker notifications |
| `risk_explainer_agent` | Plain-language explanations of predicted risks |
| `village_analytics_agent` | Community-level health trend analysis |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/predict` | Submit patient data, receive full risk prediction |
| `POST` | `/api/ocr` | Upload medical report image, extract vitals |
| `GET` | `/api/patients` | List all patients |
| `GET` | `/api/alerts` | Fetch active risk alerts |
| `GET` | `/api/analytics` | Aggregate health analytics |

Full endpoint reference: [`docs/api_contracts.md`](docs/api_contracts.md)

---

## Documentation

All detailed documentation lives in the `/docs` folder:

- [`data_schema.md`](docs/data_schema.md) — Database and data models
- [`ai_architecture.md`](docs/ai_architecture.md) — AI/ML system design
- [`api_contracts.md`](docs/api_contracts.md) — API endpoint reference
- [`offline_sync_flow.md`](docs/offline_sync_flow.md) — Offline-first sync design
- [`system_design.md`](docs/system_design.md) — Overall system architecture
- [`deployment.md`](docs/deployment.md) — Deployment guide

---

## Running Tests

```bash
# All tests
pytest tests/

# Specific suites
pytest tests/api/
pytest tests/ai/
pytest tests/ocr/
pytest tests/integration/
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

## Acknowledgements

- **WHO & UNICEF** — for publicly available maternal health guidelines and datasets that informed our risk models
- **Open-source community** — [XGBoost](https://github.com/dmlc/xgboost), [FastAPI](https://fastapi.tiangolo.com/), [Next.js](https://nextjs.org/), and [LangChain](https://github.com/langchain-ai/langchain) for the foundational tools powering this platform
- **Healthcare workers in rural communities** — whose challenges inspired this project and whose feedback continues to shape it

---

*Built to reduce preventable maternal deaths through accessible AI-powered healthcare.*