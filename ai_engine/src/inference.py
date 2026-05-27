import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "nabpregai_unified_model.pkl"

model = joblib.load(MODEL_PATH)

def run_prediction(dataframe):
    prediction = model.predict(dataframe)
    probability = model.predict_proba(dataframe)

    return prediction, probability