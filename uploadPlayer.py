import requests
from bs4 import BeautifulSoup
import psycopg2

# Supabase connection details
DB_HOST = "aws-0-us-west-1.pooler.supabase.com"
DB_PORT = 6543
DB_NAME = "postgres"
DB_USER = "postgres.xrstrludepuahpovxpzb"
DB_PASSWORD = "AZ1d3Tab7my1TubG"

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
        fpts = int(columns[2].text.strip()) if columns[2].text.strip().isdigit() else None

        # Initialize data structure
        player_stats = {
            "player_name": player_name,
            "position_id": position,
            "week": week,
            "matchup": matchup,
            "fpts": fpts,
            "completions": None,
            "passing_attempts": None,
            "passing_yards": None,
            "passing_tds": None,
            "interceptions": None,
            "rushing_attempts": None,
            "rushing_yards": None,
            "rushing_tds": None,
            "receptions": None,
            "receiving_yards": None,
            "receiving_tds": None,
            "targets": None
        }

        if position == "QB":
            player_stats["completions"] = int(columns[3].text.strip()) if len(columns) > 3 and columns[3].text.strip().isdigit() else 0
            player_stats["passing_attempts"] = int(columns[4].text.strip()) if len(columns) > 4 and columns[4].text.strip().isdigit() else 0
            player_stats["passing_yards"] = int(columns[5].text.strip()) if len(columns) > 5 and columns[5].text.strip().isdigit() else 0
            player_stats["passing_tds"] = int(columns[6].text.strip()) if len(columns) > 6 and columns[6].text.strip().isdigit() else 0
            player_stats["interceptions"] = int(columns[7].text.strip()) if len(columns) > 7 and columns[7].text.strip().isdigit() else 0
            player_stats["rushing_attempts"] = int(columns[8].text.strip()) if len(columns) > 8 and columns[8].text.strip().isdigit() else 0
            player_stats["rushing_yards"] = int(columns[9].text.strip()) if len(columns) > 9 and columns[9].text.strip().isdigit() else 0
            player_stats["rushing_tds"] = int(columns[10].text.strip()) if len(columns) > 10 and columns[10].text.strip().isdigit() else 0

        elif position in ["WR", "TE"]:
            player_stats["receptions"] = int(columns[3].text.strip()) if len(columns) > 3 and columns[3].text.strip().isdigit() else 0
            player_stats["receiving_yards"] = int(columns[4].text.strip()) if len(columns) > 4 and columns[4].text.strip().isdigit() else 0
            player_stats["targets"] = int(columns[5].text.strip()) if len(columns) > 5 and columns[5].text.strip().isdigit() else 0
            player_stats["receiving_tds"] = int(columns[6].text.strip()) if len(columns) > 6 and columns[6].text.strip().isdigit() else 0
            player_stats["rushing_attempts"] = int(columns[7].text.strip()) if len(columns) > 7 and columns[7].text.strip().isdigit() else 0
            player_stats["rushing_yards"] = int(columns[8].text.strip()) if len(columns) > 8 and columns[8].text.strip().isdigit() else 0
            player_stats["rushing_tds"] = int(columns[9].text.strip()) if len(columns) > 9 and columns[9].text.strip().isdigit() else 0

        elif position == "RB":
            player_stats["rushing_attempts"] = int(columns[3].text.strip()) if len(columns) > 3 and columns[3].text.strip().isdigit() else 0
            player_stats["rushing_yards"] = int(columns[4].text.strip()) if len(columns) > 4 and columns[4].text.strip().isdigit() else 0
            player_stats["rushing_tds"] = int(columns[5].text.strip()) if len(columns) > 5 and columns[5].text.strip().isdigit() else 0
            player_stats["receptions"] = int(columns[6].text.strip()) if len(columns) > 6 and columns[6].text.strip().isdigit() else 0
            player_stats["receiving_yards"] = int(columns[7].text.strip()) if len(columns) > 7 and columns[7].text.strip().isdigit() else 0
            player_stats["targets"] = int(columns[8].text.strip()) if len(columns) > 8 and columns[8].text.strip().isdigit() else 0
            player_stats["receiving_tds"] = int(columns[9].text.strip()) if len(columns) > 9 and columns[9].text.strip().isdigit() else 0

        player_data.append(player_stats)
    
    return player_data

def upload_to_database(player_data):
    """Upload scraped data to the Supabase database."""
    connection = connect_db()
    cursor = connection.cursor()
    
    insert_query = """
    INSERT INTO player_stats (
        player_name, position_id, week, matchup, fpts,
        completions, passing_attempts, passing_yards, passing_tds, interceptions,
        rushing_attempts, rushing_yards, rushing_tds,
        receptions, receiving_yards, receiving_tds, targets
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    for player in player_data:
        try:
            cursor.execute(insert_query, (
                player["player_name"], player["position_id"], player["week"], player["matchup"], player["fpts"],
                player["completions"], player["passing_attempts"], player["passing_yards"], player["passing_tds"], player["interceptions"],
                player["rushing_attempts"], player["rushing_yards"], player["rushing_tds"],
                player["receptions"], player["receiving_yards"], player["receiving_tds"], player["targets"]
            ))
        except Exception as e:
            print(f"Error inserting data for {player['player_name']}: {e}")
            connection.rollback()
            continue
    
    connection.commit()
    cursor.close()
    connection.close()

def main():
    for week in range(1, 14):  # Weeks 1 to 13
        for position, position_code in position_map.items():
            print(f"Scraping Week {week}, Position {position}")
            player_data = scrape_stats(week, position_code)
            if player_data:
                upload_to_database(player_data)
                print(f"Uploaded data for Week {week}, Position {position}")
            else:
                print(f"No data found for Week {week}, Position {position}")

if __name__ == "__main__":
    main()
