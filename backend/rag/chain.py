

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
    print("\nRETRIEVED DOCUMENTS:")
    for i, doc in enumerate(docs):
        print(f"\n--- DOC {i+1} ---")
        print(doc.page_content[:1000])

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

    return response.content