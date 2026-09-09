#!/bin/bash

echo "[INIT] Checking database connectivity and clean schema initialization..."

for i in {1..10}; do
    echo "[INIT] Connection attempt $i/10..."
    php -r "
    require '/var/www/html/vendor/autoload.php';
    require '/var/www/html/vendor/yiisoft/yii2/Yii.php';
    \$config = require '/var/www/html/config/web.php';
    \$app = new yii\web\Application(\$config);

    try {
        \$db = Yii::\$app->db;
        \$db->open();
        
        \$tables = \$db->createCommand('SHOW TABLES LIKE \"cms_users\"')->queryColumn();
        if (empty(\$tables)) {
            echo \"[INIT] Empty database detected. Executing clean schema import from DB/ncd.sql...\n\";
            \$sqlFile = '/var/www/html/DB/ncd.sql';
            if (file_exists(\$sqlFile)) {
                \$sql = file_get_contents(\$sqlFile);
                \$db->pdo->exec(\$sql);
                echo \"[INIT] Clean schema and seed data imported successfully!\n\";
            }
        } else {
            echo \"[INIT] Database tables already present. Ready!\n\";
        }
        exit(0);
    } catch (\Throwable \$e) {
        echo \"[INIT] DB connecting... (\" . \$e->getMessage() . \")\n\";
        exit(1);
    }
    " && break

    sleep 3
done

echo "[INIT] Database init process finished."
exit 0
