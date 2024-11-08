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
    last_name_initial = last_name[0].upper()
    last_name_first_four = last_name[:4]  # First four letters of last name
    first_name_first_two = first_name[:2]  # First two letters of first name

    url = f'https://www.pro-football-reference.com/players/{last_name_initial}/{last_name_first_four}{first_name_first_two}00/gamelog/2024/'
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code != 200:
        return jsonify({"error": "Player not found or website unreachable"}), 404

    # Parse the page content with BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    position = None
    for p_tag in soup.find_all('p'):
        if "Position" in p_tag.text:
            # Split the text and get the part before "Throws"
            position_text = p_tag.get_text(strip=True).split("Throws")[0]
            position = position_text.replace("Position: ", "").strip()  # Remove "Position: " and extra spaces
            break

    if not position:
        return jsonify({"error": "Player position not found"}), 404

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
                    "week": columns[2].get_text(strip=True),
                    "receiving_yards": columns[15].get_text(strip=True),
                    "receptions": columns[14].get_text(strip=True),
                    "targets": columns[13].get_text(strip=True),
                    "receiving_tds": columns[20].get_text(strip=True),
                    "rushing_attempts": columns[9].get_text(strip=True), 
                    "rush_yards": columns[10].get_text(strip=True),
                    "rushing_tds": columns[12].get_text(strip=True)
                }
                stats_data.append(stat)
    elif position == "QB":
        for row in rows:
            columns = row.find_all('td')
            if len(columns) >= 14:  # Make sure the row has enough columns
                # Extract data from specific columns (adjusted to index values)
                stat = {
                    "week": columns[2].get_text(strip=True),
                    "completions": columns[9].get_text(strip=True),
                    "attempts": columns[10].get_text(strip=True),
                    "completion_percentage": columns[11].get_text(strip=True),
                    "yards": columns[12].get_text(strip=True),
                    "passing_touchdowns": columns[13].get_text(strip=True),
                    "interceptions": columns[14].get_text(strip=True),
                    "quarterback_rating": columns[15].get_text(strip=True),
                    "rushing attempts": columns[20].get_text(strip=True),
                    "rush_yards": columns[21].get_text(strip=True),
                    "rushing_tds": columns[23].get_text(strip=True)
                }
                stats_data.append(stat)
    else:
        for row in rows:
            columns = row.find_all('td')
            if len(columns) >= 14:  # Make sure the row has enough columns
                # Extract data from specific columns (adjusted to index values)
                stat = {
                    "week": columns[2].get_text(strip=True),
                    "receiving_yards": columns[11].get_text(strip=True),
                    "receptions": columns[10].get_text(strip=True),  # Column 5 is receptions
                    "targets": columns[9].get_text(strip=True),  # Column 4 is targets
                    "touchdowns": columns[13].get_text(strip=True),  # Column 8 is receiving touchdowns
                }
                stats_data.append(stat)
        
    # If no data found, return an error
    if not stats_data:
        return jsonify({"error": "No data found in the requested columns"}), 404

    # Return the data as a JSON response
    return jsonify({"stats": stats_data})


if __name__ == '__main__':
    app.run(debug=True)