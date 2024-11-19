from flask import Flask
from flask_cors import CORS  # Import CORS
from routes import register_routes

app = Flask(__name__)

# Enable CORS
CORS(app)  # Adjust origins for more security if needed.

# Register routes
register_routes(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)


