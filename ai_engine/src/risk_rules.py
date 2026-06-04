from ai_engine.src.constants import (
    HIGH_HB_THRESHOLD,
    MEDIUM_HB_THRESHOLD,
    HIGH_SYS_BP,
    HIGH_DIA_BP,
    HIGH_BS,
    HIGH_HR
)
def generate_risk_reason(data):
    reasons = []

    hb=data["hemoglobin"]
    
    if hb < HIGH_HB_THRESHOLD:
        reasons.append(
            f"Severe anemia detected (Hemoglobin {hb} g/dL)."
    )
    elif hb <  10:
        reasons.append(
            f"Moderate anemia detected (Hemoglobin {hb} g/dL)."
        )
            
    elif hb < MEDIUM_HB_THRESHOLD:
        reasons.append(
             f"Mild Anemia detected (Hemoglobin {hb} g/dL)."
        )    

    if (data["systolic_bp"] >= HIGH_SYS_BP or data["diastolic_bp"] >= HIGH_DIA_BP):
        reasons.append(
        f"Hypertension detected ({data['systolic_bp']}/{data['diastolic_bp']} mmHg)."
    )


    if data["heart_rate"] >= HIGH_HR:
        reasons.append(
        f"Elevated heart rate detected ({data['heart_rate']} bpm)."
    )

    if data["blood_sugar"] >= HIGH_BS:
        reasons.append(
        f"Elevated blood sugar detected ({data['blood_sugar']} mg/dL)."
    )

    return reasons