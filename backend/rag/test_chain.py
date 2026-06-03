from backend.rag.chain import ask_rag

answer = ask_rag(
    "Mother has hemoglobin 8.5. What should be done?"
)

print(answer)