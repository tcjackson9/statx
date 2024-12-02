import requests
from bs4 import BeautifulSoup
import psycopg2
from psycopg2.extras import execute_values

# Supabase connection details
DB_HOST = "aws-0-us-west-1.pooler.supabase.com"
DB_PORT = 6543
DB_NAME = "postgres"
DB_USER = "postgres.xrstrludepuahpovxpzb"
DB_PASSWORD = "AZ1d3Tab7my1TubG"
API_KEY = "255dc66ae2e34b158e2f27d5bda13a26"  # SportsDataIO API Key

position_map = {"WR": "WR", "QB": "QB", "RB": "RB", "TE": "TE"}

def connect_db():
    """Establish a connection to the database."""
    try:
        return psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        raise

def scrape_stats(week, position):
    """Scrape stats for a given week and position."""
    url = f"https://www.cbssports.com/nfl/stats/leaders/live/{position}/{week}/"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to fetch data for Week {week}, Position {position}")
        return []
    
    soup = BeautifulSoup(response.content, "html.parser")
    rows = soup.select(".TableBase-bodyTr")
    player_data = []

    for row in rows:
        columns = row.find_all("td")
        if len(columns) < 3:  # Skip rows with insufficient data
            continue
        
        player_name = columns[0].select_one(".CellPlayerName--long a").text.strip()
        matchup = columns[1].text.strip()
        fpts = int(columns[2].text.strip()) if columns[2].text.strip().isdigit() else 0

        # Initialize data structure
        player_stats = {
            "player_name": player_name,
            "position_id": position,
            "week": week,
            "matchup": matchup,
            "fpts": fpts,
            "completions": 0,
            "passing_attempts": 0,
            "passing_yards": 0,
            "passing_tds": 0,
            "interceptions": 0,
            "rushing_attempts": 0,
            "rushing_yards": 0,
            "rushing_tds": 0,
            "receptions": 0,
            "receiving_yards": 0,
            "receiving_tds": 0,
            "targets": 0,
            "snaps": None,
            "team_id": None,
            "opponent": None
        }
        player_data.append(player_stats)
    
    return player_data

def fetch_player_stats(season, week):
    """Fetch player stats from the SportsDataIO API."""
    url = f"https://api.sportsdata.io/v3/nfl/stats/json/PlayerGameStatsByWeek/{season}/{week}"
    headers = {"Ocp-Apim-Subscription-Key": API_KEY}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error fetching data: {response.status_code}, {response.text}")
        return []
    
    return response.json()

def update_with_api_data(player_data, api_data, team_mapping):
    """Update player_data with snaps, team_id, and opponent from API."""
    for player in player_data:
        api_player = next((p for p in api_data if p['Name'] == player['player_name']), None)
        if api_player:
            player['snaps'] = api_player.get('Played', 0)
            player['team_id'] = team_mapping.get(api_player.get('Team'))
            player['opponent'] = api_player.get('Opponent')
    return player_data

def upload_to_database(player_data):
    """Upload scraped data to the Supabase database."""
    conn = connect_db()
    cursor = conn.cursor()

    query = """
    INSERT INTO player_stats (
        player_name, position_id, team_id, week, matchup, fpts,
        completions, passing_attempts, passing_yards, passing_tds, interceptions,
        rushing_attempts, rushing_yards, rushing_tds, receptions, receiving_yards, receiving_tds,
        targets, snaps, opponent
    ) VALUES %s
    ON CONFLICT (player_name, team_id, week) DO UPDATE SET
        matchup = EXCLUDED.matchup,
        fpts = EXCLUDED.fpts,
        completions = EXCLUDED.completions,
        passing_attempts = EXCLUDED.passing_attempts,
        passing_yards = EXCLUDED.passing_yards,
        passing_tds = EXCLUDED.passing_tds,
        interceptions = EXCLUDED.interceptions,
        rushing_attempts = EXCLUDED.rushing_attempts,
        rushing_yards = EXCLUDED.rushing_yards,
        rushing_tds = EXCLUDED.rushing_tds,
        receptions = EXCLUDED.receptions,
        receiving_yards = EXCLUDED.receiving_yards,
        receiving_tds = EXCLUDED.receiving_tds,
        targets = EXCLUDED.targets,
        snaps = EXCLUDED.snaps,
        opponent = EXCLUDED.opponent;
    """

    values = [
        (
            p['player_name'], p['position_id'], p['team_id'], p['week'], p['matchup'], p['fpts'],
            p['completions'], p['passing_attempts'], p['passing_yards'], p['passing_tds'], p['interceptions'],
            p['rushing_attempts'], p['rushing_yards'], p['rushing_tds'], p['receptions'], p['receiving_yards'], p['receiving_tds'],
            p['targets'], p['snaps'], p['opponent']
        )
        for p in player_data if p['team_id']
    ]

    execute_values(cursor, query, values)
    conn.commit()
    cursor.close()
    conn.close()

def main():
    season = "2024REG"  # Current season
    total_weeks = 18  # Adjust based on NFL season length

    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute("SELECT team_id, abbreviation FROM teams;")
    team_mapping = {row[1]: row[0] for row in cursor.fetchall()}
    cursor.close()
    conn.close()

    for week in range(1, total_weeks + 1):
        for position, position_code in position_map.items():
            print(f"Scraping Week {week}, Position {position}")
            scraped_data = scrape_stats(week, position_code)
            api_data = fetch_player_stats(season, week)
            merged_data = update_with_api_data(scraped_data, api_data, team_mapping)
            upload_to_database(merged_data)
            print(f"Uploaded data for Week {week}, Position {position}")

if __name__ == "__main__":
    main()
