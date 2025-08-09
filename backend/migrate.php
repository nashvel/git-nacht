<?php
require_once 'config/database.php';
require_once 'models/Database.php';

echo "🔄 Git Nacht Database Migration Tool\n\n";

class DatabaseMigrator {
    private $oldDb;
    private $newDb;
    
    public function __construct() {
        $this->newDb = new Database();
    }
    
    public function connectToOldDatabase($oldDbName = 'visual_patch_notes') {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname={$oldDbName};charset=utf8mb4";
            $this->oldDb = new PDO($dsn, DB_USER, DB_PASSWORD, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            return true;
        } catch (PDOException $e) {
            echo "⚠️  Could not connect to old database '{$oldDbName}': " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    public function checkOldDatabaseExists($oldDbName = 'visual_patch_notes') {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
            $tempDb = new PDO($dsn, DB_USER, DB_PASSWORD, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            
            $stmt = $tempDb->prepare("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?");
            $stmt->execute([$oldDbName]);
            
            return $stmt->fetch() !== false;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    public function listAvailableDatabases() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
            $tempDb = new PDO($dsn, DB_USER, DB_PASSWORD, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            
            $stmt = $tempDb->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')");
            $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            return $databases;
        } catch (PDOException $e) {
            return [];
        }
    }
    
    public function migrateUsers() {
        try {
            echo "👥 Migrating users...\n";
            
            $stmt = $this->oldDb->query("SELECT * FROM users");
            $users = $stmt->fetchAll();
            
            if (empty($users)) {
                echo "   ℹ️  No users found in old database\n";
                return true;
            }
            
            $newDbConn = $this->newDb->getConnection();
            $insertStmt = $newDbConn->prepare("
                INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                email = VALUES(email),
                role = VALUES(role),
                updated_at = VALUES(updated_at)
            ");
            
            $migrated = 0;
            foreach ($users as $user) {
                $insertStmt->execute([
                    $user['id'],
                    $user['name'],
                    $user['email'],
                    $user['password_hash'],
                    $user['role'] ?? 'user',
                    $user['created_at'],
                    $user['updated_at'] ?? $user['created_at']
                ]);
                $migrated++;
            }
            
            echo "   ✅ Migrated {$migrated} users\n";
            return true;
            
        } catch (PDOException $e) {
            echo "   ❌ Error migrating users: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    public function migrateProjects() {
        try {
            echo "📁 Migrating projects...\n";
            
            $stmt = $this->oldDb->query("SELECT * FROM projects");
            $projects = $stmt->fetchAll();
            
            if (empty($projects)) {
                echo "   ℹ️  No projects found in old database\n";
                return true;
            }
            
            $newDbConn = $this->newDb->getConnection();
            $insertStmt = $newDbConn->prepare("
                INSERT INTO projects (id, name, description, repository, user_id, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                repository = VALUES(repository),
                updated_at = VALUES(updated_at)
            ");
            
            $migrated = 0;
            foreach ($projects as $project) {
                $insertStmt->execute([
                    $project['id'],
                    $project['name'],
                    $project['description'] ?? '',
                    $project['repository'] ?? '',
                    $project['user_id'],
                    $project['created_at'],
                    $project['updated_at'] ?? $project['created_at']
                ]);
                $migrated++;
            }
            
            echo "   ✅ Migrated {$migrated} projects\n";
            return true;
            
        } catch (PDOException $e) {
            echo "   ❌ Error migrating projects: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    public function migrateScreenshots() {
        try {
            echo "📸 Migrating screenshots...\n";
            
            $stmt = $this->oldDb->query("SELECT * FROM screenshots");
            $screenshots = $stmt->fetchAll();
            
            if (empty($screenshots)) {
                echo "   ℹ️  No screenshots found in old database\n";
                return true;
            }
            
            $newDbConn = $this->newDb->getConnection();
            $insertStmt = $newDbConn->prepare("
                INSERT INTO screenshots (id, commit_hash, commit_message, url, image_path, branch_name, repository_path, user_id, project_id, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                commit_message = VALUES(commit_message),
                url = VALUES(url),
                image_path = VALUES(image_path),
                branch_name = VALUES(branch_name),
                repository_path = VALUES(repository_path)
            ");
            
            $migrated = 0;
            foreach ($screenshots as $screenshot) {
                $insertStmt->execute([
                    $screenshot['id'],
                    $screenshot['commit_hash'],
                    $screenshot['commit_message'] ?? '',
                    $screenshot['url'],
                    $screenshot['image_path'] ?? null,
                    $screenshot['branch_name'] ?? 'main',
                    $screenshot['repository_path'] ?? '',
                    $screenshot['user_id'] ?? null,
                    $screenshot['project_id'] ?? null,
                    $screenshot['created_at']
                ]);
                $migrated++;
            }
            
            echo "   ✅ Migrated {$migrated} screenshots\n";
            return true;
            
        } catch (PDOException $e) {
            echo "   ❌ Error migrating screenshots: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    public function migrateAll($oldDbName) {
        echo "🚀 Starting migration from '{$oldDbName}' to '" . DB_NAME . "'...\n\n";
        
        // Connect to old database
        if (!$this->connectToOldDatabase($oldDbName)) {
            return false;
        }
        
        // Connect to new database and ensure tables exist
        if (!$this->newDb->connect()) {
            echo "❌ Could not connect to new database\n";
            return false;
        }
        
        if (!$this->newDb->createTables()) {
            echo "❌ Could not create tables in new database\n";
            return false;
        }
        
        // Perform migrations
        $success = true;
        $success &= $this->migrateUsers();
        $success &= $this->migrateProjects();
        $success &= $this->migrateScreenshots();
        
        if ($success) {
            echo "\n🎉 Migration completed successfully!\n";
            echo "📊 Migration Summary:\n";
            $this->showMigrationSummary();
        } else {
            echo "\n⚠️  Migration completed with some errors. Please check the output above.\n";
        }
        
        return $success;
    }
    
    public function showMigrationSummary() {
        try {
            $newDbConn = $this->newDb->getConnection();
            
            $userCount = $newDbConn->query("SELECT COUNT(*) FROM users")->fetchColumn();
            $projectCount = $newDbConn->query("SELECT COUNT(*) FROM projects")->fetchColumn();
            $screenshotCount = $newDbConn->query("SELECT COUNT(*) FROM screenshots")->fetchColumn();
            
            echo "   👥 Users: {$userCount}\n";
            echo "   📁 Projects: {$projectCount}\n";
            echo "   📸 Screenshots: {$screenshotCount}\n";
            
        } catch (PDOException $e) {
            echo "   ❌ Could not generate summary: " . $e->getMessage() . "\n";
        }
    }
}

// Main execution
$migrator = new DatabaseMigrator();

// Check for command line arguments
$oldDbName = $argv[1] ?? null;

if (!$oldDbName) {
    echo "📋 Available databases:\n";
    $databases = $migrator->listAvailableDatabases();
    
    if (empty($databases)) {
        echo "   ❌ No databases found or could not connect to MySQL\n";
        exit(1);
    }
    
    foreach ($databases as $db) {
        echo "   • {$db}\n";
    }
    
    echo "\n💡 Usage: php migrate.php <old_database_name>\n";
    echo "   Example: php migrate.php visual_patch_notes\n\n";
    
    // Try common database names
    $commonNames = ['visual_patch_notes', 'git_patch_notes', 'gitnacht'];
    foreach ($commonNames as $name) {
        if (in_array($name, $databases)) {
            echo "🔍 Found potential database: {$name}\n";
            echo "   Run: php migrate.php {$name}\n";
        }
    }
    
    exit(0);
}

// Check if old database exists
if (!$migrator->checkOldDatabaseExists($oldDbName)) {
    echo "❌ Database '{$oldDbName}' does not exist\n";
    echo "📋 Available databases:\n";
    $databases = $migrator->listAvailableDatabases();
    foreach ($databases as $db) {
        echo "   • {$db}\n";
    }
    exit(1);
}

// Perform migration
$success = $migrator->migrateAll($oldDbName);
exit($success ? 0 : 1);
?>
