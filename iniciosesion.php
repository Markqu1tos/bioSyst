<?php
include 'base.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['facial_recognition'])) {
        // Lógica para el inicio de sesión por reconocimiento facial
        $recognized_user = $_POST['recognized_user'];
        
        // Verifica si el usuario reconocido existe en la base de datos
        $sql = "SELECT * FROM users WHERE username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $recognized_user);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 1) {
            // Usuario reconocido, inicia sesión
            session_start();
            $_SESSION['username'] = $recognized_user;
            echo json_encode(["success" => true, "message" => "Inicio de sesión exitoso"]);
        } else {
            echo json_encode(["success" => false, "message" => "Usuario no reconocido"]);
        }
    } else {
        // Lógica existente para el inicio de sesión con usuario y contraseña
        // ... (mantén tu código actual aquí)
    }
}
?>
