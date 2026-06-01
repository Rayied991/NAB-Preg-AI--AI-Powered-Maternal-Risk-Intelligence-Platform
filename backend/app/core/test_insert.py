from backend.app.core.supabase import supabase

response = (
    supabase
    .table("predictions")
    .insert({
        "overall_risk": "LOW",
        "anemia_risk": "LOW",
        "hypertension_risk": "LOW",
        "confidence_score": 99,
        "clinical_score": 0,
        "ai_summary": "Test",
        "recommendation": "Test",
        "model_version": "test"
    })
    .execute()
)

print(response)