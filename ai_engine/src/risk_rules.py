from ai_engine.src.constants import (
    MEDIUM_HB_THRESHOLD,
    HIGH_SYS_BP,
    HIGH_DIA_BP,
    HIGH_BS,
    HIGH_HR
)
def generate_risk_reason(data):
    reasons = []

    if data["hemoglobin"] < MEDIUM_HB_THRESHOLD:
        reasons.append(
        "Hemoglobin below normal range indicates anemia risk."
    )

    if data["systolic_bp"] >= HIGH_SYS_BP:
        reasons.append(
        "High systolic blood pressure detected."
    )

    if data["diastolic_bp"] >= HIGH_DIA_BP:
        reasons.append(
        "High diastolic blood pressure detected."
    )

    if data["heart_rate"] >= HIGH_HR:
        reasons.append(
        "Elevated heart rate detected."
    )

    if data["blood_sugar"] >= HIGH_BS:
        reasons.append(
        "Elevated blood sugar level detected."
    )

    return reasons