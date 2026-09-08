<?php

/**
 * Central Database Configuration & Environment Loader
 * Optimized for Coolify, Docker, and VPS deployments.
 * Priority order:
 * 1. config/db_local.php (Untracked local override file)
 * 2. DATABASE_URL / DATABASE_URL_MYSQL string parsing
 * 3. System / .env environment variables (Coolify / Docker / VPS)
 * 4. Default fallback values
 */

// 1. Auto-load .env file if it exists in project root
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (!$line || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim(trim($value), '"\'');
            if (getenv($name) === false) {
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// 2. Helper function to return Yii DB Connection config
if (!function_exists('ncd_get_db_config')) {
    function ncd_get_db_config($center = null) {
        // Priority 1: Check for un-tracked local override file
        $localFile = __DIR__ . '/db_local.php';
        if (file_exists($localFile)) {
            $localConfig = include $localFile;
            if (is_array($localConfig)) {
                if ($center && isset($localConfig[$center]) && is_array($localConfig[$center])) {
                    return $localConfig[$center];
                }
                if (isset($localConfig['dsn']) || isset($localConfig['class'])) {
                    return $localConfig;
                }
            }
        }

        // Priority 2: Check for DATABASE_URL / DATABASE_URL_MYSQL connection string from Coolify
        $dbUrl = getenv('DATABASE_URL') ?: getenv('DATABASE_URL_MYSQL');
        if ($dbUrl) {
            $parsed = parse_url($dbUrl);
            if ($parsed) {
                $host = $parsed['host'] ?? '127.0.0.1';
                $port = $parsed['port'] ?? 3306;
                $username = $parsed['user'] ?? 'root';
                $password = $parsed['pass'] ?? '';
                $dbname = isset($parsed['path']) ? ltrim($parsed['path'], '/') : 'ncd';

                return [
                    'class' => 'yii\db\Connection',
                    'dsn' => "mysql:host={$host};port={$port};dbname={$dbname}",
                    'username' => $username,
                    'password' => $password,
                    'charset' => 'utf8',
                    'tablePrefix' => 'cms_',
                    'attributes' => [
                        1002 => "SET sql_mode = ''"
                    ]
                ];
            }
        }

        // Priority 3: Environment variables (Coolify / Docker / Custom VPS)
        $host = getenv('DB_HOST') ?: (getenv('MYSQL_HOST') ?: (getenv('SERVICE_HOST_MYSQL') ?: '127.0.0.1'));
        $port = (int)(getenv('DB_PORT') ?: (getenv('MYSQL_PORT') ?: (getenv('SERVICE_PORT_MYSQL') ?: 3306)));
        
        $dbname = getenv('DB_NAME') ?: (getenv('MYSQL_DATABASE') ?: (getenv('SERVICE_DATABASE_MYSQL') ?: 'ncd'));
        if ($center) {
            $centerKey = 'DB_NAME_' . strtoupper($center);
            if (getenv($centerKey)) {
                $dbname = getenv($centerKey);
            }
        }

        $username = getenv('DB_USER') ?: (getenv('MYSQL_USER') ?: (getenv('SERVICE_USER_MYSQL') ?: 'root'));

        $password = false;
        if (getenv('DB_PASSWORD') !== false) {
            $password = getenv('DB_PASSWORD');
        } else if (getenv('MYSQL_PASSWORD') !== false) {
            $password = getenv('MYSQL_PASSWORD');
        } else if (getenv('SERVICE_PASSWORD_MYSQL') !== false) {
            $password = getenv('SERVICE_PASSWORD_MYSQL');
        } else if (getenv('MYSQL_ROOT_PASSWORD') !== false) {
            $password = getenv('MYSQL_ROOT_PASSWORD');
        } else {
            $password = 'Kirub@2001';
        }

        return [
            'class' => 'yii\db\Connection',
            'dsn' => "mysql:host={$host};port={$port};dbname={$dbname}",
            'username' => $username,
            'password' => $password,
            'charset' => 'utf8', 
            'tablePrefix' => 'cms_',
            'attributes' => [
                1002 => "SET sql_mode = ''"
            ]
        ];
    }
}
