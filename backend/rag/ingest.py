from langchain_community.document_loaders import PyPDFLoader

from langchain_text_splitters import (
    RecursiveCharacterTextSplitter
)

from langchain_community.vectorstores import Chroma

from langchain_huggingface import (
    HuggingFaceEmbeddings
)

from dotenv import load_dotenv
import os

load_dotenv()

HF_ACCESS_TOKEN = os.getenv(
    "HF_ACCESS_TOKEN"
)

print(
    "HF TOKEN FOUND:",
    HF_ACCESS_TOKEN is not None
)

print("Loading PDFs...")
PDFS = [
    "backend/knowledge/WHO_Maternal_Health.pdf",
    "backend/knowledge/WHO_Anemia_Guidelines.pdf",
    "backend/knowledge/UNICEF_Nutrition_Guidance.pdf",
    "backend/knowledge/UNICEF_Nutrition_Counceling.pdf",
]

documents = []
for pdf in PDFS:

    loader = PyPDFLoader(pdf)

    documents.extend(
        loader.load()
    )

print(f"Loaded {len(documents)} pages")
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)

chunks = splitter.split_documents(
    documents
)
print(f"Created {len(chunks)} chunks")

print("Generating embeddings...")
embedding_model = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={
        "token": HF_ACCESS_TOKEN
    }
)
print("Saving to ChromaDB...")
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embedding_model,
    persist_directory="backend/chroma_db"
)

print(
    f"Stored {len(chunks)} chunks"
)
print("Done!")