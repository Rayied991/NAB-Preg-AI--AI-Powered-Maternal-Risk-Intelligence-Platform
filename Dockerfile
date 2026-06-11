FROM python:3.11-slim

# Install essential system-level components
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# FIX: Copy the requirements.txt from the absolute root instead of the backend folder
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy your application directories into the container workspace
COPY ./backend /code/backend
COPY ./ai_engine /code/ai_engine

# Set the Python path so uvicorn resolves "backend.app.main:app" cleanly
ENV PYTHONPATH="${PYTHONPATH}:/code"

# Expose the mandatory Hugging Face default port
EXPOSE 7860

# Run uvicorn mapped exactly to your local initialization targets
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "7860"]