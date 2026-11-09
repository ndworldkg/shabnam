FROM python:3.11-slim
WORKDIR /app
COPY requirements-vps.txt .
RUN pip install --no-cache-dir -r requirements-vps.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--proxy-headers", "--forwarded-allow-ips", "*"]
