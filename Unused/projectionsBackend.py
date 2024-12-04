import numpy as np
from sklearn.linear_model import LinearRegression
from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
from supabase import create_client

# Supabase credentials
SUPABASE_URL = "https://xrstrludepuahpovxpzb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc3RybHVkZXB1YWhwb3Z4cHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NjA5OTcsImV4cCI6MjA0NzEzNjk5N30.zi3dWGxLif4__7tSOn2-r2nS1wZI_SLBUpHGMpKMznI"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)

def connect_db():
    """Connect to PostgreSQL."""
    return psycopg2.connect(
        host="aws-0-us-west-1.pooler.supabase.com",
        port=6543,
        dbname="postgres",
        user="postgres.xrstrludepuahpovxpzb",
        password="AZ1d3Tab7my1TubG",
    )

def fetch_recent_stats(player_name):
    """Fetch recent stats for the player."""
    conn = connect_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("""
        SELECT *
        FROM recent_player_stats
        WHERE player_name = %s
        ORDER BY week ASC
    """, (player_name,))
    data = cursor.fetchall()
    conn.close()
    return data

def train_regression_model(recent_stats, stat_key):
    """Train a linear regression model."""
    if len(recent_stats) < 2:
        return None  # Not enough data to train a model

    x = np.array([stat["week"] for stat in recent_stats]).reshape(-1, 1)  # Weeks
    y = np.array([stat[stat_key] for stat in recent_stats]).reshape(-1, 1)  # Stat values

    model = LinearRegression()
    model.fit(x, y)
    return model

def predict_next_game_stats(player_name):
    """Generate predictions using regression."""
    recent_stats = fetch_recent_stats(player_name)
    if not recent_stats:
        return {}

    stat_keys = ["passing_yards", "rushing_yards", "receiving_yards"]  # Example keys
    predictions = {}

    for stat_key in stat_keys:
        model = train_regression_model(recent_stats, stat_key)
        if model:
            next_week = max(stat["week"] for stat in recent_stats) + 1
            predictions[stat_key] = float(model.predict([[next_week]])[0][0])
        else:
            predictions[stat_key] = np.mean([stat[stat_key] for stat in recent_stats if stat[stat_key] is not None])

    return predictions

@app.route("/generateProjections", methods=["GET"])
def generate_projections():
    """Combine regression predictions with defensive stats."""
    player_name = request.args.get("player")
    defense_team = request.args.get("defense")

    if not player_name or not defense_team:
        return jsonify({"error": "Missing player name or defense team."}), 400

    # Fetch player averages
    player_avg = supabase.table("player_averages").select("*").eq("player_name", player_name).single().execute()
    if not player_avg.get("data"):
        return jsonify({"error": f"No player data found for {player_name}."}), 404

    player_avg = player_avg["data"]

    # Fetch specific defense stats
    defense_table = "defense_averages_qb" if player_avg["position_id"] == "QB" else "defense_averages"
    defense_stats = supabase.table(defense_table).select("*").eq("team_id", defense_team).execute()
    if not defense_stats.get("data"):
        return jsonify({"error": f"No defensive stats found for {defense_team}."}), 404

    defense_stats = defense_stats["data"][0]

    print("Defensive Stats fetched:", defense_stats)
    print("Player Averages fetched:", player_avg)

    # Regression-based projections
    regression_predictions = predict_next_game_stats(player_name)

    # Adjust projections using defense stats
    projections = {}
    for stat, value in regression_predictions.items():
        defense_adjustment = defense_stats.get(f"avg_{stat}")
        league_average = supabase.table("all_defense_averages").select(f"avg_{stat}").execute().get("data", [{}])[0].get(f"avg_{stat}")
        if defense_adjustment and league_average:
            print(True)
            projections[stat] = value * (defense_adjustment / league_average)
        else:
            projections[stat] = value

    return jsonify(projections)

if __name__ == "__main__":
    app.run(debug=True)
