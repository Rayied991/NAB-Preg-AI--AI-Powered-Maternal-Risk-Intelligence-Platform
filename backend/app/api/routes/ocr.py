from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
import requests
import json
from backend.app.core.supabase import supabase

router = APIRouter()

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
    return json.loads(result["choices"][0]["message"]["content"])

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
