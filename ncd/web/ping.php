<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$dbStatus = 'unknown';
$dbMessage = '';

try {
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = (int)(getenv('DB_PORT') ?: 3306);
    $dbname = getenv('DB_NAME') ?: (getenv('MYSQL_DATABASE') ?: 'ncd');
    $username = getenv('DB_USER') ?: (getenv('MYSQL_USER') ?: 'root');
    $password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : (getenv('MYSQL_PASSWORD') !== false ? getenv('MYSQL_PASSWORD') : 'Kirub@2001');

    $candidates = array_unique([$host, 'db', 'mariadb', '127.0.0.1', 'localhost', 'host.docker.internal']);
    $connectedHost = null;

    foreach ($candidates as $h) {
        // Ultra-fast TCP socket check (0.2s timeout) before calling PDO
        $fp = @fsockopen($h, $port, $errno, $errstr, 0.2);
        if ($fp) {
            fclose($fp);
            try {
                $pdo = new PDO("mysql:host={$h};port={$port};dbname={$dbname}", $username, $password, [
                    PDO::ATTR_TIMEOUT => 2,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]);
                $connectedHost = $h;
                break;
            } catch (Throwable $e) {
                $dbMessage = $e->getMessage();
            }
        }
    }

    if ($connectedHost) {
        $dbStatus = 'connected (' . $connectedHost . ')';
    } else {
        $dbStatus = 'no open MySQL port found: ' . ($dbMessage ?: 'connection timed out');
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
