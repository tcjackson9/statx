// Import necessary modules
const mysql = require('mysql2/promise');
const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection configuration (hardcoded for testing purposes)
const dbConfig = {
    host: 'playerstatsdbsql.mysql.database.azure.com',
    user: 'alex',
    password: 'Rendypoo1',
    database: 'playerStats',
};

// Define the API route for player search
app.post('/api/searchPlayer', async (req, res) => {
    const playerName = req.body.player_name;

    // Check if playerName is provided
    if (!playerName) {
        return res.status(400).json({ error: "Please provide a player name." });
    }

    try {
        // Establish a connection to the MySQL database
        const connection = await mysql.createConnection(dbConfig);

        // Query to retrieve player stats
        const [rows] = await connection.execute(
            `SELECT my_row_id, player_name, week, receiving_yards, receptions, targets, touchdowns 
             FROM amari_cooper 
             WHERE player_name = ?`,
            [playerName]
        );

        // Close the connection
        await connection.end();

        // Check if rows were returned and respond with JSON
        if (rows.length > 0) {
            return res.status(200).json({ data: rows });
        } else {
            return res.status(404).json({ message: `No stats found for player: ${playerName}` });
        }
    } catch (error) {
        console.error("Database query error: ", error.message);
        return res.status(500).json({ error: "An error occurred while querying the database.", details: error.message });
    }
});

// Export the handler for Vercel
module.exports = app;
