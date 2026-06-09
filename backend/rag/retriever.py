from langchain_huggingface import HuggingFaceEmbeddings
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={
        "token": os.getenv("HF_ACCESS_TOKEN")
    }
)

def retrieve_documents(query: str, k: int = 15):  # Increased default to 15
    """
    Retrieve documents using semantic similarity search
    """
    query_embedding = embedding_model.embed_query(query)
    
    result = supabase.rpc(
        "match_healthcare_embeddings",
        {
            "query_embedding": query_embedding,
            "match_count": k,
        }
    ).execute()
    
    print(f"\n🔍 Retrieval query: {query}")
    print(f"📊 Found {len(result.data)} documents\n")
    
    return result.data