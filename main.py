from flask import Flask
from routes import register_routes

app = Flask(__name__)

# Register routes
register_routes(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
