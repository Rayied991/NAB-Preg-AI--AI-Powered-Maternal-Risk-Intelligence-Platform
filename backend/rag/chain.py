

from langchain_google_genai import ChatGoogleGenerativeAI
from backend.rag.retriever import retriever

from dotenv import load_dotenv
import os

load_dotenv()

print(
    "Gemini key found:",
    os.getenv("GEMINI_API_KEY") is not None
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash"
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

    response = llm.invoke(
        prompt
    )

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

    return {
        "answer": response.content,
        "sources": sources,
    }