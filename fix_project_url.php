<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=git_nacht', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // First, let's see what projects exist
    echo "📋 Current projects:\n";
    $result = $pdo->query('SELECT id, name, repository_url FROM projects');
    while ($row = $result->fetch()) {
        echo "  ID: {$row['id']} | Name: {$row['name']} | URL: {$row['repository_url']}\n";
    }
    
    // Update the first project with the correct repository URL
    $stmt = $pdo->prepare('UPDATE projects SET repository_url = ? WHERE id = 1');
    $stmt->execute(['https://github.com/nashvel/git-nacht.git']);
    
    echo "\n✅ Updated project ID 1 with repository URL: https://github.com/nashvel/git-nacht.git\n";
    
    // Verify the update
    $result = $pdo->query('SELECT id, name, repository_url FROM projects WHERE id = 1');
    $project = $result->fetch();
    if ($project) {
        echo "✅ Verification - Project 1: {$project['name']} | URL: {$project['repository_url']}\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
