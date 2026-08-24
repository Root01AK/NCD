<?php

$host = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_NAME_MALVANI') ?: 'ncd_malvani';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : 'Kirub@2001';

return [
    'class' => 'yii\db\Connection',
    'dsn' => "mysql:host={$host};dbname={$dbname}",
    'username' => $username,
    'password' => $password,
    'charset' => 'utf8', 
    'tablePrefix' => 'cms_',
    'attributes' => [
        1002 => "SET sql_mode = ''"
    ]
];
