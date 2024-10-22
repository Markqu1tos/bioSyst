<?php
include_once 'Database.php';
include_once 'User.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$result = $user->getAllUsers();

if($result->num_rows > 0) {
    $users_arr = array();
    while ($row = $result->fetch_assoc()) {
        $user_item = array(
            "id" => $row['id'],
            "username" => $row['username'],
            "imagen_facial" => $row['facial_image_path']
        );
        array_push($users_arr, $user_item);
    }
    echo json_encode($users_arr);
} else {
    echo json_encode(array("message" => "No se encontraron usuarios."));
}
