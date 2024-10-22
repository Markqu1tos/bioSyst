<?php
include_once 'Database.php';
include_once 'User.php';

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$stmt = $user->getAllUsers();
$num = $stmt->rowCount();

if($num > 0) {
    $users_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $user_item = array(
            "id" => $id,
            "username" => $username,
            "imagen_facial" => $facial_image_path
        );
        array_push($users_arr, $user_item);
    }
    echo json_encode($users_arr);
} else {
    echo json_encode(array("message" => "No se encontraron usuarios."));
}
