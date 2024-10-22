<?php
function limpiar_entrada($dato) {
    $dato = trim($dato);
    $dato = stripslashes($dato);
    $dato = htmlspecialchars($dato);
    return $dato;
}

function validar_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validar_longitud($dato, $min, $max) {
    $longitud = strlen($dato);
    return ($longitud >= $min && $longitud <= $max);
}
?>
