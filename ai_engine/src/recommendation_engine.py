def generate_recommendation(data):
    recommendations = []

    if data["hemoglobin"] < 9:
        recommendations.append(
            "Increase iron-rich foods and consult a doctor."
        )

    if data["systolic_bp"] > 140:
        recommendations.append(
            "Immediate blood pressure monitoring recommended."
        )

    return recommendations