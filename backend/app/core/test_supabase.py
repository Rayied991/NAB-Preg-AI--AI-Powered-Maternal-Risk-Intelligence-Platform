from backend.app.core.supabase import supabase

print("Connected to Supabase!")

response = (
    supabase
    .table("patients")
    .select("*")
    .limit(1)
    .execute()
)

print(response.data)