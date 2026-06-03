# backend/rag/test_mistral.py

from backend.rag.chain import ask_rag

print(
    ask_rag(
        "What causes anemia during pregnancy?"
    )
)