from flask import jsonify, request
from database import connect_db
from psycopg2.extras import RealDictCursor

def register_routes(app):
    @app.route("/")
    def home():
        return "Hello, Flask!"

    @app.route("/api/get-player-stats", methods=["GET"])
    def get_player_stats():
        player_name = request.args.get("player_name")
        if not player_name:
            return jsonify({"error": "Player name is required"}), 400

        try:
            conn = connect_db()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = "SELECT * FROM player_stats WHERE player_name = %s"
            cursor.execute(query, (player_name,))
            stats = cursor.fetchall()
            cursor.close()
            conn.close()

            if not stats:
                return jsonify({"error": f"No stats found for player {player_name}"}), 404

            return jsonify(stats)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
