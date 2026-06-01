from ai_engine.src.constants import (
    HIGH_HB_THRESHOLD,
    MEDIUM_HB_THRESHOLD,
    HIGH_SYS_BP,
    HIGH_DIA_BP,
    SEVERE_SYS_BP,
    SEVERE_DIA_BP,
    HIGH_BS,
    HIGH_HR
)
def generate_recommendation(data):
    recommendations = []

    # Anemia
    if data["hemoglobin"] < MEDIUM_HB_THRESHOLD:
        recommendations.append(
            "Increase iron-rich foods such as spinach, lentils, eggs, and lean meat."
        )

        recommendations.append(
            "Consider iron supplementation under medical supervision."
        )

    if data["hemoglobin"] < HIGH_HB_THRESHOLD:
        recommendations.append(
            "Urgent evaluation for severe anemia is recommended."
        )

    # Hypertension
    if (
        data["systolic_bp"] >= HIGH_SYS_BP
        or data["diastolic_bp"] >= HIGH_DIA_BP
    ):
        recommendations.append(
            "Monitor blood pressure regularly and consult a healthcare provider."
        )

        recommendations.append(
            "Reduce salt intake and maintain adequate hydration."
        )

    if (
        data["systolic_bp"] >= SEVERE_SYS_BP
        or data["diastolic_bp"] >= SEVERE_DIA_BP
    ):
        recommendations.append(
            "Immediate medical review is required due to severe hypertension."
        )

    # Blood Sugar
    if data["blood_sugar"] >= HIGH_BS:
        recommendations.append(
            "Limit sugary foods and monitor blood glucose levels regularly."
        )

        recommendations.append(
            "Seek screening for gestational diabetes if not already performed."
        )

    # Heart Rate
    if data["heart_rate"] >= HIGH_HR:
        recommendations.append(
            "Ensure adequate rest, hydration, and follow-up if elevated heart rate persists."
        )

    if not recommendations:
        recommendations.append(
            "Continue routine prenatal care and maintain a balanced diet."
        )

    return recommendations