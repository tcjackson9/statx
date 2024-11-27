import psycopg2
from psycopg2.extras import execute_values

# Supabase connection details
SUPABASE_HOST = "aws-0-us-west-1.pooler.supabase.com"
SUPABASE_PORT = 6543
SUPABASE_DB = "postgres"
SUPABASE_USER = "postgres.xrstrludepuahpovxpzb"
SUPABASE_PASSWORD = "AZ1d3Tab7my1TubG"

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

# Fetch player stats for the last 3 weeks and calculate averages
def fetch_and_calculate_recent_averages():
    """Fetch player stats for the last 3 weeks and calculate averages."""
    conn = connect_db()
    cursor = conn.cursor()

    # Determine the most recent 3 weeks
     # Query to calculate averages for the last 3 weeks a player participated
    query = """
    WITH ranked_stats AS (
        SELECT 
            player_name,
            position_id,
            team_id,
            week,
            ROW_NUMBER() OVER (PARTITION BY player_name ORDER BY week DESC) AS week_rank
        FROM player_stats
        WHERE snaps = 1
    )
    SELECT 
        player_name,
        position_id,
        team_id,
        AVG(passing_attempts) AS avg_passing_attempts,
        AVG(completions) AS avg_completions,
        AVG(passing_yards) AS avg_passing_yards,
        AVG(passing_tds) AS avg_passing_tds,
        AVG(interceptions) AS avg_interceptions,
        AVG(rushing_attempts) AS avg_rushing_attempts,
        AVG(rushing_yards) AS avg_rushing_yards,
        AVG(rushing_tds) AS avg_rushing_tds,
        AVG(receptions) AS avg_receptions,
        AVG(receiving_yards) AS avg_receiving_yards,
        AVG(receiving_tds) AS avg_receiving_tds,
        AVG(snaps) AS avg_snaps
    FROM ranked_stats
    WHERE week_rank <= 3
    GROUP BY player_name, position_id, team_id;
    """

    cursor.execute(query)
    raw_averages = cursor.fetchall()
    cursor.close()
    conn.close()

    # Process the data to replace None with default values
    averages = []
    for row in raw_averages:
        processed_row = tuple(
            value if value is not None else ("N/A" if isinstance(value, str) else 0)
            for value in row
        )
        averages.append(processed_row)
    
    return averages

# Insert recent player averages into a new table
def insert_recent_player_averages(averages):
    """Insert calculated averages into the recent_player_averages table."""
    if not averages:
        print("No data to insert.")
        return

    conn = connect_db()
    cursor = conn.cursor()

    # Clear out old data
    cursor.execute("DELETE FROM recent_player_averages;")

    query = """
    INSERT INTO recent_player_averages (
        player_name, position_id, team_id, avg_passing_attempts, avg_completions, avg_passing_yards,
        avg_passing_tds, avg_interceptions, avg_rushing_attempts, avg_rushing_yards,
        avg_rushing_tds, avg_receptions, avg_receiving_yards, avg_receiving_tds, avg_snaps
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """

    for row in averages:
        if len(row) != 15:  # Ensure the row has the correct number of elements
            print(f"Skipping invalid row (expected 15 elements, got {len(row)}): {row}")
            continue

        try:
            cursor.execute(query, row)
        except psycopg2.Error as e:
            print(f"Error inserting row for player {row[0]}: {e}")
    
    conn.commit()
    cursor.close()
    conn.close()

# Main function to fetch and insert player averages
def main():
    try:
        print("Fetching player stats for the last 3 weeks...")
        recent_player_averages = fetch_and_calculate_recent_averages()

        print("Inserting recent player averages into the database...")
        insert_recent_player_averages(recent_player_averages)

        print("Recent player averages successfully inserted/updated.")
    except Exception as e:
        print(f"Error: {e}")

# Run the script
if __name__ == "__main__":
    main()
