import pandas as pd

def preprocess_input(data: dict):
    """
    Convert patient payload into
    model-compatible dataframe.
    """

    height_m = data["height_cm"] / 100

    bmi = data["weight"] / (height_m ** 2)

    processed = {
        "age": data["age"],
        "systolic_bp": data["systolic_bp"],
        "diastolic_bp": data["diastolic_bp"],
        "blood_sugar": data["blood_sugar"],
        "hemoglobin": data["hemoglobin"],
        "bmi": bmi,
        "meals_per_day": data["meals_per_day"],
        "veg_freq": data["veg_freq"],
    }

    columns_order = [
        "age",
        "systolic_bp",
        "diastolic_bp",
        "blood_sugar",
        "hemoglobin",
        "bmi",
        "meals_per_day",
        "veg_freq",
    ]

    return pd.DataFrame(
        [processed],
        columns=columns_order
    )