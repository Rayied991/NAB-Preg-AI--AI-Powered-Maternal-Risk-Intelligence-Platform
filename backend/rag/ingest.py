from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings

from supabase import create_client

from dotenv import load_dotenv

import uuid
import os

load_dotenv()

SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL"
)

SUPABASE_KEY = os.getenv(
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"
)

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
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

    pages = loader.load()

    pages = pages[8:]

    documents.extend(pages)

print(
    f"Loaded {len(documents)} pages"
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)

chunks = splitter.split_documents(
    documents
)

filtered_chunks = []

for chunk in chunks:

    text = chunk.page_content.lower()

    if any(
        bad in text
        for bad in [
            "copyright",
            "published by",
            "permission is required",
            "all rights reserved",
            "isbn",
            "acknowledgements",
        ]
    ):
        continue

    filtered_chunks.append(chunk)

chunks = filtered_chunks

print(
    f"Created {len(chunks)} chunks"
)

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Generating embeddings...")

rows = []

for chunk in chunks:

    embedding = embedding_model.embed_query(
        chunk.page_content
    )

    rows.append(
        {
            "id": str(uuid.uuid4()),
            "content": chunk.page_content,
            "source": chunk.metadata.get(
                "source",
                "Unknown"
            ),
            "embedding": embedding,
        }
    )

print(
    f"Inserting {len(rows)} rows..."
)

batch_size = 100

for i in range(
    0,
    len(rows),
    batch_size
):

    supabase.table(
        "healthcare_embeddings"
    ).insert(
        rows[i:i+batch_size]
    ).execute()

print("Done!")