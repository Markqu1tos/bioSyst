<?php
include 'base.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    
    // Procesar la imagen facial
    $target_dir = "uploads/";
    $target_file = $target_dir . basename($_FILES["facial_image"]["name"]);
    move_uploaded_file($_FILES["facial_image"]["tmp_name"], $target_file);
    
    // Guardar la información en la base de datos
    $sql = "INSERT INTO users (username, email, password, facial_image_path) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $username, $email, $password, $target_file);
    
    if ($stmt->execute()) {
        echo "Registro exitoso";
    } else {
        echo "Error en el registro: " . $conn->error;
    }
    
    $stmt->close();
    $conn->close();
}
?>
