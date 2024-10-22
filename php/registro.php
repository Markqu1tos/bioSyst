<?php
require_once '../includes/Database.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $database = new Database();
    $db = $database->getConnection();

    $username = $_POST['nombre'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $facial_image_data = $_POST['facial_image'];
    $facial_image = base64_decode(explode(',', $facial_image_data)[1]);
    $facial_image_path = "../uploads/" . uniqid() . '.jpg';
    file_put_contents($facial_image_path, $facial_image);

    $query = "INSERT INTO users (username, password, facial_image_path) VALUES (?, ?, ?)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $username);
    $stmt->bindParam(2, $password);
    $stmt->bindParam(3, $facial_image_path);

    if ($stmt->execute()) {
        echo "Usuario registrado con éxito";
    } else {
        echo "Error al registrar el usuario";
    }
}
?>
