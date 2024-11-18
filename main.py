import mysql.connector
from flask import Flask, jsonify

app = Flask(__name__)

# Database connection configuration
DB_CONFIG = {
    'host': 'aws-0-us-west-1.pooler.supabase.com',
    'user': 'postgres.xrstrludepuahpovxpzb"',
    'password': 'your-password',
    'database': 'AZ1d3Tab7my1TubG'
}

@app.route('/stats', methods=['GET'])
def get_stats():
    try:
        # Connect to the database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        # Query stats (example query)
        query = "SELECT * FROM stats_table LIMIT 10"
        cursor.execute(query)
        stats = cursor.fetchall()

        return jsonify({'data': stats}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

