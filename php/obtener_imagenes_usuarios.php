<?php
require_once '../includes/Database.php';

header('Content-Type: application/json');

$database = new Database();
$conn = $database->getConnection();

$query = "SELECT username, facial_image_path FROM users";
$result = $conn->query($query);

$usuarios = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $usuarios[] = [
            'username' => $row['username'],
            'facial_image_path' => $row['facial_image_path']
        ];
    }
}

echo json_encode($usuarios);
