from langchain_mistralai import ChatMistralAI
from backend.rag.retriever import retrieve_documents
from dotenv import load_dotenv
import os

load_dotenv()

print("Mistral API key found:", os.getenv("MISTRAL_API_KEY") is not None)

# Limit output length to save tokens
llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0.3,
    max_tokens=800
)

def is_clinical_question(question: str) -> bool:
    """Check if question is related to maternal/clinical health"""
    q = question.lower()
    
    clinical_keywords = [
        "pregnancy", "pregnant", "prenatal", "antenatal", "maternal", "fetus", "fetal",
        "labor", "delivery", "childbirth", "postpartum", "gestational",
        "anemia", "hypertension", "diabetes", "preeclampsia", "eclampsia", 
        "hemorrhage", "bleeding", "infection", "fever", "seizure",
        "blood pressure", "hemoglobin", "hb", "blood sugar", "glucose", 
        "heart rate", "pulse", "temperature", "weight", "bmi",
        "headache", "nausea", "vomiting", "swelling", "edema", "pain", 
        "cramping", "contraction", "dizziness", "fatigue", "shortness of breath",
        "medication", "treatment", "supplement", "iron", "folic acid", 
        "vitamin", "vaccine", "antibiotic", "therapy",
        "diet", "nutrition", "food", "eating", "calorie", "protein", 
        "iron-rich", "dietary",
        "test", "screening", "ultrasound", "scan", "blood test", "urine test",
        "risk", "danger", "safe", "warning", "complication", "emergency",
        "newborn", "infant", "baby", "breastfeeding", "lactation", "neonatal",
        "doctor", "hospital", "clinic", "healthcare", "medical", "clinical",
        "patient", "symptom", "diagnosis", "prognosis",
        "weeks", "trimester", "gestation", "fetus", "baby", "contraction",
        "magnesium", "labetalol", "hydralazine", "corticosteroid",
        "hellp", "seizure", "eclampsia", "abruption", "placenta"
    ]
    
    return any(keyword in q for keyword in clinical_keywords)

def is_clinical_vignette(question: str) -> bool:
    """Detect if question is a clinical scenario/vignette"""
    q = question.lower()
    
    vignette_indicators = [
        "presents with", "presenting with", "comes in with",
        "patient with", "woman with", "pregnant woman",
        "weeks gestation", "weeks pregnant",
        "bp of", "blood pressure of",
        "what is the likely diagnosis",
        "what should be done",
        "management of", "treatment for",
        "32-week", "28-week", "36-week",
        "primigravida", "multigravida"
    ]
    
    return any(indicator in q for indicator in vignette_indicators)

def ask_rag(question: str):
    # Check if question is clinical
    if not is_clinical_question(question):
        print(f"⚠️ Non-clinical question blocked: {question}")
        return {
            "answer": """I'm a maternal health assistant and can only answer questions related to:

**What I can help with:**
- Pregnancy care (prenatal, labor, delivery, postpartum)
- Maternal health conditions (anemia, hypertension, diabetes, etc.)
- Clinical symptoms and warning signs
- Nutrition and supplements during pregnancy
- Medications and treatments
- Fetal development and monitoring
- Newborn care and breastfeeding

Please ask a question related to maternal or child health.""",
            "sources": []
        }
    
    # Detect if this is a clinical vignette
    is_vignette = is_clinical_vignette(question)
    
    # Retrieve documents
    docs = retrieve_documents(question, k=8)
    
    # Truncate context
    context = "\n\n".join([doc["content"] for doc in docs])
    if len(context) > 4000:
        context = context[:4000] + "\n\n[Context truncated for brevity]"
    
    # Intelligent prompt based on question type
    if is_vignette:
        prompt = f"""You are an expert maternal-fetal medicine specialist.

CLINICAL GUIDELINES CONTEXT:
{context}

CLINICAL SCENARIO:
{question}

INSTRUCTIONS:
1. **DIAGNOSIS FIRST**: State the MOST LIKELY DIAGNOSIS immediately
2. **SEVERITY**: Classify severity (mild/moderate/severe/critical)
3. **IMMEDIATE ACTIONS**: List critical interventions in order of priority
4. **MONITORING**: What parameters to monitor closely
5. **DEFINITIVE TREATMENT**: What is the ultimate treatment

Use standard obstetric protocols (ACOG, WHO guidelines).
Be concise but clinically precise.
Use bullet points.

CLINICAL ASSESSMENT:"""
    else:
        prompt = f"""You are a maternal health clinical assistant.

CLINICAL GUIDELINES:
{context}

QUESTION: {question}

INSTRUCTIONS:
- Provide evidence-based clinical information
- Use specific values, thresholds, and criteria from guidelines
- Be concise (under 200 words)
- Use bullet points for clarity
- Include WHO/ACOG recommendations when relevant

ANSWER:"""

    sources = list(set([doc["source"] for doc in docs]))
    
    print(f"\n📚 Retrieved {len(docs)} docs | Vignette: {is_vignette} | Context: {len(context)} chars")

    try:
        response = llm.invoke(prompt)
        answer = response.content
        
        # Check if model is being unhelpful
        if any(phrase in answer.lower() for phrase in [
            "could not find",
            "not in the context",
            "not mentioned"
        ]):
            print("⚠️ Using fallback...")
            answer = generate_fallback_answer(question)
        
        return {"answer": answer, "sources": sources}
        
    except Exception as e:
        print("RAG ERROR:", e)
        return {"answer": generate_fallback_answer(question), "sources": sources}

def generate_fallback_answer(question: str) -> str:
    """Comprehensive fallback answers with clinical reasoning"""
    q = question.lower()
    
    # Pre-eclampsia vignette
    if ("pre-eclampsia" in q or "preeclampsia" in q) and ("bp" in q or "blood pressure" in q or "headache" in q):
        return """## 🚨 Pre-eclampsia with Severe Features

**Most Likely Diagnosis:** Pre-eclampsia with severe features

**Immediate Actions:**
- Admit to labor & delivery unit
- **Magnesium sulfate** 4-6g IV load, then 2g/hr (seizure prophylaxis)
- Antihypertensives if BP ≥160/110:
  - Labetalol 20mg IV q10min (max 300mg)
  - OR Hydralazine 5mg IV q20min
  - OR Nifedipine 10mg PO
- Continuous fetal monitoring

**Severe Features to Monitor:**
- BP ≥160/110 mmHg
- Platelets <100,000/μL
- Elevated liver enzymes (2x normal)
- Creatinine >1.1 mg/dL
- Pulmonary edema
- Visual/cerebral disturbances

**Next Steps:**
- Labs: CBC, LFTs, creatinine, urine protein
- Corticosteroids (betamethasone 12mg IM x2) if <34 weeks
- **Definitive treatment: Delivery** after stabilization

**Warning:** Risk of eclampsia, HELLP syndrome, placental abruption"""

    # Iron/Anemia
    if "iron" in q or "dietary" in q or "anemia" in q:
        return """## Iron & Anemia Guidance

**Iron-Rich Foods:**
- Heme: Lean meat, poultry, fish
- Non-heme: Lentils, spinach, fortified cereals, tofu

**Boost Absorption:**
- ✅ Take with Vitamin C (citrus, tomatoes)
- ❌ Avoid tea/coffee 1hr before iron

**Daily Needs:**
- Pregnant: 27 mg/day
- Non-pregnant women: 18 mg/day

**Anemia Risk Levels (WHO):**
- Mild: 10-10.9 g/dL
- Moderate: 7-9.9 g/dL ⚠️
- Severe: <7 g/dL 🚨

**Treatment:**
- Oral iron 60-120 mg/day
- IV iron if Hb <9 g/dL
- Transfusion if Hb <7 g/dL with symptoms"""

    # Hemoglobin ranges
    elif "hemoglobin" in q or "normal range" in q:
        return """## Hemoglobin Ranges

**Pregnancy:**
- Normal: ≥11.0 g/dL
- Mild anemia: 10-10.9 g/dL
- Moderate: 7-9.9 g/dL
- Severe: <7 g/dL

**Non-pregnant women:**
- Normal: ≥12.0 g/dL
- Anemia: <12.0 g/dL

**When to worry:**
- <9 g/dL = High risk
- <7 g/dL = Critical (transfusion likely needed)

**Testing:**
- CBC at first prenatal visit
- Repeat at 28 weeks
- More frequent if anemic"""

    # Blood pressure/hypertension
    elif "blood pressure" in q or "hypertension" in q:
        return """## Blood Pressure in Pregnancy

**Normal:** <140/90 mmHg

**Categories:**
- Normal: <120/80
- Elevated: 120-129/<80
- Stage 1: 130-139/80-89
- Stage 2: ≥140/90
- Crisis: ≥160/110 🚨

**Gestational Hypertension:**
- BP ≥140/90 after 20 weeks
- No proteinuria

**Chronic Hypertension:**
- BP ≥140/90 before pregnancy or <20 weeks

**Management:**
- Monitor BP twice daily
- Medications: Labetalol, Nifedipine, Methyldopa
- Avoid: ACE inhibitors, ARBs
- Deliver at 37-39 weeks if controlled"""

    # Nutrition
    elif "nutrition" in q or "diet" in q or "prenatal" in q:
        return """## Prenatal Nutrition

**Key Supplements:**
- Folic acid: 400-800 mcg/day
- Iron: 27 mg/day
- Calcium: 1,000 mg/day
- Vitamin D: 600 IU/day
- DHA: 200-300 mg/day

**Daily Needs:**
- Protein: 75-100g
- Extra calories: +340 (2nd tri), +450 (3rd tri)

**Foods to Eat:**
- Leafy greens, lean proteins
- Whole grains, dairy
- Fruits, nuts, legumes

**Foods to Avoid:**
- Raw fish/meat, high-mercury fish
- Unpasteurized dairy
- Excess caffeine (<200mg/day)
- Alcohol (zero tolerance)"""

    # Diabetes
    elif "diabetes" in q or "glucose" in q or "blood sugar" in q:
        return """## Gestational Diabetes

**Screening:**
- 24-28 weeks for all pregnant women
- Earlier if high risk (obesity, family history, previous GDM)

**Diagnostic Values:**
- Fasting: ≥92 mg/dL
- 1-hour: ≥180 mg/dL
- 2-hour: ≥153 mg/dL

**Management:**
- Diet: Low glycemic index foods
- Exercise: 30 min moderate activity daily
- Monitor glucose 4x/day
- Target: Fasting <95, 1hr post-meal <140

**Medications if needed:**
- Insulin (first-line)
- Metformin (alternative)

**Risks if uncontrolled:**
- Macrosomia (large baby)
- Birth complications
- Neonatal hypoglycemia"""

    # General
    else:
        return """## General Guidance

**Prenatal Care:**
- 8+ visits throughout pregnancy
- Monitor BP, weight, fetal growth at each visit

**Warning Signs (seek care immediately):**
- Vaginal bleeding
- Severe headache/vision changes
- Fever >38°C
- Severe abdominal pain
- Decreased fetal movement
- Fluid leakage before 37 weeks

**Screening Schedule:**
- 1st trimester: Blood work, HIV, hepatitis
- 24-28 weeks: Gestational diabetes test
- 35-37 weeks: Group B strep

For specific concerns, please consult your healthcare provider."""