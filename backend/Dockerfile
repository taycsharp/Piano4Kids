FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DEFAULT_TIMEOUT=300
ENV PIP_RETRIES=10
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_PROGRESS_BAR=off

COPY requirements.txt .

# Use plain uvicorn instead of uvicorn[standard] to avoid extra large optional wheels
# such as uvloop/watchfiles during slow or unstable internet builds.
RUN python -m pip install \
    --no-cache-dir \
    --retries 20 \
    --timeout 300 \
    --progress-bar off \
    --prefer-binary \
    -r requirements.txt

COPY app ./app
COPY media ./media

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
