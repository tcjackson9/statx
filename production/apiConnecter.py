import pymysql
import requests

player_list = ["Patrick Mahomes", "Justin Herbert", "Gardner Minshew", "Josh Allen", "Aaron Rodgers", "Tua Tagovailoa",
                "Russell Wilson", "Lamar Jackson", "Joe Burrow", "C-J Stroud", "Anthony Richardson",
               "Will Levis", "Trevor Lawrence", "Jared Goff", "Sam Darnold", "Jordan Love", "Caleb Williams", "Jayden Daniels",
               "Jalen Hurts", "Dak Prescott", "Daniel Jones", "Kirk Cousins", "Baker Mayfield", "Bryce Young", "Derek Carr",
               "Kyler Murray", "Matthew Stafford", "Brock Purdy", "Geno Smith", "Bo Nix", "Drake Maye", "Jameis Winston"]

connection = pymysql.connect(
    host = "localhost",
    user = "root",
    password = "Scoodoo7606$",
    database = "nfl_player_stats"
)
cursor = connection.cursor()

def handle_empty(value):
    # Return None if value is empty string, to insert NULL in the DB, otherwise return the value
    if value == '':
        return 0
    return value

for player_name in player_list:
    api_url = f"http://127.0.0.1:5000/api/player/{player_name}"
    # Fetch the player data from the API
    response = requests.get(api_url)
    response.raise_for_status()

    player_data = response.json()
    data = player_data.get("stats", [])
    position = player_data.get("position")

    if not data or not position:
        print(f"No stats or position data found for the player {player_name}.")
        continue

    # Create a unique table for the player based on their name (e.g., "Chris_Godwin")
    table_name = player_name.replace(" ", "_")  # Replace spaces with underscores

    # Create table based on position
    if position == "QB":
        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS `{table_name}` (
                player_name VARCHAR(50),
                week INT,
                attempts INT,
                completions INT,
                interceptions INT,
                passing_touchdowns INT,
                quarterback_rating FLOAT,
                rush_yards INT,
                rushing_attempts INT,
                rushing_tds INT,
                yards INT
            );
        """
    elif position == "RB":
        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS `{table_name}` (
                player_name VARCHAR(50),
                week INT,
                rush_yards INT,
                rushing_attempts INT,
                rushing_tds INT,
                receiving_yards INT,
                receptions INT,
                receiving_tds INT
            );
        """
    elif position == "WR":
        create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS `{table_name}` (
                player_name VARCHAR(50),
                week INT,
                receiving_yards INT,
                receptions INT,
                targets INT,
                touchdowns INT
            );
        """
    else:
        print(f"Unsupported position {position} for {player_name}.")
        continue

    cursor.execute(create_table_sql)  # Create the table based on the position

    # Insert the player data into the newly created table
    if position == "QB":
        insert_query = f"""
            INSERT INTO `{table_name}` (player_name, week, attempts, completions,
                                        interceptions, passing_touchdowns, quarterback_rating, 
                                        rush_yards, rushing_attempts, rushing_tds, yards)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        for stat in data:
            values = (
                player_name, 
                handle_empty(int(stat["week"])), 
                handle_empty((stat["attempts"])), 
                handle_empty((stat["completions"])), 
                handle_empty((stat["interceptions"])), 
                handle_empty((stat["passing_touchdowns"])), 
                handle_empty((stat["quarterback_rating"])),
                handle_empty((stat["rush_yards"])),
                handle_empty((stat["rushing attempts"])),
                handle_empty((stat["rushing_tds"])),
                handle_empty((stat["yards"]))
            )
            cursor.execute(insert_query, values)

    elif position == "RB":
        insert_query = f"""
            INSERT INTO `{table_name}` (player_name, week, rush_yards, rushing_attempts, rushing_tds, 
                                        receiving_yards, receptions, receiving_tds)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """
        for stat in data:
            values = (
                player_name, 
                int(stat["week"]), 
                handle_empty(stat["rush_yards"]), 
                handle_empty(stat["rushing_attempts"]), 
                handle_empty(stat["rushing_tds"]),
                handle_empty(stat["receiving_yards"]),
                handle_empty(stat["receptions"]),
                handle_empty(stat["receiving_tds"])
            )
            cursor.execute(insert_query, values)

    elif position == "WR":
        insert_query = f"""
            INSERT INTO `{table_name}` (player_name, week, receiving_yards, receptions, targets, touchdowns)
            VALUES (%s, %s, %s, %s, %s, %s);
        """
        for stat in data:
            # Safely convert missing targets to 0, empty string is treated as NULL
            values = (
                player_name, 
                int(stat["week"]), 
                handle_empty(stat["receiving_yards"]), 
                handle_empty(stat["receptions"]), 
                handle_empty(stat.get("targets", "")), 
                handle_empty(stat["touchdowns"])
            )
            cursor.execute(insert_query, values)

    # Commit the transaction
    connection.commit()
    print(f"Data for {player_name} inserted successfully into table '{table_name}'.")

# Close the connection
cursor.close()
connection.close()