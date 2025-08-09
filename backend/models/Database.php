<?php
class Database {
    private $connection;
    private $host;
    private $port;
    private $database;
    private $user;
    private $password;

    public function __construct() {
        $this->host = DB_HOST;
        $this->port = DB_PORT;
        $this->database = DB_NAME;
        $this->user = DB_USER;
        $this->password = DB_PASSWORD;
        
        // Auto-connect on instantiation
        $this->connect();
    }

    public function connect() {
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->database};charset=utf8mb4";
            $this->connection = new PDO($dsn, $this->user, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            return true;
        } catch (PDOException $e) {
            // If database doesn't exist, try to create it
            if (strpos($e->getMessage(), 'Unknown database') !== false) {
                return $this->createDatabaseAndConnect();
            }
            error_log("Database connection error: " . $e->getMessage());
            return false;
        }
    }

    private function createDatabaseAndConnect() {
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};charset=utf8mb4";
            $tempConnection = new PDO($dsn, $this->user, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
            
            $tempConnection->exec("CREATE DATABASE IF NOT EXISTS `{$this->database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $tempConnection = null;
            
            return $this->connect();
        } catch (PDOException $e) {
            error_log("Database creation error: " . $e->getMessage());
            return false;
        }
    }

    public function createTables() {
        if (!$this->connection) {
            if (!$this->connect()) {
                return false;
            }
        }

        try {
            // Users table
            $this->connection->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role ENUM('user', 'admin') DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            ");

            // Projects table
            $this->connection->exec("
                CREATE TABLE IF NOT EXISTS projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    repository VARCHAR(500) NOT NULL,
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");

            // Screenshots table
            $this->connection->exec("
                CREATE TABLE IF NOT EXISTS screenshots (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    commit_hash VARCHAR(40) NOT NULL,
                    commit_message TEXT,
                    url VARCHAR(500) NOT NULL,
                    image_path VARCHAR(500),
                    branch_name VARCHAR(255) DEFAULT 'main',
                    repository_path VARCHAR(500),
                    user_id INT,
                    project_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                    INDEX idx_commit_hash (commit_hash),
                    INDEX idx_user_id (user_id),
                    INDEX idx_project_id (project_id)
                )
            ");

            // Comments table
            $this->connection->exec("
                CREATE TABLE IF NOT EXISTS comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    screenshot_id INT NOT NULL,
                    user_id INT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (screenshot_id) REFERENCES screenshots(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");

            // Likes table
            $this->connection->exec("
                CREATE TABLE IF NOT EXISTS likes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    screenshot_id INT NOT NULL,
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (screenshot_id) REFERENCES screenshots(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_like (screenshot_id, user_id)
                )
            ");

            // User sessions table for permanent tokens
            $this->connection->exec("
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    token_hash VARCHAR(255) NOT NULL,
                    device_info TEXT,
                    ip_address VARCHAR(45),
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_token_hash (token_hash),
                    INDEX idx_user_id (user_id),
                    INDEX idx_active (is_active)
                )
            ");

            // GitHub integrations table for secure token storage
            $this->connection->exec("
                CREATE TABLE IF NOT EXISTS github_integrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    github_username VARCHAR(255),
                    encrypted_token TEXT NOT NULL,
                    token_scopes TEXT,
                    last_verified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_github (user_id)
                )
            ");

            return true;
        } catch (PDOException $e) {
            error_log("Table creation error: " . $e->getMessage());
            return false;
        }
    }

    public function createAdminUser() {
        try {
            $adminEmail = 'admin@gitnacht.com';
            $adminPassword = 'admin123';
            $adminName = 'Administrator';

            $stmt = $this->connection->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$adminEmail]);
            
            if ($stmt->fetch()) {
                return true; // Admin already exists
            }

            $passwordHash = password_hash($adminPassword, PASSWORD_DEFAULT);
            $stmt = $this->connection->prepare("
                INSERT INTO users (name, email, password_hash, role) 
                VALUES (?, ?, ?, 'admin')
            ");
            
            return $stmt->execute([$adminName, $adminEmail, $passwordHash]);
        } catch (PDOException $e) {
            error_log("Admin user creation error: " . $e->getMessage());
            return false;
        }
    }

    public function getUserByEmail($email) {
        try {
            $stmt = $this->connection->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Get user by email error: " . $e->getMessage());
            return false;
        }
    }

    public function getUserById($id) {
        try {
            $stmt = $this->connection->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Get user by ID error: " . $e->getMessage());
            return false;
        }
    }

    public function createUser($name, $email, $password) {
        try {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->connection->prepare("
                INSERT INTO users (name, email, password_hash) 
                VALUES (?, ?, ?)
            ");
            
            if ($stmt->execute([$name, $email, $passwordHash])) {
                return $this->connection->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            error_log("Create user error: " . $e->getMessage());
            return false;
        }
    }

    public function getProjects($userId = null) {
        try {
            $sql = "
                SELECT p.*, u.name as user_name, u.email as user_email,
                       COUNT(DISTINCT s.id) as screenshot_count
                FROM projects p
                LEFT JOIN users u ON p.user_id = u.id
                LEFT JOIN screenshots s ON p.id = s.project_id
            ";
            
            $params = [];
            if ($userId) {
                $sql .= " WHERE p.user_id = ?";
                $params[] = $userId;
            }
            
            $sql .= " GROUP BY p.id ORDER BY p.updated_at DESC";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Get projects error: " . $e->getMessage());
            return [];
        }
    }

    // Removed duplicate getProject method - using the more complete one below

    // Removed duplicate createProject method - using the one with timestamps below

    public function updateProject($id, $data) {
        try {
            $fields = [];
            $values = [];
            
            if (isset($data['name'])) {
                $fields[] = 'name = ?';
                $values[] = $data['name'];
            }
            if (isset($data['description'])) {
                $fields[] = 'description = ?';
                $values[] = $data['description'];
            }
            if (isset($data['repository'])) {
                $fields[] = 'repository = ?';
                $values[] = $data['repository'];
            }
            
            if (empty($fields)) {
                return true;
            }
            
            $values[] = $id;
            $sql = "UPDATE projects SET " . implode(', ', $fields) . " WHERE id = ?";
            
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($values);
        } catch (PDOException $e) {
            error_log("Update project error: " . $e->getMessage());
            return false;
        }
    }



    public function deleteGitHubIntegration($userId) {
        try {
            $stmt = $this->connection->prepare("DELETE FROM github_integrations WHERE user_id = ?");
            return $stmt->execute([$userId]);
        } catch (PDOException $e) {
            error_log("Delete GitHub integration error: " . $e->getMessage());
            return false;
        }
    }

    // Project Management Methods
    public function createProject($projectData) {
        try {
            $stmt = $this->connection->prepare("
                INSERT INTO projects (name, description, repository, language, framework, user_id, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $success = $stmt->execute([
                $projectData['name'],
                $projectData['description'],
                $projectData['repository'],
                $projectData['language'] ?? 'JavaScript',
                $projectData['framework'] ?? 'Web',
                $projectData['user_id']
            ]);
            
            return $success ? $this->connection->lastInsertId() : false;
        } catch (PDOException $e) {
            error_log("Create project error: " . $e->getMessage());
            return false;
        }
    }

    public function getUserProjects($userId) {
        try {
            $stmt = $this->connection->prepare("
                SELECT p.*, 
                       COUNT(DISTINCT s.id) as screenshot_count,
                       0 as commit_count
                FROM projects p 
                LEFT JOIN screenshots s ON p.id = s.project_id 
                WHERE p.user_id = ? 
                GROUP BY p.id 
                ORDER BY p.updated_at DESC
            ");
            
            $stmt->execute([$userId]);
            $projects = $stmt->fetchAll();
            
            // Format projects for frontend
            return array_map(function($project) {
                return [
                    'id' => (int)$project['id'],
                    'name' => $project['name'],
                    'description' => $project['description'],
                    'repository' => $project['repository'],
                    'screenshotCount' => (int)$project['screenshot_count'],
                    'commitCount' => (int)$project['commit_count'],
                    'lastCommit' => $project['updated_at'],
                    'status' => 'active',
                    'language' => $project['language'] ?? 'JavaScript',
                    'framework' => $project['framework'] ?? 'Web',
                    'lastActivity' => $this->formatTimeAgo($project['updated_at']),
                    'contributors' => 1, // TODO: Extract from repo
                    'stars' => 0, // TODO: Extract from repo
                    'coverage' => 0 // TODO: Calculate from data
                ];
            }, $projects);
        } catch (PDOException $e) {
            error_log("Get user projects error: " . $e->getMessage());
            return [];
        }
    }

    public function getProject($projectId) {
        try {
            $stmt = $this->connection->prepare("
                SELECT p.*, 
                       COUNT(DISTINCT s.id) as screenshot_count,
                       0 as commit_count
                FROM projects p 
                LEFT JOIN screenshots s ON p.id = s.project_id 
                WHERE p.id = ? 
                GROUP BY p.id
            ");
            
            $stmt->execute([$projectId]);
            $project = $stmt->fetch();
            
            if (!$project) {
                return false;
            }
            
            return [
                'id' => (int)$project['id'],
                'name' => $project['name'],
                'description' => $project['description'],
                'repository' => $project['repository'],
                'screenshotCount' => (int)$project['screenshot_count'],
                'commitCount' => (int)$project['commit_count'],
                'lastCommit' => $project['updated_at'],
                'status' => 'active',
                'language' => $project['language'] ?? 'JavaScript',
                'framework' => $project['framework'] ?? 'Web',
                'lastActivity' => $this->formatTimeAgo($project['updated_at']),
                'contributors' => 1,
                'stars' => 0,
                'coverage' => 0,
                'createdAt' => $project['created_at'],
                'updatedAt' => $project['updated_at']
            ];
        } catch (PDOException $e) {
            error_log("Get project error: " . $e->getMessage());
            return null;
        }
    }

    public function deleteProject($projectId, $userId) {
        try {
            // First delete related data (screenshots, etc.)
            $stmt = $this->connection->prepare("DELETE FROM screenshots WHERE project_id = ?");
            $stmt->execute([$projectId]);
            
            // Then delete the project (only if it belongs to the user)
            $stmt = $this->connection->prepare("DELETE FROM projects WHERE id = ? AND user_id = ?");
            return $stmt->execute([$projectId, $userId]);
        } catch (PDOException $e) {
            error_log("Delete project error: " . $e->getMessage());
            return false;
        }
    }

    public function getAllProjects() {
        try {
            $stmt = $this->connection->prepare("SELECT * FROM projects ORDER BY created_at DESC");
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Get all projects error: " . $e->getMessage());
            return [];
        }
    }

    public function getAllScreenshots() {
        try {
            $stmt = $this->connection->prepare("SELECT * FROM screenshots ORDER BY created_at DESC");
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Get all screenshots error: " . $e->getMessage());
            return [];
        }
    }

    public function deleteScreenshot($id) {
        try {
            $stmt = $this->connection->prepare("DELETE FROM screenshots WHERE id = ?");
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            error_log("Delete screenshot error: " . $e->getMessage());
            return false;
        }
    }

    private function formatTimeAgo($datetime) {
        $time = time() - strtotime($datetime);
        
        if ($time < 60) return 'just now';
        if ($time < 3600) return floor($time/60) . ' minutes ago';
        if ($time < 86400) return floor($time/3600) . ' hours ago';
        if ($time < 2592000) return floor($time/86400) . ' days ago';
        if ($time < 31536000) return floor($time/2592000) . ' months ago';
        return floor($time/31536000) . ' years ago';
    }

    public function getScreenshots($page = 1, $limit = 10, $projectId = null) {
        try {
            $offset = ($page - 1) * $limit;
            
            $sql = "
                SELECT s.*, u.name as user_name, u.email as user_email,
                       p.name as project_name,
                       COUNT(DISTINCT c.id) as comment_count,
                       COUNT(DISTINCT l.id) as like_count
                FROM screenshots s
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN projects p ON s.project_id = p.id
                LEFT JOIN comments c ON s.id = c.screenshot_id
                LEFT JOIN likes l ON s.id = l.screenshot_id
            ";
            
            $params = [];
            if ($projectId) {
                $sql .= " WHERE s.project_id = ?";
                $params[] = $projectId;
            }
            
            $sql .= " GROUP BY s.id ORDER BY s.created_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Get screenshots error: " . $e->getMessage());
            return [];
        }
    }

    public function insertScreenshot($data) {
        try {
            $stmt = $this->connection->prepare("
                INSERT INTO screenshots (commit_hash, commit_message, url, image_path, 
                                       branch_name, repository_path, user_id, project_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            if ($stmt->execute([
                $data['commit_hash'],
                $data['commit_message'] ?? '',
                $data['url'],
                $data['image_path'] ?? null,
                $data['branch_name'] ?? 'main',
                $data['repository_path'] ?? '',
                $data['user_id'] ?? null,
                $data['project_id'] ?? null
            ])) {
                return $this->connection->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            error_log("Insert screenshot error: " . $e->getMessage());
            return false;
        }
    }

    // Session management methods
    public function createUserSession($userId, $tokenHash, $deviceInfo = null, $ipAddress = null, $expiresAt = null) {
        try {
            $stmt = $this->connection->prepare("
                INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            if ($stmt->execute([$userId, $tokenHash, $deviceInfo, $ipAddress, $expiresAt])) {
                return $this->connection->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            error_log("Create user session error: " . $e->getMessage());
            return false;
        }
    }

    public function getUserSession($tokenHash) {
        try {
            $stmt = $this->connection->prepare("
                SELECT s.*, u.name, u.email, u.role 
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token_hash = ? AND s.is_active = TRUE
                AND (s.expires_at IS NULL OR s.expires_at > NOW())
            ");
            $stmt->execute([$tokenHash]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Get user session error: " . $e->getMessage());
            return false;
        }
    }

    public function updateSessionActivity($tokenHash) {
        try {
            $stmt = $this->connection->prepare("
                UPDATE user_sessions 
                SET last_activity = CURRENT_TIMESTAMP 
                WHERE token_hash = ? AND is_active = TRUE
            ");
            return $stmt->execute([$tokenHash]);
        } catch (PDOException $e) {
            error_log("Update session activity error: " . $e->getMessage());
            return false;
        }
    }

    public function deactivateUserSession($tokenHash) {
        try {
            $stmt = $this->connection->prepare("
                UPDATE user_sessions 
                SET is_active = FALSE 
                WHERE token_hash = ?
            ");
            return $stmt->execute([$tokenHash]);
        } catch (PDOException $e) {
            error_log("Deactivate user session error: " . $e->getMessage());
            return false;
        }
    }

    public function deactivateAllUserSessions($userId) {
        try {
            $stmt = $this->connection->prepare("
                UPDATE user_sessions 
                SET is_active = FALSE 
                WHERE user_id = ?
            ");
            return $stmt->execute([$userId]);
        } catch (PDOException $e) {
            error_log("Deactivate all user sessions error: " . $e->getMessage());
            return false;
        }
    }

    // GitHub integration methods
    public function saveGitHubIntegration($userId, $githubUsername, $encryptedToken, $scopes = null) {
        try {
            $stmt = $this->connection->prepare("
                INSERT INTO github_integrations (user_id, github_username, encrypted_token, token_scopes) 
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                github_username = VALUES(github_username),
                encrypted_token = VALUES(encrypted_token),
                token_scopes = VALUES(token_scopes),
                last_verified = CURRENT_TIMESTAMP,
                is_active = TRUE
            ");
            
            return $stmt->execute([$userId, $githubUsername, $encryptedToken, $scopes]);
        } catch (PDOException $e) {
            error_log("Save GitHub integration error: " . $e->getMessage());
            return false;
        }
    }

    public function getGitHubIntegration($userId) {
        try {
            $stmt = $this->connection->prepare("
                SELECT * FROM github_integrations 
                WHERE user_id = ? AND is_active = TRUE
            ");
            $stmt->execute([$userId]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Get GitHub integration error: " . $e->getMessage());
            return false;
        }
    }

    public function removeGitHubIntegration($userId) {
        try {
            $stmt = $this->connection->prepare("
                UPDATE github_integrations 
                SET is_active = FALSE 
                WHERE user_id = ?
            ");
            return $stmt->execute([$userId]);
        } catch (PDOException $e) {
            error_log("Remove GitHub integration error: " . $e->getMessage());
            return false;
        }
    }

    public function getConnection() {
        return $this->connection;
    }

    public function disconnect() {
        $this->connection = null;
    }
}
?>
