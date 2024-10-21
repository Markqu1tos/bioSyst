<?php
session_start();

function login($username, $password) {
    // Aquí iría la lógica de verificación con la base de datos
    if ($username === 'usuario' && $password === 'contraseña') {
        $_SESSION['user_id'] = 1;
        return true;
    }
    return false;
}

function is_logged_in() {
    return isset($_SESSION['user_id']);
}

function logout() {
    unset($_SESSION['user_id']);
    session_destroy();
}