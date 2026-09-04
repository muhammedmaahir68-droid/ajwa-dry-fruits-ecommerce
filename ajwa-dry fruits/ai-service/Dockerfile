# ==============================================================================
# Ajwa AI Commerce - AI & ML Microservice Dockerfile
# Python 3.12 / 3.14 slim container for FastAPI, scikit-learn & Pandas
# ==============================================================================

FROM python:3.12-slim

WORKDIR /app

# Install build dependencies if needed for scientific packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy microservice code
COPY . .

ENV PORT=5001
ENV PYTHONUNBUFFERED=1

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:5001/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5001"]
