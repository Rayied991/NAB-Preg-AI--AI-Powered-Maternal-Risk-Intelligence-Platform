from fastapi import FastAPI

from backend.app.api.predictions import (
    router as prediction_router
)

app = FastAPI(
    title="NAB Preg AI API"
)

app.include_router(
    prediction_router,
    prefix="/api"
)


@app.get("/")
def root():
    return {
        "message": "NAB Preg AI Backend Running"
    }