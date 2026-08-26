<?php

$envHost = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$dbname = getenv('DB_NAME') ?: (getenv('MYSQL_DATABASE') ?: 'ncd');
$username = getenv('DB_USER') ?: (getenv('MYSQL_USER') ?: 'root');
$password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : (getenv('MYSQL_PASSWORD') !== false ? getenv('MYSQL_PASSWORD') : 'Kirub@2001');

// Candidate hosts to try in Docker/Coolify container environments
$hostsToTry = array_unique([$envHost, 'db', 'mariadb', '127.0.0.1', 'localhost', 'host.docker.internal']);
$selectedHost = $envHost;

foreach ($hostsToTry as $h) {
    try {
        $testPdo = new \PDO("mysql:host={$h};port={$port};dbname={$dbname}", $username, $password, [
            \PDO::ATTR_TIMEOUT => 2,
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION
        ]);
        $selectedHost = $h;
        break;
    } catch (\Throwable $e) {
        continue;
    }
}

return [
    'class' => 'yii\db\Connection',
    'dsn' => "mysql:host={$selectedHost};port={$port};dbname={$dbname}",
    'username' => $username,
    'password' => $password,
    'charset' => 'utf8', 
    'tablePrefix' => 'cms_',
    'attributes' => [
        1002 => "SET sql_mode = ''"
    ]
];
