from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/player/<player_name>', methods = ['GET'])
def get_player_stats(player_name):
    names = player_name.split()
    if len(names) < 2:
        return {"error": "Invalid player name"}
    first_name = names[0]
    last_name = names[1]
    last_name_initial = last_name[0].upper()
    last_name_first_four = last_name[:4]
    first_name_first_two = first_name[:2]
    # Construct the URL dynamically for the player page
    url = f'https://www.pro-football-reference.com/players/{last_name_initial}/{last_name_first_four}{first_name_first_two}00.htm'
    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({"error": "Player not found or website unreachable"}), 404

    # Parse the page content with BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find the first table in the page
    table = soup.find('table')
    if not table:
        return jsonify({"error": "Table not found"}), 404

    # Find all rows in the table body
    rows = table.find('tbody').find_all('tr')
    
    # Extract the 6th column (index 5) from each row and return yards
    yards_data = []
    for row in rows:
        columns = row.find_all('td')
        if len(columns) >= 6:
            # Append the yard data from column 6 (index 5)
            yards_data.append(columns[6].get_text(strip=True))
    
    # If no data found in the 6th column, return an error
    if not yards_data:
        return jsonify({"error": "No data found in the 6th column"}), 404

    # Return the data as a JSON response
    return jsonify({"yards": yards_data})


if __name__ == '__main__':
    app.run(debug=True)