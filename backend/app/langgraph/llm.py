import os

from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(
    model="mistral-large-latest",
    api_key=os.getenv("MISTRAL_API_KEY"),
    temperature=0.2,
)