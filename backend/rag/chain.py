from langchain_mistralai import ChatMistralAI

from backend.rag.retriever import (
    retrieve_documents
)

from dotenv import load_dotenv

import os

load_dotenv()

print(
    "Mistral API key found:",
    os.getenv("MISTRAL_API_KEY") is not None
)

llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0
)


def ask_rag(question: str):

    docs = retrieve_documents(
        question
    )

    context = "\n\n".join(
        [
            doc["content"]
            for doc in docs
        ]
    )

    prompt = f"""
Answer ONLY from the provided context.

If the answer is not in the context,
say:
"I could not find this information in the knowledge base."

Context:
{context}

Question:
{question}
"""

    sources = list(
        set(
            [
                doc["source"]
                for doc in docs
            ]
        )
    )

    try:

        response = llm.invoke(
            prompt
        )

        return {
            "answer": response.content,
            "sources": sources,
        }

    except Exception as e:

        print(
            "RAG ERROR:",
            e
        )

        return {
            "answer":
                "AI service temporarily unavailable.",
            "sources": sources,
        }