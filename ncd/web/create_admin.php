<?php
try {
    $db = new PDO('mysql:host=127.0.0.1;dbname=ncd', 'root', 'Kirub@2001');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("SET SESSION sql_mode = ''");

    // Create admin user
    $stmt = $db->prepare("INSERT IGNORE INTO cms_users (users_name, password, users_role_id, status) VALUES (:username, :password, :role, 1)");
    // Try the actual column names based on standard conventions or what we saw earlier
    // If users_role_id doesn't exist, it might fail. Let's try to fetch columns first.
    
    $result = $db->query("SHOW COLUMNS FROM cms_users");
    $columns = $result->fetchAll(PDO::FETCH_COLUMN);
    
    // Output the columns to see what they actually are
    echo "Columns: " . implode(', ', $columns) . "<br>";
    
    // We will do a generic insert based on what we find.
    // If it has 'users_name' and 'password':
        // Update admin
        $admin_pwd = md5('admin123');
        $db->exec("UPDATE cms_users SET password = '$admin_pwd', status = 1 WHERE users_name = 'admin_user'");
        echo "Successfully updated admin_user password to 'admin123'<br>";
        
        // Update deo
        $deo_pwd = md5('deo123');
        // Try inserting first using IGNORE, then UPDATE
        $db->exec("INSERT IGNORE INTO cms_users (users_name, password, status, auth_key) VALUES ('deo_01', '$deo_pwd', 1, 'dummy_key')");
        $db->exec("UPDATE cms_users SET password = '$deo_pwd', status = 1 WHERE users_name = 'deo_01'");
        echo "Successfully updated deo_01 password to 'deo123'<br>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
