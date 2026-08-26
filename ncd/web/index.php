<?php

error_reporting(E_ALL);
ini_set('display_errors', '1');

defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');

require(__DIR__ . '/../vendor/autoload.php');
require(__DIR__ . '/../vendor/yiisoft/yii2/Yii.php');

// Register custom shutdown handler to trap fatal PHP errors and output exact error details
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Origin: *');
            http_response_code(200);
        }
        echo json_encode([
            'status' => 'error',
            'error_type' => 'PHP_FATAL_ENGINE_ERROR',
            'message' => $error['message'],
            'file' => basename($error['file']),
            'line' => $error['line']
        ], JSON_PRETTY_PRINT);
    }
});

$config = require(__DIR__ . '/../config/web.php');

try {
    (new yii\web\Application($config))->run();
} catch (\Throwable $e) {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        http_response_code(200);
    }
    echo json_encode([
        'status' => 'error',
        'error_type' => get_class($e),
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine(),
        'trace' => explode("\n", $e->getTraceAsString())
    ], JSON_PRETTY_PRINT);
    exit;
}
