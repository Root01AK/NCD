<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$conn = new mysqli("127.0.0.1", "root", "", "ncd");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$result = $conn->query("SELECT users_name, password FROM cms_users LIMIT 10");
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "Username: " . $row["users_name"]. " - Password Hash: " . $row["password"]. "<br>\n";
    }
} else {
    echo "0 results";
}
$conn->close();
?>
