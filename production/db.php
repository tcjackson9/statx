<?php
// Database connection parameters
$host = 'playerstatsdbsql.mysql.database.azure.com'; // Azure MySQL server
$user = 'alex';  // Your database username
$password = 'Rendypoo1';  // Your database password
$database = 'playerStats';  // Your database name

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
