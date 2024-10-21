<?php
require_once 'auth.php';

if (!is_logged_in()) {
    header('Location: iniciosesion.html');
    exit();
}