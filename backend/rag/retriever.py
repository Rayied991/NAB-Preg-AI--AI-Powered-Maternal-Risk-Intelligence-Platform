from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectorstore = Chroma(
    persist_directory="backend/chroma_db",
    embedding_function=embedding_model,
)

print(
    "Document count:",
    vectorstore._collection.count()
)

retriever = vectorstore.as_retriever(
    search_kwargs={"k": 10}
)