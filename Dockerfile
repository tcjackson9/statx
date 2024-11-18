FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy application files
COPY main.py /app/main.py

# Install dependencies
RUN pip install --no-cache-dir flask
RUN pip install --no-cache-dir mysql-connector-python
RUN pip install --no-cache-dir uvicorn
RUN pip install --no-cache-dir fastapi

# Expose the application port
EXPOSE 8000

# Command to run the app
CMD ["python", "main.py"]
