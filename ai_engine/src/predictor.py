from src.preprocessing import preprocess_input
from src.inference import run_prediction
from src.risk_rules import generate_risk_reason
from src.recommendation_engine import (
    generate_recommendation
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

    final_confidence = max(confidence_scores)

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

    anemia_risk = risk_mapping.get(
        int(predictions[1]),
        "UNKNOWN"
    )

    hypertension_risk = risk_mapping.get(
        int(predictions[2]),
        "UNKNOWN"
    )

    summary = f"""
    Patient shows {overall_risk.lower()} maternal health risk.
    Potential anemia and hypertension indicators detected.
    Immediate monitoring and nutritional intervention recommended.
    """

    return {
        "patient_status": {
            "overall_risk": overall_risk,
            "anemia_risk": anemia_risk,
            "hypertension_risk": hypertension_risk,
            "confidence_score": round(
                final_confidence * 100,
                2
            ),
        },

        "clinical_findings": reasons,

        "ai_recommendations": recommendations,

        "ai_summary": summary.strip()
    }