<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=git_nacht', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Update project ID 6 (git-nacht) with the repository URL
    $stmt = $pdo->prepare('UPDATE projects SET repository_url = ? WHERE id = 6');
    $stmt->execute(['https://github.com/nashvel/git-nacht.git']);
    
    echo "✅ Updated git-nacht project (ID 6) with repository URL\n";
    
    // Verify the update
    $result = $pdo->query('SELECT id, name, repository_url FROM projects WHERE id = 6');
    $project = $result->fetch();
    if ($project) {
        echo "✅ Verification - Project 6: {$project['name']} | URL: {$project['repository_url']}\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
