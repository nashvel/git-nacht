<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=git_nacht', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "📋 Current users table structure:\n";
    $result = $pdo->query('DESCRIBE users');
    while ($row = $result->fetch()) {
        echo "  - " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    
    echo "\n📋 Current users in database:\n";
    $result = $pdo->query('SELECT id, email FROM users');
    while ($row = $result->fetch()) {
        echo "  ID: {$row['id']} | Email: {$row['email']}\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
