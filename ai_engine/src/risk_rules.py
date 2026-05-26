def generate_risk_reason(data):
    reasons = []

    if data["hemoglobin"] < 9:
        reasons.append(
            "Low hemoglobin indicates severe anemia risk."
        )

    if data["systolic_bp"] > 140:
        reasons.append(
            "High systolic blood pressure detected."
        )

    if data["heart_rate"] > 100:
        reasons.append(
            "Elevated heart rate detected."
        )

    return reasons