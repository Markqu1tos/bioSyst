<?php
include_once 'Database.php';
include_once 'User.php';
include_once 'validacion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $username = limpiar_entrada($_POST['username']);
    $email = limpiar_entrada($_POST['email']);
    $password = $_POST['password'];
    
    // Validación
    $errores = [];
    if (!validar_longitud($username, 3, 20)) {
        $errores[] = "El nombre de usuario debe tener entre 3 y 20 caracteres.";
    }
    if (!validar_email($email)) {
        $errores[] = "El email no es válido.";
    }
    if (!validar_longitud($password, 8, 255)) {
        $errores[] = "La contraseña debe tener al menos 8 caracteres.";
    }
    
    if (empty($errores)) {
        $user->username = $username;
        $user->email = $email;
        $user->password = password_hash($password, PASSWORD_DEFAULT);
        
        // Procesar la imagen facial
        $target_dir = "uploads/";
        $target_file = $target_dir . uniqid() . "_" . basename($_FILES["facial_image"]["name"]);
        if (move_uploaded_file($_FILES["facial_image"]["tmp_name"], $target_file)) {
            $user->facial_image_path = $target_file;
            
            if ($user->create()) {
                echo "Registro exitoso";
            } else {
                echo "Error en el registro.";
            }
        } else {
            echo "Error al subir la imagen facial.";
        }
    } else {
        foreach ($errores as $error) {
            echo $error . "<br>";
        }
    }
}
?>
