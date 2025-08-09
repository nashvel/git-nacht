<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=git_nacht', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Add repository_url column to projects table
    $pdo->exec('ALTER TABLE projects ADD COLUMN repository_url TEXT');
    echo "✅ Added repository_url column to projects table\n";
    
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "✅ repository_url column already exists\n";
    } else {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
}
?>
