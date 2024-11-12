<?php
// Include database connection
include 'db.php';  // Assuming you have this file to connect to the database

// Check if the form was submitted (via POST)
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['playerName'])) {
    $playerName = $_POST['playerName'];  // Get the player name from the form

    // Query the database for player stats
    $sql = "SELECT game, week, targets, receptions, receiving_yards, receiving_tds, 
                   rushing_attempts, rush_yards, rushing_tds, attempts, completions, 
                   completion_percentage, yards, passing_touchdowns, interceptions, quarterback_rating 
            FROM player_stats
            WHERE player_name = ?";  // Use prepared statements to prevent SQL injection

    // Prepare the SQL statement
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("s", $playerName);  // Bind the player name to the SQL statement
        $stmt->execute();  // Execute the query
        
        // Store the result
        $result = $stmt->get_result();
        
        // Check if any rows were returned
        if ($result->num_rows > 0) {
            // Start the table and display the headers
            echo "<h2>Stats for $playerName</h2>";
            echo "<table class='table table-striped'>";
            echo "<thead>
                    <tr>
                        <th>Game</th>
                        <th>Week</th>
                        <th>Targets</th>
                        <th>Receptions</th>
                        <th>Receiving Yards</th>
                        <th>Receiving Touchdowns</th>
                        <th>Rushing Attempts</th>
                        <th>Rushing Yards</th>
                        <th>Rushing Touchdowns</th>
                        <th>Attempts</th>
                        <th>Completions</th>
                        <th>Completion Percentage</th>
                        <th>Passing Yards</th>
                        <th>Passing Touchdowns</th>
                        <th>Interceptions</th>
                        <th>Quarterback Rating</th>
                    </tr>
                  </thead><tbody>";

            // Fetch and display each row of data
            while ($row = $result->fetch_assoc()) {
                echo "<tr>
                        <td>" . htmlspecialchars($row['game']) . "</td>
                        <td>" . htmlspecialchars($row['week']) . "</td>
                        <td>" . htmlspecialchars($row['targets']) . "</td>
                        <td>" . htmlspecialchars($row['receptions']) . "</td>
                        <td>" . htmlspecialchars($row['receiving_yards']) . "</td>
                        <td>" . htmlspecialchars($row['receiving_tds']) . "</td>
                        <td>" . htmlspecialchars($row['rushing_attempts']) . "</td>
                        <td>" . htmlspecialchars($row['rush_yards']) . "</td>
                        <td>" . htmlspecialchars($row['rushing_tds']) . "</td>
                        <td>" . htmlspecialchars($row['attempts']) . "</td>
                        <td>" . htmlspecialchars($row['completions']) . "</td>
                        <td>" . htmlspecialchars($row['completion_percentage']) . "</td>
                        <td>" . htmlspecialchars($row['yards']) . "</td>
                        <td>" . htmlspecialchars($row['passing_touchdowns']) . "</td>
                        <td>" . (isset($row['interceptions']) ? htmlspecialchars($row['interceptions']) : 'N/A') . "</td>
                        <td>" . htmlspecialchars($row['quarterback_rating']) . "</td>
                      </tr>";
            }

            // Close the table
            echo "</tbody></table>";
        } else {
            echo "<p>No stats found for player: $playerName. Please try again.</p>";
        }

        // Close the prepared statement
        $stmt->close();
    } else {
        echo "Error preparing the query.";
    }

    // Close the database connection
    $conn->close();
} else {
    // Display the form if the page is accessed directly or no POST request was made
    echo '<form action="search.php" method="POST">
            <label for="playerName">Player Name:</label>
            <input type="text" id="playerName" name="playerName">
            <button type="submit">Search</button>
          </form>';
}
?>
