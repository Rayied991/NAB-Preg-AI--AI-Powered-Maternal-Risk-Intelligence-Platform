from ai_engine.src.predictor import (
    predict_maternal_risk
)

sample_payload = {
    "age": 29,
    "hemoglobin": 8.2,
    "systolic_bp": 150,
    "diastolic_bp": 95,
    "blood_sugar": 132,
    "heart_rate": 110,
    "weight": 65,
    "height_cm": 160,
    "meals_per_day": 2,
    "veg_freq": 1,
}

result = predict_maternal_risk(sample_payload)

print(result)
