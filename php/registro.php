<?php
require_once '../includes/Database.php';
require_once '../includes/User.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $user->username = $_POST['username'];
    $user->email = $_POST['email'];
    $user->password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    // Manejo de la imagen facial
    $target_dir = "../uploads/";
    $target_file = $target_dir . basename($_FILES["facial_image"]["name"]);
    if (move_uploaded_file($_FILES["facial_image"]["tmp_name"], $target_file)) {
        $user->facial_image_path = $target_file;
    } else {
        echo "Error al subir la imagen.";
        exit();
    }

    if ($user->create()) {
        echo "Usuario registrado con éxito";
    } else {
        echo "Error al registrar el usuario";
    }
}
?>
