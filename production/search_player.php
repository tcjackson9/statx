<?php
// Database connection info
$host = 'playerstatsdbsql.mysql.database.azure.com';
$db = 'playerStats';
$user = 'alex';
$pass = 'Rendypoo1';

// Establish connection to MySQL database
$mysqli = new mysqli($host, $user, $pass, $db);

// Check for connection errors
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Retrieve player name from form
$player_name = $_POST['player_name'] ?? '';
$player_name = str_replace(' ', '_', $player_name);


if ($player_name) {
    // Sanitize the input to prevent SQL injection
    $player_name = $mysqli->real_escape_string($player_name);

    // SQL query to fetch player stats based on player name
    $query = "SELECT my_row_id, player_name, week, receiving_yards, receptions, targets, touchdowns 
              FROM amari_cooper
              WHERE player_name = '$player_name'";

    // Execute the query
    $result = $mysqli->query($query);

    // Check if any rows were returned
    if ($result->num_rows > 0) {
        // Display data in a table
        echo "<h2>Stats for " . htmlspecialchars($player_name) . "</h2>";
        echo "<table border='1'>";
        echo "<tr><th>ID</th><th>Player Name</th><th>Week</th><th>Receiving Yards</th><th>Receptions</th><th>Targets</th><th>Touchdowns</th></tr>";
        
        // Output data of each row
        while ($row = $result->fetch_assoc()) {
            echo "<tr>
                    <td>{$row['my_row_id']}</td>
                    <td>{$row['player_name']}</td>
                    <td>{$row['week']}</td>
                    <td>{$row['receiving_yards']}</td>
                    <td>{$row['receptions']}</td>
                    <td>{$row['targets']}</td>
                    <td>{$row['touchdowns']}</td>
                  </tr>";
        }
        echo "</table>";
    } else {
        echo "<p>No stats found for player: " . htmlspecialchars($player_name) . "</p>";
    }

    // Free result set
    $result->free();
} else {
    echo "<p>Please enter a player name.</p>";
}

// Close the database connection
$mysqli->close();
?>
