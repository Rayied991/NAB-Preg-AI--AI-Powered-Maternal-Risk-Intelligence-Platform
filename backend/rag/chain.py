from langchain_mistralai import ChatMistralAI
from backend.rag.retriever import retriever

from dotenv import load_dotenv
import os

load_dotenv()

print(
    "Gemini key found:",
    os.getenv("GEMINI_API_KEY") is not None
)

llm= ChatMistralAI(
    model="mistral-small-latest",
    temperature=0
)

def ask_rag(question: str):

    docs = retriever.invoke(
        question
    )
  
    context = "\n\n".join(
        [doc.page_content for doc in docs]
    )

    prompt = f"""
Answer ONLY from the provided context.

Context:
{context}

Question:
{question}
"""

    sources = list(
    set(
        [
            doc.metadata.get(
                "source",
                "Unknown"
            )
            for doc in docs
        ]
    )
)

    try:
        response = llm.invoke(prompt)

        return {
            "answer": response.content,
            "sources": sources,
        }

    except Exception as e:
        print("RAG ERROR:", e)

        return {
            "answer": (
                "AI service temporarily unavailable. "
                "Please try again later."
            ),
            "sources": sources,
        }