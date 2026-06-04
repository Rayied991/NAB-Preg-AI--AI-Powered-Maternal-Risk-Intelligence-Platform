from backend.rag.retriever import (
    retriever
)

docs = retriever.invoke(
    "What causes anemia during pregnancy?"
)

for doc in docs:
    print(doc.page_content)
    print("=" * 80)