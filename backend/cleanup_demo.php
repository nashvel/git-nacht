<?php
require_once 'config/database.php';
require_once 'models/Database.php';

echo "🧹 Cleaning up demo projects...\n\n";

try {
    $database = new Database();
    
    // Get all projects to see what we're removing
    $projects = $database->getAllProjects();
    
    if (empty($projects)) {
        echo "✅ No projects found - database is already clean!\n";
        exit(0);
    }
    
    echo "📋 Found " . count($projects) . " projects to remove:\n";
    foreach ($projects as $project) {
        echo "   - {$project['name']} (ID: {$project['id']})\n";
    }
    echo "\n";
    
    // Remove all screenshots first (to maintain referential integrity)
    $screenshots = $database->getAllScreenshots();
    if (!empty($screenshots)) {
        echo "🖼️  Removing " . count($screenshots) . " screenshots...\n";
        foreach ($screenshots as $screenshot) {
            $database->deleteScreenshot($screenshot['id']);
        }
        echo "✅ Screenshots removed\n\n";
    }
    
    // Remove all projects
    echo "📁 Removing all projects...\n";
    $stmt = $database->connection->prepare("DELETE FROM projects");
    $stmt->execute();
    
    // Reset auto-increment
    $stmt = $database->connection->prepare("ALTER TABLE projects AUTO_INCREMENT = 1");
    $stmt->execute();
    
    $stmt = $database->connection->prepare("ALTER TABLE screenshots AUTO_INCREMENT = 1");
    $stmt->execute();
    
    echo "✅ All demo projects removed successfully!\n";
    echo "🎉 Database is now clean and ready for real projects!\n\n";
    
    echo "📊 Final status:\n";
    echo "   - Projects: 0\n";
    echo "   - Screenshots: 0\n";
    echo "   - Users: 1 (admin account preserved)\n\n";
    
    echo "🚀 You can now create your first real project!\n";
    
} catch (Exception $e) {
    echo "❌ Error cleaning up demo data: " . $e->getMessage() . "\n";
    exit(1);
}
?>
