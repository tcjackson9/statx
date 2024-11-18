import pymysql
import requests
from bs4 import BeautifulSoup

# Database connection details
db_config = {
    "host": "playerstatsdbsql.mysql.database.azure.com",
    "user": "alex",
    "password": "Rendypoo1"
}

# List of NFL teams and their abbreviations
teams = [
    "SF", "CHI", "CIN", "BUF", "DEN", "CLE", "TB", "ARI", "LAC", "KC", 
    "IND", "WAS", "DAL", "MIA", "PHI", "ATL", "NYG", "JAC", "NYJ", "DET", 
    "GB", "CAR", "NE", "LV", "LAR", "BAL", "NO", "SEA", "PIT", "HOU", "TEN", "MIN"
]

# List of positions
positions = ["QB", "WR", "TE", "RB"]

# Function to connect to the database for a specific position
def connect_to_db(position):
    database = f"defense{position}Stats"
    connection = pymysql.connect(
        host=db_config["host"],
        user=db_config["user"],
        password=db_config["password"],
        database=database
    )
    return connection

# Function to create the table if it doesn't exist
def create_table(cursor, position, team_abbreviation):
    table_name = f"{team_abbreviation.lower()}_{position.lower()}_stats"
     # Check if the position is QB and set the table schema accordingly
    if position == "QB":
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            week VARCHAR(5),
            matchup VARCHAR(50),
            passing_attempts INT,
            completions INT,
            total_passing_yards INT,
            passing_touchdowns INT,
            interceptions INT,
            rushing_attempts INT,
            rushing_yards INT,
            avg_yards_per_carry FLOAT,
            rushing_touchdowns INT
        )
        """
    else:
        # For non-QB positions, keep the original schema
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            week VARCHAR(5),
            matchup VARCHAR(50),
            rushing_attempts INT,
            total_rushing_yards INT,
            avg_yards_per_carry FLOAT,
            rushing_tds INT,
            targets INT,
            receptions INT,
            total_receiving_yards INT,
            avg_yards_per_catch FLOAT,
            receiving_tds INT
        )
        """
    
    cursor.execute(create_table_query)

# Function to fetch and scrape team data
def scrape_team_data(team_abbreviation, position):
    url = f'https://www.cbssports.com/fantasy/football/stats/posvsdef/{position}/{team_abbreviation}/teambreakdown/standard'
    
    try:
        # Send a request to the website
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad responses

        # Parse the page content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the relevant table rows with team data
        rows = soup.select('.row1, .row2, .average-row')  # Adjust selector as necessary
        
        # List to hold data for insertion
        data_to_insert = []

        for row in rows:
            cells = row.find_all('td')
            if len(cells) > 1:
                # Extract the week and team matchup, which are common across all positions
                week = cells[0].text.strip()
                matchup = cells[1].text.strip()

                # Skip the Season row (look for "All Quarterbacks vs 49ers" or similar)
                if 'All Quarterbacks' in matchup:
                    continue

                # Check if the week is either a valid week number or "Avg"
                if not (week.isdigit() or week == "Avg"):
                    continue  # Skip rows that don't have a valid week number or "Avg"

                # Check if the row is an "Average" row by looking for decimal points
                is_average_row = '.' in cells[2].text.strip()

                # Define different parsing based on the position type
                if position == "QB":
                    # Extract QB-specific data columns
                    att = int(cells[2].text.strip()) if not is_average_row else float(cells[2].text.strip())
                    cmp = int(cells[3].text.strip()) if not is_average_row else float(cells[3].text.strip())
                    yards = int(cells[4].text.strip()) if not is_average_row else float(cells[4].text.strip())
                    td = int(cells[5].text.strip()) if not is_average_row else float(cells[5].text.strip())
                    interceptions = int(cells[6].text.strip()) if not is_average_row else float(cells[6].text.strip())
                    rush_att = int(cells[8].text.strip()) if not is_average_row else float(cells[8].text.strip())
                    rush_yards = int(cells[9].text.strip()) if not is_average_row else float(cells[9].text.strip())
                    rush_avg = float(cells[10].text.strip())
                    rush_td = int(cells[11].text.strip()) if not is_average_row else float(cells[11].text.strip())

                    data_to_insert.append((
                        team_abbreviation, week, matchup, att, cmp, yards, td, interceptions, 
                        rush_att, rush_yards, rush_avg, rush_td
                    ))

                elif position in ["WR", "TE", "RB"]:
                    # Extract WR, TE, RB-specific data columns
                    rush_att = int(cells[2].text.strip()) if not is_average_row else float(cells[2].text.strip())
                    rush_yards = int(cells[3].text.strip()) if not is_average_row else float(cells[3].text.strip())
                    rush_avg = float(cells[4].text.strip())
                    rush_td = int(cells[5].text.strip()) if not is_average_row else float(cells[5].text.strip())
                    targets = int(cells[6].text.strip()) if not is_average_row else float(cells[6].text.strip())
                    receptions = int(cells[7].text.strip()) if not is_average_row else float(cells[7].text.strip())
                    rec_yards = int(cells[8].text.strip()) if not is_average_row else float(cells[8].text.strip())
                    rec_avg = float(cells[9].text.strip())
                    rec_td = int(cells[10].text.strip()) if not is_average_row else float(cells[10].text.strip())

                    data_to_insert.append((
                        team_abbreviation, week, matchup, rush_att, rush_yards, rush_avg, rush_td, 
                        targets, receptions, rec_yards, rec_avg, rec_td
                    ))

        return data_to_insert

    except requests.RequestException as e:
        print(f"Error fetching data for team {team_abbreviation}: {e}")
        return []


# Function to insert data into the specified database
def insert_data_to_db(data, cursor, position, team_abbreviation):
    table_name = f"{team_abbreviation.lower()}_{position.lower()}_stats"  # Adjusted table name
    insert_query = f"""
    INSERT INTO {table_name} 
    (team_abbreviation, week, matchup, rushing_attempts, total_rushing_yards, 
    avg_yards_per_carry, rushing_tds, targets, receptions, total_receiving_yards, 
    avg_yards_per_catch, receiving_tds) 
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    try:
        cursor.executemany(insert_query, data)
        print(f"Inserted {len(data)} rows into {table_name}.")
    except pymysql.MySQLError as e:
        print(f"Error inserting data into {table_name}: {e}")


# Main process
def main():
    for position in positions:
        connection = connect_to_db(position)
        cursor = connection.cursor()
        
        # Scrape and insert data for each team
        for team in teams:
            create_table(cursor, position, team)
            print(f"Scraping data for team {team} and position {position}")
            team_data = scrape_team_data(team, position)
            if team_data:
                insert_data_to_db(team_data, cursor, position, team)
            connection.commit()

        # Close the cursor and connection for the position
        cursor.close()
        connection.close()

if __name__ == "__main__":
    main()
