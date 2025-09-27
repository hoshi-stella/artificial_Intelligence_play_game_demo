<?php
function db() {
  static $pdo = null;
  if ($pdo) return $pdo;
  $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', getenv('DB_HOST'), getenv('DB_NAME'));
  $pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'), [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  return $pdo;
}
function require_api_key() {
  $key = $_SERVER['HTTP_X_API_KEY'] ?? '';
  if ($key !== getenv('API_KEY')) { http_response_code(401); echo '{}'; exit; }
}
function json_in() { return json_decode(file_get_contents('php://input'), true) ?? []; }
function json_out($a) { header('Content-Type: application/json'); echo json_encode($a, JSON_UNESCAPED_UNICODE); }
