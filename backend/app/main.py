from fastapi import FastAPI

app = FastAPI(
    title="NAB Preg AI",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "message": "NAB Preg AI Backend Running"
    }