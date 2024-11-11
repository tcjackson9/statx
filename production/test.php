<?php
// Database connection configuration
$host = 'your-database-host';
$db = 'your-database-name';
$user = 'your-database-username';
$pass = 'your-database-password';

// Establish connection to MySQL database
$mysqli = new mysqli($host, $user, $pass, $db);

// Check for connection errors
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Get the player's name from the URL query parameters
$player_name = isset($_GET['player_name']) ? $mysqli->real_escape_string($_GET['player_name']) : '';

if (!empty($player_name)) {
    // Query to fetch player stats
    $query = "SELECT * FROM players_stats WHERE player_name = '$player_name'";
    $result = $mysqli->query($query);

    if ($result->num_rows > 0) {
        // Fetch all records as an associative array
        $player_stats = $result->fetch_all(MYSQLI_ASSOC);
        
        // Return the stats as a JSON object
        echo json_encode(["stats" => $player_stats]);
    } else {
        echo json_encode(["error" => "Player not found"]);
    }
} else {
    echo json_encode(["error" => "No player name provided"]);
}

// Close the database connection
$mysqli->close();
?>