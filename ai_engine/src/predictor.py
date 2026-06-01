from ai_engine.src.preprocessing import preprocess_input
from ai_engine.src.inference import run_prediction
from ai_engine.src.risk_rules import generate_risk_reason
from backend.app.core.alert_storage import create_alert
from ai_engine.src.recommendation_engine import generate_recommendation
from ai_engine.src.constants import (
    MEDIUM_HB_THRESHOLD,
    HIGH_SYS_BP,
    HIGH_HB_THRESHOLD,
    SEVERE_SYS_BP,
    SEVERE_DIA_BP,
    HIGH_DIA_BP,
    HIGH_BS,
    HIGH_HR
)

def predict_maternal_risk(payload):

 
    processed = preprocess_input(payload)
    


    prediction, probability = run_prediction(processed)
    


    reasons = generate_risk_reason(payload)

    recommendations = generate_recommendation(payload)

    confidence_scores = []

    for prob in probability:
        confidence_scores.append(
            float(max(prob[0]))
        )

    final_confidence = (sum(confidence_scores)/ len(confidence_scores))

    risk_mapping = {
        0: "LOW",
        1: "MEDIUM",
        2: "HIGH",
    }

    predictions = prediction[0]

    overall_risk = risk_mapping.get(
        int(predictions[0]),
        "UNKNOWN"
    )
    risk_points = 0

    # Anemia
    if payload["hemoglobin"] < HIGH_HB_THRESHOLD:
        risk_points += 3

    elif payload["hemoglobin"] < MEDIUM_HB_THRESHOLD:
        risk_points += 1

    # Hypertension
    if (
        payload["systolic_bp"] >= SEVERE_SYS_BP
        or payload["diastolic_bp"] >= SEVERE_DIA_BP
    ):
        risk_points += 3

    elif (
        payload["systolic_bp"] >= HIGH_SYS_BP
        or payload["diastolic_bp"] >= HIGH_DIA_BP
    ):
        risk_points += 1

    # Blood Sugar
    if payload["blood_sugar"] >= HIGH_BS:
        risk_points += 1    

    # Heart Rate
    if payload["heart_rate"] >= HIGH_HR:
        risk_points += 1

    # Final Clinical Risk
    if risk_points >= 4:
        overall_risk = "HIGH"

    elif risk_points >= 2:
        overall_risk = "MEDIUM"

    else:
        overall_risk = "LOW"
    if overall_risk == "HIGH":
     create_alert(
        severity="HIGH",
        alert_message="HIGH RISK MATERNAL CASE DETECTED",
        status="OPEN"
    )    

    anemia_risk = risk_mapping.get(
        int(predictions[1]),
        "UNKNOWN"
    )

    hypertension_risk = risk_mapping.get(
        int(predictions[2]),
        "UNKNOWN"
    )

    summary_parts = []

    if overall_risk == "HIGH":
        summary_parts.append(
            "Patient presents multiple high-risk maternal indicators."
        )

    elif overall_risk == "MEDIUM":
        summary_parts.append(
            "Patient presents moderate maternal health concerns."
        )

    else:
        summary_parts.append(
            "Patient presents low maternal health risk."
        )

    if payload["hemoglobin"] < MEDIUM_HB_THRESHOLD:
        summary_parts.append(
            "Anemia indicators detected."
        )

    if (
        payload["systolic_bp"] >= HIGH_SYS_BP
        or payload["diastolic_bp"] >= HIGH_DIA_BP
    ):
        summary_parts.append(
            "Hypertension indicators detected."
        )

    if payload["blood_sugar"] >= HIGH_BS:
        summary_parts.append(
            "Elevated blood glucose detected."
        )
    if payload["heart_rate"] >= HIGH_HR:
        summary_parts.append(
        "Elevated heart rate detected."
    )    

    summary = " ".join(summary_parts) 
    return {
        "patient_status": {
            "overall_risk": overall_risk,
            "anemia_risk": anemia_risk,
            "hypertension_risk": hypertension_risk,
            "confidence_score": round(
                final_confidence * 100,
                2
            ),
            "clinical_score": risk_points,
        },

        "clinical_findings": reasons,

        "ai_recommendations": recommendations,

        "ai_summary": summary.strip()
    }