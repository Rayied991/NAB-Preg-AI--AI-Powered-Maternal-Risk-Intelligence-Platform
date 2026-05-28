from fastapi import APIRouter
from pydantic import BaseModel

from ai_engine.src.predictor import (
    predict_maternal_risk,
)
router = APIRouter()


class PredictionRequest(BaseModel):
    age: int
    hemoglobin: float
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float
    heart_rate: float
    weight: float
    height_cm: float
    meals_per_day: int
    veg_freq: int


@router.post("/predict")
async def predict(payload: PredictionRequest):

    result = predict_maternal_risk(
        payload.dict()
    )

    return result
