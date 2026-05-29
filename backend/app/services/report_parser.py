import re


def parse_medical_report(text: str):

    extracted = {}

    # =========================
    # HEMOGLOBIN
    # =========================

    hemoglobin_match = re.search(
        r"(\d+\.?\d*)\s*g\/dl",
        text,
        re.IGNORECASE
    )

    if hemoglobin_match:
        extracted["hemoglobin"] = float(
            hemoglobin_match.group(1)
        )

    # =========================
    # BLOOD PRESSURE
    # =========================

    bp_match = re.search(
        r"(\d{2,3})\s*mmHg\/(\d{2,3})",
        text,
        re.IGNORECASE
    )

    if bp_match:
        extracted["systolic_bp"] = int(
            bp_match.group(1)
        )

        extracted["diastolic_bp"] = int(
            bp_match.group(2)
        )

    # =========================
    # AGE
    # =========================

    age_match = re.search(
        r"Age[:\s]+(\d+)",
        text,
        re.IGNORECASE
    )

    if age_match:
        extracted["age"] = int(
            age_match.group(1)
        )

    return extracted