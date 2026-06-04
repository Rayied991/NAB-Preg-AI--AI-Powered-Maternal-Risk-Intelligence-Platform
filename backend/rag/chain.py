from langchain_mistralai import ChatMistralAI
from backend.rag.retriever import retriever

from dotenv import load_dotenv
import os

load_dotenv()

llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0
)

def ask_rag(question: str):
    """Query the RAG system and return a clean answer with sources."""
    docs = retriever.invoke(question)
  
    context = "\n\n".join(
        [doc.page_content for doc in docs]
    )

    prompt = f"""You are a maternal healthcare clinical assistant.

Context from WHO/UNICEF guidelines:
{context}

Question: {question}

Provide a clear, concise answer using markdown formatting."""

    sources = list(
        set(
            [
                doc.metadata.get("source", "Unknown")
                for doc in docs
            ]
        )
    )

    try:
        response = llm.invoke(prompt)
        return {
            "answer": response.content.strip(),
            "sources": sources,
        }
    except Exception as e:
        import logging
        logging.error(f"RAG Error: {e}")
        return {
            "answer": "Unable to process your question. Please try again.",
            "sources": [],
        }