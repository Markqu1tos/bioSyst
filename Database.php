<?php
class Database {
    private $host = "localhost";
    private $db_name = "biosyst";
    private $username = "tu_usuario";
    private $password = "tu_contraseña";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);
            if ($this->conn->connect_error) {
                throw new Exception("Error de conexión: " . $this->conn->connect_error);
            }
            $this->conn->set_charset("utf8");
        } catch(Exception $exception) {
            echo "Error de conexión: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
