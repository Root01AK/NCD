<?php

$host = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_NAME') ?: (getenv('MYSQL_DATABASE') ?: 'ncd');
$username = getenv('DB_USER') ?: (getenv('MYSQL_USER') ?: 'root');
$password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : (getenv('MYSQL_PASSWORD') !== false ? getenv('MYSQL_PASSWORD') : 'Kirub@2001');

return [
    'class' => 'yii\db\Connection',
    'dsn' => "mysql:host={$host};dbname={$dbname}",
    'username' => $username,
    'password' => $password,
    'charset' => 'utf8', 
    'tablePrefix' => 'cms_',
    'attributes' => [
        1002 => "SET sql_mode = ''" // 1002 is MYSQL_ATTR_INIT_COMMAND, avoids PHP 8.5 deprecation warning
    ]
];
