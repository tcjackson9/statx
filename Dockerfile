FROM python:3.10-slim

WORKDIR /app

COPY main.py /app/
COPY routes.py /app/
COPY database.py /app/

# Install dependencies, including Gunicorn
RUN pip install --no-cache-dir flask flask-cors psycopg2-binary gunicorn

EXPOSE 8000

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:8000", "main:app"]
