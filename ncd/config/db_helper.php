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

// Helper to safely fetch environment variables from $_ENV, $_SERVER, or getenv()
if (!function_exists('ncd_get_env')) {
    function ncd_get_env($key, $default = null) {
        if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
        $val = getenv($key);
        if ($val !== false && $val !== '') return $val;
        return $default;
    }
}

// Global helper to ensure database schema and default records are present
if (!function_exists('ncd_ensure_schema_ready')) {
    function ncd_ensure_schema_ready($db = null) {
        $lockFile = sys_get_temp_dir() . '/ncd_schema_ready.lock';
        if (file_exists($lockFile)) return;

        try {
            if (!$db && class_exists('Yii') && isset(\Yii::$app) && isset(\Yii::$app->db)) {
                $db = \Yii::$app->db;
            }
            if (!$db) return;
            $db->open();

            $tables = $db->createCommand('SHOW TABLES LIKE "cms_users"')->queryColumn();
            if (!empty($tables)) {
                @touch($lockFile);
                return;
            }

            $candidates = [
                dirname(__DIR__) . '/DB/ncd.sql',
                '/var/www/html/DB/ncd.sql',
                dirname(__DIR__, 2) . '/DB/ncd.sql'
            ];
            foreach ($candidates as $sqlFile) {
                if (file_exists($sqlFile)) {
                    $sqlContent = file_get_contents($sqlFile);
                    $queries = explode(";\n", $sqlContent);
                    foreach ($queries as $q) {
                        $q = trim($q);
                        if ($q && strpos($q, '/*') !== 0 && strpos($q, '--') !== 0) {
                            try {
                                $db->createCommand($q)->execute();
                            } catch (\Throwable $ignored) {}
                        }
                    }
                    @touch($lockFile);
                    break;
                }
            }
        } catch (\Throwable $e) {}
    }
}

// Ultra-fast DB Host resolution with zero DNS latency
if (!function_exists('ncd_resolve_db_host')) {
    function ncd_resolve_db_host($preferredHost = null, $port = 3306) {
        if ($preferredHost && $preferredHost !== 'ncd-db' && $preferredHost !== 'g113b51lhaak9txrr24qnaxj') {
            return $preferredHost;
        }
        $envHost = ncd_get_env('DB_HOST');
        if ($envHost && $envHost !== 'ncd-db' && $envHost !== 'g113b51lhaak9txrr24qnaxj') {
            return $envHost;
        }

        // Fast disk cache check
        $cacheFile = sys_get_temp_dir() . '/ncd_db_host.cache';
        if (file_exists($cacheFile)) {
            $cached = trim((string)file_get_contents($cacheFile));
            if ($cached) return $cached;
        }

        // Direct check: 'db' container first, then 127.0.0.1
        $resolved = 'db';
        $fp = @fsockopen('db', (int)$port, $errno, $errstr, 0.05);
        if ($fp) {
            fclose($fp);
            $resolved = 'db';
        } else {
            $resolved = '127.0.0.1';
        }

        @file_put_contents($cacheFile, $resolved);
        return $resolved;
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
        $dbUrl = ncd_get_env('DATABASE_URL') ?: ncd_get_env('DATABASE_URL_MYSQL');
        if ($dbUrl) {
            $parsed = parse_url($dbUrl);
            if ($parsed) {
                $port = (int)($parsed['port'] ?? 3306);
                $host = ncd_resolve_db_host($parsed['host'] ?? null, $port);
                $username = isset($parsed['user']) ? urldecode($parsed['user']) : 'mariadb';
                $password = isset($parsed['pass']) ? urldecode($parsed['pass']) : 'Kirub@20011';
                $dbname = isset($parsed['path']) ? ltrim($parsed['path'], '/') : 'ncd';

                return [
                    'class' => 'yii\db\Connection',
                    'dsn' => "mysql:host={$host};port={$port};dbname={$dbname}",
                    'username' => $username,
                    'password' => $password,
                    'charset' => 'utf8',
                    'tablePrefix' => 'cms_',
                    'attributes' => [
                        1002 => "SET sql_mode = ''",
                        1013 => true
                    ]
                ];
            }
        }

        // Priority 3: Automated multi-host discovery (Coolify / Docker / VPS)
        $port = (int)(ncd_get_env('DB_PORT') ?: ncd_get_env('MYSQL_PORT') ?: ncd_get_env('SERVICE_PORT_MYSQL') ?: 3306);
        $host = ncd_resolve_db_host(ncd_get_env('DB_HOST'), $port);
        
        $dbname = ncd_get_env('DB_NAME') ?: ncd_get_env('MYSQL_DATABASE') ?: ncd_get_env('SERVICE_DATABASE_MYSQL') ?: 'ncd';
        if ($center) {
            $centerKey = 'DB_NAME_' . strtoupper($center);
            if (ncd_get_env($centerKey)) {
                $dbname = ncd_get_env($centerKey);
            }
        }

        $username = ncd_get_env('DB_USER') ?: ncd_get_env('MYSQL_USER') ?: ncd_get_env('SERVICE_USER_MYSQL') ?: 'mariadb';

        $password = ncd_get_env('DB_PASSWORD') ?: ncd_get_env('MYSQL_PASSWORD') ?: ncd_get_env('SERVICE_PASSWORD_MYSQL') ?: ncd_get_env('DB_ROOT_PASSWORD') ?: 'Kirub@20011';

        return [
            'class' => 'yii\db\Connection',
            'dsn' => "mysql:host={$host};port={$port};dbname={$dbname}",
            'username' => $username,
            'password' => $password,
            'charset' => 'utf8', 
            'tablePrefix' => 'cms_',
            'attributes' => [
                1002 => "SET sql_mode = ''",
                1013 => true
            ]
        ];
    }
}
