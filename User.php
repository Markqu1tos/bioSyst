<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $username;
    public $email;
    public $password;
    public $facial_image_path;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (username, email, password, facial_image_path) 
                  VALUES (?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);

        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = htmlspecialchars(strip_tags($this->password));
        $this->facial_image_path = htmlspecialchars(strip_tags($this->facial_image_path));

        $stmt->bind_param("ssss", $this->username, $this->email, $this->password, $this->facial_image_path);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function emailExists() {
        $query = "SELECT id, username, password FROM " . $this->table_name . " WHERE email = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->email);
        $stmt->execute();
        $result = $stmt->get_result();
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->password = $row['password'];
            return true;
        }
        return false;
    }

    public function getAllUsers() {
        $query = "SELECT id, username, facial_image_path FROM " . $this->table_name;
        $result = $this->conn->query($query);
        return $result;
    }
}
