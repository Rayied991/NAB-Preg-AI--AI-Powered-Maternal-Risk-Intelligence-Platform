from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
import requests
import json
from backend.app.core.supabase import supabase

router = APIRouter()

def sanitize_ocr_field(field_name: str, value: any) -> str | None:
    if value is None:
        return None
    if isinstance(value, str) and value.strip().lower() in ["null", "none", "", "n/a", "unknown"]:
        return None
    
    # If the AI hallucinates an object/list instead of a string value, we try to convert it or log it
    if isinstance(value, dict):
        if field_name == "blood_pressure":
            sys = value.get("systolic", value.get("sys"))
            dia = value.get("diastolic", value.get("dia"))
            if sys is not None and dia is not None:
                return f"{sys}/{dia}"
            if "value" in value:
                return str(value["value"]).strip()
        
        print(f"WARNING: Mistral returned unparseable format for specific field '{field_name}'. Expected string/number, got {type(value).__name__}.")
        return None

    if isinstance(value, list):
        print(f"WARNING: Mistral returned unparseable format for specific field '{field_name}'. Expected string/number, got {type(value).__name__}.")
        return None
        
    return str(value).strip()

class OCRResultData(BaseModel):
    hemoglobin: str | None = None
    blood_pressure: str | None = None
    blood_sugar: str | None = None
    heart_rate: str | None = None
    raw_text: str | None = None

def call_mistral_api_direct(api_key: str, images: list[str]) -> dict:
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    content = [
        {
            "type": "text",
            "text": "Extract the following from this clinical report image and return strictly a JSON object with these exact keys: hemoglobin, blood_pressure, blood_sugar, heart_rate, raw_text. If a value is not found, use null. Format the response strictly as JSON without markdown wrappers."
        }
    ]
    
    for img in images:
        content.append({
            "type": "image_url",
            "image_url": {"url": img}
        })
        
    payload = {
        "model": "pixtral-12b-2409",
        "messages": [
            {
                "role": "user",
                "content": content
            }
        ],
        "response_format": {"type": "json_object"}
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=45)
    response.raise_for_status()
    
    result = response.json()
    try:
        raw_data = json.loads(result["choices"][0]["message"]["content"])
        if not isinstance(raw_data, dict):
            raw_data = {}
    except Exception as e:
        print(f"WARNING: Failed to parse Mistral JSON output entirely: {e}")
        raw_data = {}

    sanitized_data = {
        "hemoglobin": sanitize_ocr_field("hemoglobin", raw_data.get("hemoglobin")),
        "blood_pressure": sanitize_ocr_field("blood_pressure", raw_data.get("blood_pressure")),
        "blood_sugar": sanitize_ocr_field("blood_sugar", raw_data.get("blood_sugar")),
        "heart_rate": sanitize_ocr_field("heart_rate", raw_data.get("heart_rate")),
        "raw_text": sanitize_ocr_field("raw_text", raw_data.get("raw_text")),
    }
    
    validated_data = OCRResultData(**sanitized_data)
    return validated_data.dict()

class MistralOCRRequest(BaseModel):
    images: List[str]

@router.post("/mistral")
async def invoke_mistral_ocr(request: MistralOCRRequest):
    # Priorities: Try keys in order from .env directly, bypassing Supabase Edge Functions
    fallback_keys = [
        os.getenv("MISTRAL_API_KEY"),
        os.getenv("MISTRAL_NABPREG_KEY"),
        os.getenv("MISTRAL2_API_KEY")
    ]
    
    last_error = None
    for idx, key in enumerate(fallback_keys):
        if not key or not key.strip():
            continue
        try:
            print(f"Attempting direct Mistral API fallback (Priority {idx+1})...")
            return call_mistral_api_direct(key, request.images)
        except Exception as e:
            print(f"Fallback {idx+1} failed: {e}")
            last_error = e
            
    print("All Mistral fallbacks failed. Delegating to Tesseract.")
    raise HTTPException(status_code=500, detail="All Mistral OCR attempts failed. Falling back to local Tesseract.")
