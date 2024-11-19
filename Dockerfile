FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy application files
COPY main.py /app/main.py

# Install dependencies
RUN pip install --no-cache-dir flask gunicorn

# Expose the application port
EXPOSE 8000

# Use Gunicorn to serve the Flask app
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "main:app"]
