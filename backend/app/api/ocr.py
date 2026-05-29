from fastapi import APIRouter, UploadFile, File
from PIL import Image
import pytesseract

from backend.app.services.report_parser import (
    parse_medical_report
)

from ai_engine.src.predictor import (
    predict_maternal_risk
)

pytesseract.pytesseract.tesseract_cmd = (
    r"D:\ocr\tesseract.exe"
)


router = APIRouter()


@router.post("/ocr")
async def extract_text(
    file: UploadFile = File(...)
):
    image = Image.open(file.file)

    extracted_text = pytesseract.image_to_string(
        image
    )

    parsed_data = parse_medical_report(
        extracted_text
    )

    # Default values for missing fields
    parsed_data.setdefault("heart_rate", 80)
    parsed_data.setdefault("weight", 65)
    parsed_data.setdefault("height_cm", 160)
    parsed_data.setdefault("blood_sugar", 110)
    parsed_data.setdefault("meals_per_day", 3)
    parsed_data.setdefault("veg_freq", 2)

    prediction = predict_maternal_risk(
        parsed_data
    )

    return {
        "extracted_text": extracted_text,
        "parsed_data": parsed_data,
        "prediction": prediction
    }