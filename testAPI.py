import requests
import psycopg2
from psycopg2.extras import execute_values

# Supabase connection details
SUPABASE_HOST = "aws-0-us-west-1.pooler.supabase.com"
SUPABASE_PORT = 6543
SUPABASE_DB = "postgres"
SUPABASE_USER = "postgres.xrstrludepuahpovxpzb"
SUPABASE_PASSWORD = "AZ1d3Tab7my1TubG"
API_KEY = "255dc66ae2e34b158e2f27d5bda13a26"  # Replace with your SportsDataIO API Key

# Connect to Supabase database
def connect_db():
    try:
        return psycopg2.connect(
            host=SUPABASE_HOST,
            port=SUPABASE_PORT,
            dbname=SUPABASE_DB,
            user=SUPABASE_USER,
            password=SUPABASE_PASSWORD,
            sslmode="require"
        )
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

# Fetch team mapping from the database
def get_team_mapping():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT team_id, abbreviation FROM teams;")
    team_mapping = {row[1]: row[0] for row in cursor.fetchall()}  # Map abbreviation to team_id
    cursor.close()
    conn.close()
    return team_mapping

# Fetch position validation from the database
def get_valid_positions():
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT position_id FROM positions;")
    valid_positions = [row[0] for row in cursor.fetchall()]  # List of valid position IDs
    cursor.close()
    conn.close()
    return valid_positions

# Fetch player stats from the SportsDataIO API
def fetch_player_stats(season, week):
    url = f"https://api.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsByWeek/{season}/{week}"
    headers = {"Ocp-Apim-Subscription-Key": API_KEY}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Error fetching data: {response.status_code}, {response.text}")

    return response.json()

# Insert player stats into the database
def insert_player_stats(player_stats, team_mapping):
    conn = connect_db()
    cursor = conn.cursor()

    # Fetch existing position_ids for players
    cursor.execute("SELECT player_name, position_id FROM player_stats;")
    existing_positions = {row[0]: row[1] for row in cursor.fetchall()}

    query = """
    INSERT INTO player_stats (
        player_name, position_id, team_id, week, snaps, opponent
    ) VALUES %s
    ON CONFLICT (player_name, team_id, week) DO UPDATE SET
        snaps = EXCLUDED.snaps,
        opponent = EXCLUDED.opponent;
    """

    values = []
    for player in player_stats:
        team_id = team_mapping.get(player.get('Team'))
        if team_id:
            position_id = existing_positions.get(player.get('Name'))  # Fetch existing position_id
            if position_id is None:
                print(f"Warning: Missing position_id for {player.get('Name')}. Skipping this player.")
                continue

            values.append((
                player.get('Name'), position_id, team_id, player.get('Week'),
                player.get('Played'), player.get('Opponent')
            ))

    if values:
        execute_values(cursor, query, values)
        conn.commit()
        print(f"Inserted or updated {len(values)} rows in player_stats.")
    else:
        print("No valid data to insert or update.")

    cursor.close()
    conn.close()


# Main function to fetch and insert player stats
def main():
    season = "2024REG"  # Current season
    total_weeks = 18  # Adjust this based on the NFL season length

    try:
        print("Fetching team and position mappings...")
        team_mapping = get_team_mapping()
        valid_positions = get_valid_positions()

        for week in range(1, total_weeks + 1):  # Loop through all weeks
            print(f"Fetching player stats for Week {week}...")
            player_stats = fetch_player_stats(season, week)

            print(f"Processing and inserting data for {len(player_stats)} players in Week {week}...")
            insert_player_stats(player_stats, team_mapping)

        print("Player stats for all weeks successfully inserted into the database.")

    except Exception as e:
        print(f"Error: {e}")

# Run the script
if __name__ == "__main__":
    main()

