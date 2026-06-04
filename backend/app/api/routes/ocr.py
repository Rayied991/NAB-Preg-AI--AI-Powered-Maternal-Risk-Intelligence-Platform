from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from backend.app.core.supabase import supabase

router = APIRouter()

class MistralOCRRequest(BaseModel):
    images: List[str]

@router.post("/mistral")
async def invoke_mistral_ocr(request: MistralOCRRequest):
    try:
        # Invoke the Supabase Edge Function from the backend
        # The python client uses invoke() to call edge functions
        response = supabase.functions.invoke(
            "mistral-ocr",
            invoke_options={"body": {"images": request.images}}
        )
        
        # response is an httpx.Response object usually, but in some versions of the SDK
        # it returns the decoded JSON dict or a custom response object.
        # Let's inspect what it returns by checking if it has a .json() method.
        # Most of the time supabase-py functions.invoke returns the raw httpx.Response
        if hasattr(response, 'json') and callable(response.json):
            data = response.json()
        elif isinstance(response, dict):
            data = response
        elif isinstance(response, bytes):
            import json
            data = json.loads(response.decode("utf-8"))
        else:
            # Fallback for unexpected types
            import json
            data = json.loads(getattr(response, 'content', response))

        return data
    except Exception as e:
        print("Error invoking mistral-ocr edge function:", e)
        raise HTTPException(status_code=500, detail=str(e))
