from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS
#UPDATED
app = Flask(__name__)
CORS(app)

@app.route('/api/player/<player_name>', methods = ['GET'])
def get_player_stats(player_name):
    # Split the full name into first and last names
    names = player_name.split()
    if len(names) < 2:
        return {"error": "Invalid player name"}
    first_name = names[0]
    last_name = names[1]
    # Construct the URL dynamically for the player page
    player_name_lower = f'{first_name.lower()}-{last_name.lower()}'  # Lowercase version of the name for the URL
    url = f'https://www.nfl.com/players/{player_name_lower}/stats/'
    print(url)
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code != 200:
        return jsonify({"error": "Player not found or website unreachable"}), 404

    # Parse the page content with BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    # Find the player's position using the correct class
    position = None
    position_tag = soup.find('span', class_='nfl-c-player-header__position')
    if position_tag:
        position = position_tag.get_text(strip=True)

    if not position:
        return jsonify({"error": "Player position not found"}), 404
    print(position)

    # Find the first table in the page (usually the 'receiving' table for NFL players)
    table = soup.find('table')
    if not table:
        return jsonify({"error": "Table not found"}), 404

    # Find all rows in the table body
    rows = table.find('tbody').find_all('tr')
    
    # Extract relevant columns (receptions, targets, receiving tds, attempts, rush yards, rush tds)
    stats_data = []
    if position == "RB":
        for row in rows:
            columns = row.find_all('td')
            if len(columns) >= 14:  # Make sure the row has enough columns
                # Extract data from specific columns (adjusted to index values)
                stat = {
                    "week": columns[0].get_text(strip=True),
                    "receiving_yards": columns[9].get_text(strip=True),
                    "receptions": columns[8].get_text(strip=True),
                    "receiving_tds": columns[12].get_text(strip=True),
                    "rushing_attempts": columns[3].get_text(strip=True), 
                    "rush_yards": columns[4].get_text(strip=True),
                    "rushing_tds": columns[7].get_text(strip=True)
                }
                stats_data.append(stat)
    elif position == "QB":
        for row in rows:
            columns = row.find_all('td')
            if len(columns) >= 14:  # Make sure the row has enough columns
                # Extract data from specific columns (adjusted to index values)
                stat = {
                    "week": columns[0].get_text(strip=True),
                    "completions": columns[3].get_text(strip=True),
                    "attempts": columns[4].get_text(strip=True),
                    "yards": columns[5].get_text(strip=True),
                    "passing_touchdowns": columns[7].get_text(strip=True),
                    "interceptions": columns[8].get_text(strip=True),
                    "quarterback_rating": columns[11].get_text(strip=True),
                    "rushing attempts": columns[12].get_text(strip=True),
                    "rush_yards": columns[13].get_text(strip=True),
                    "rushing_tds": columns[15].get_text(strip=True)
                }
                stats_data.append(stat)
    else:
        for row in rows:
            columns = row.find_all('td')
            if len(columns) >= 14:  # Make sure the row has enough columns
                # Extract data from specific columns (adjusted to index values)
                stat = {
                    "week": columns[0].get_text(strip=True),
                    "receiving_yards": columns[4].get_text(strip=True),
                    "receptions": columns[3].get_text(strip=True),  # Column 5 is receptions
                    "targets": columns[9].get_text(strip=True),  # Column 4 is targets
                    "touchdowns": columns[7].get_text(strip=True),  # Column 8 is receiving touchdowns
                }
                stats_data.append(stat)
        
    # If no data found, return an error
    if not stats_data:
        return jsonify({"error": "No data found in the requested columns"}), 404

    # Return the data as a JSON response
    return jsonify({"stats": stats_data, "position": position})


if __name__ == '__main__':
    app.run(debug=True)