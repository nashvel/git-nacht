<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=git_nacht', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "📋 Current screenshots table structure:\n";
    $result = $pdo->query('DESCRIBE screenshots');
    while ($row = $result->fetch()) {
        echo "  - " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    
    // Check if file_path column exists
    $columns = $pdo->query("SHOW COLUMNS FROM screenshots LIKE 'file_path'")->fetchAll();
    
    if (empty($columns)) {
        echo "\n❌ file_path column missing. Adding it...\n";
        $pdo->exec('ALTER TABLE screenshots ADD COLUMN file_path VARCHAR(500)');
        echo "✅ Added file_path column to screenshots table\n";
    } else {
        echo "\n✅ file_path column already exists\n";
    }
    
    // Also check if image_path exists (your table might use this name)
    $imagePathColumns = $pdo->query("SHOW COLUMNS FROM screenshots LIKE 'image_path'")->fetchAll();
    if (!empty($imagePathColumns)) {
        echo "ℹ️  Found image_path column - CLI will be updated to use this\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
