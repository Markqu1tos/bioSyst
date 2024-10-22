<?php
session_start();
require_once '../includes/Database.php';
require_once '../includes/User.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $user->email = $_POST['email'];
    $password = $_POST['password'];

    if ($user->login($password)) {
        $_SESSION['user_id'] = $user->id;
        $_SESSION['username'] = $user->username;
        echo json_encode(["success" => true, "message" => "Inicio de sesión exitoso"]);
    } else {
        echo json_encode(["success" => false, "message" => "Email o contraseña incorrectos"]);
    }
}
?>
