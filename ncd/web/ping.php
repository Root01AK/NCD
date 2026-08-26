<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$dbStatus = 'unknown';

try {
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = (int)(getenv('DB_PORT') ?: 3306);
    $dbname = getenv('DB_NAME') ?: (getenv('MYSQL_DATABASE') ?: 'ncd');
    $username = getenv('DB_USER') ?: (getenv('MYSQL_USER') ?: 'root');
    $password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : (getenv('MYSQL_PASSWORD') !== false ? getenv('MYSQL_PASSWORD') : 'Kirub@2001');

    try {
        $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname}", $username, $password, [
            PDO::ATTR_TIMEOUT => 2,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        $dbStatus = 'connected (' . $host . ')';
    } catch (Throwable $e) {
        $dbStatus = 'failed: ' . $e->getMessage();
    }
} catch (Throwable $ex) {
    $dbStatus = 'error: ' . $ex->getMessage();
}

echo json_encode([
    'status' => 'online',
    'service' => 'NCD Research-Grade Health Platform API',
    'php_version' => PHP_VERSION,
    'php_sapi' => PHP_SAPI,
    'server_time' => date('Y-m-d H:i:s T'),
    'database' => $dbStatus,
    'message' => 'PHP is 100% running in production!'
], JSON_PRETTY_PRINT);
