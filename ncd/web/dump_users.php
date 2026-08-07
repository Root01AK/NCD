<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/vendor/yiisoft/yii2/Yii.php';
$config = require __DIR__ . '/config/web.php';
(new yii\web\Application($config));
$users = app\models\Users::find()->all();
$out = [];
foreach($users as $u) {
    $out[] = ['id' => $u->user_id, 'username' => $u->username, 'role' => $u->role_id];
}
header('Content-Type: application/json');
echo json_encode($out);
