<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';
require_once 'models/Database.php';
require_once 'services/AuthService.php';
require_once 'services/GitService.php';
require_once 'services/ScreenshotService.php';
require_once 'services/GitHubService.php';
require_once 'models/Database.php';

// Initialize services
$database = new Database();
$authService = new AuthService($database);
$gitService = new GitService();
$screenshotService = new ScreenshotService();
$githubService = new GitHubService($database);

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim($path, '/');

// Remove base path if exists
$basePath = '/api';
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}

// Route handling
try {
    switch ($method) {
        case 'GET':
            handleGetRequest($path, $database, $authService, $gitService, $screenshotService, $githubService);
            break;
        case 'POST':
            handlePostRequest($path, $database, $authService, $gitService, $screenshotService, $githubService);
            break;
        case 'PUT':
            handlePutRequest($path, $database, $authService, $gitService, $screenshotService);
            break;
        case 'DELETE':
            handleDeleteRequest($path, $database, $authService, $gitService, $screenshotService);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}

function handleGetRequest($path, $database, $authService, $gitService, $screenshotService, $githubService) {
    switch ($path) {
        case '/health':
            echo json_encode([
                'status' => 'healthy',
                'timestamp' => date('c'),
                'version' => '1.0.0'
            ]);
            break;
            
        case '/auth/sessions':
            $user = requireAuth($authService);
            $sessions = $authService->getUserActiveSessions($user['id']);
            echo json_encode($sessions);
            break;
            
        case '/github/status':
            $user = requireAuth($authService);
            $integration = $githubService->getGitHubIntegration($user['id']);
            
            if ($integration) {
                $isValid = $githubService->verifyToken($user['id']);
                echo json_encode([
                    'connected' => true,
                    'username' => $integration['github_username'],
                    'valid' => $isValid,
                    'scopes' => json_decode($integration['token_scopes'] ?? '[]'),
                    'last_verified' => $integration['last_verified']
                ]);
            } else {
                echo json_encode(['connected' => false]);
            }
            break;
            
        case '/projects':
            $user = requireAuth();
            $projects = $database->getUserProjects($user['id']);
            echo json_encode($projects);
            break;
            
        case '/github/repo/info':
            $user = requireAuth();
            $repoUrl = $_GET['url'] ?? null;
            
            if (!$repoUrl) {
                http_response_code(400);
                echo json_encode(['error' => 'Repository URL required']);
                break;
            }
            
            $repoInfo = $githubService->getRepositoryInfo($user['id'], $repoUrl);
            echo json_encode($repoInfo);
            break;
            
        case '/github/repo/commits':
            $user = requireAuth();
            $repoUrl = $_GET['url'] ?? null;
            $limit = $_GET['limit'] ?? 10;
            
            if (!$repoUrl) {
                http_response_code(400);
                echo json_encode(['error' => 'Repository URL required']);
                break;
            }
            
            $commits = $githubService->getRecentCommits($user['id'], $repoUrl, $limit);
            echo json_encode($commits);
            break;
            
        case '/projects':
            $user = requireAuth($authService);
            $projects = $database->getProjects($user['id']);
            echo json_encode($projects);
            break;
            
        case '/screenshots':
            requireAuth($authService);
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 10;
            $projectId = $_GET['project_id'] ?? null;
            
            $screenshots = $database->getScreenshots($page, $limit, $projectId);
            echo json_encode($screenshots);
            break;
            
        default:
            if (preg_match('/^\/projects\/(\d+)$/', $path, $matches)) {
                $user = requireAuth();
                $projectId = $matches[1];
                $project = $database->getProject($projectId);
                
                if ($project) {
                    // Add GitHub repository info if available
                    $repoInfo = $githubService->getRepositoryInfo($user['id'], $project['repository']);
                    if (!isset($repoInfo['error'])) {
                        $project['github_info'] = $repoInfo;
                    }
                    
                    echo json_encode($project);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Project not found']);
                }
            } elseif (preg_match('/^\/screenshots\/(.+)$/', $path, $matches)) {
                $filename = $matches[1];
                $screenshotService->serveScreenshot($filename);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;
    }
}

function handlePostRequest($path, $database, $authService, $gitService, $screenshotService, $githubService) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($path) {
        case '/auth/login':
            if (!isset($input['email']) || !isset($input['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password required']);
                break;
            }
            
            $user = $database->getUserByEmail($input['email']);
            
            if (!$user || !$authService->verifyPassword($input['password'], $user['password_hash'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                break;
            }
            
            // Check if user wants permanent session
            $permanent = $input['remember_me'] ?? false;
            $deviceInfo = $authService->getSessionService()->getDeviceInfo(
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $_SERVER['REMOTE_ADDR'] ?? null
            );
            
            $session = $authService->createUserSession(
                $user, 
                $permanent, 
                $deviceInfo, 
                $_SERVER['REMOTE_ADDR'] ?? null
            );
            echo json_encode($session);
            break;
            
        case '/auth/logout':
            $user = requireAuth($authService);
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
            
            if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
                $authService->logout($token);
            }
            
            echo json_encode(['message' => 'Logged out successfully']);
            break;
            
        case '/auth/logout-all':
            $user = requireAuth($authService);
            $authService->logoutAllDevices($user['id']);
            echo json_encode(['message' => 'Logged out from all devices']);
            break;
            
        case '/auth/register':
            if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Name, email and password required']);
                break;
            }
            
            $existingUser = $database->getUserByEmail($input['email']);
            if ($existingUser) {
                http_response_code(409);
                echo json_encode(['error' => 'User already exists']);
                break;
            }
            
            $userId = $database->createUser($input['name'], $input['email'], $input['password']);
            
            if ($userId) {
                $user = $database->getUserById($userId);
                $session = $authService->createUserSession($user);
                echo json_encode([
                    'message' => 'Registration successful',
                    'token' => $session['token'],
                    'user' => $session['user'],
                    'expires_at' => $session['expires_at']
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create user']);
            }
            break;
            
        case '/projects':
            $user = requireAuth();
            if (!isset($input['repository']) || empty(trim($input['repository']))) {
                http_response_code(400);
                echo json_encode(['error' => 'Repository URL is required']);
                break;
            }
            
            // Auto-generate project name from repository URL if not provided
            $projectName = isset($input['name']) && !empty(trim($input['name'])) 
                ? trim($input['name']) 
                : basename(parse_url(rtrim($input['repository'], '/'), PHP_URL_PATH), '.git');
            
            // Detect language and framework from repository URL
            $language = 'Unknown';
            $framework = 'Unknown';
            
            // Try to get repository info from GitHub API to detect language
            if (strpos($input['repository'], 'github.com') !== false) {
                $repoPath = parse_url($input['repository'], PHP_URL_PATH);
                $repoPath = trim($repoPath, '/');
                $repoPath = str_replace('.git', '', $repoPath);
                
                // Simple language detection based on common patterns
                if (strpos(strtolower($projectName), 'react') !== false) {
                    $language = 'JavaScript';
                    $framework = 'React';
                } elseif (strpos(strtolower($projectName), 'vue') !== false) {
                    $language = 'JavaScript';
                    $framework = 'Vue.js';
                } elseif (strpos(strtolower($projectName), 'angular') !== false) {
                    $language = 'TypeScript';
                    $framework = 'Angular';
                } elseif (strpos(strtolower($projectName), 'php') !== false) {
                    $language = 'PHP';
                    $framework = 'PHP';
                } elseif (strpos(strtolower($projectName), 'python') !== false) {
                    $language = 'Python';
                    $framework = 'Python';
                } else {
                    // Default to JavaScript for most web projects
                    $language = 'JavaScript';
                    $framework = 'Web';
                }
            }
            
            // Validate repository URL
            if (!$gitService->validateRepositoryUrl($input['repository'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid repository URL']);
                break;
            }
            
            $projectData = [
                'name' => $projectName,
                'description' => $input['description'] ?? '',
                'repository' => $input['repository'],
                'language' => $language,
                'framework' => $framework,
                'user_id' => $user['id']
            ];
            
            $projectId = $database->createProject($projectData);
            
            if ($projectId) {
                $project = $database->getProject($projectId);
                
                // Try to get additional repository info from GitHub if integration exists
                $repoInfo = $githubService->getRepositoryInfo($user['id'], $input['repository']);
                if (!isset($repoInfo['error'])) {
                    $project['github_info'] = $repoInfo;
                }
                
                echo json_encode($project);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create project']);
            }
            break;
            
        case '/github/connect':
            $user = requireAuth($authService);
            if (!isset($input['github_token'])) {
                http_response_code(400);
                echo json_encode(['error' => 'GitHub token required']);
                break;
            }
            
            $success = $githubService->saveGitHubIntegration(
                $user['id'], 
                $input['github_token'],
                $input['github_username'] ?? null
            );
            
            if ($success) {
                echo json_encode(['message' => 'GitHub integration saved successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to save GitHub integration']);
            }
            break;
            
        case '/screenshots':
            $user = requireAuth($authService);
            if (!isset($input['commit_hash']) || !isset($input['url'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Commit hash and URL required']);
                break;
            }
            
            $screenshotData = [
                'commit_hash' => $input['commit_hash'],
                'commit_message' => $input['commit_message'] ?? '',
                'url' => $input['url'],
                'image_path' => $input['image_path'] ?? null,
                'branch_name' => $input['branch_name'] ?? 'main',
                'repository_path' => $input['repository_path'] ?? '',
                'user_id' => $user['id'],
                'project_id' => $input['project_id'] ?? null
            ];
            
            $screenshotId = $database->insertScreenshot($screenshotData);
            
            if ($screenshotId) {
                echo json_encode(['id' => $screenshotId, 'message' => 'Screenshot recorded']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to record screenshot']);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
}

function handlePutRequest($path, $database, $authService, $gitService, $screenshotService) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (preg_match('/^\/projects\/(\d+)$/', $path, $matches)) {
        requireAuth($authService);
        $projectId = $matches[1];
        $user = getCurrentUser($authService);
        
        $project = $database->getProject($projectId);
        if (!$project || $project['user_id'] !== $user['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }
        
        $updated = $database->updateProject($projectId, $input);
        if ($updated) {
            $project = $database->getProject($projectId);
            echo json_encode($project);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update project']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
}

function handleDeleteRequest($path, $database, $authService, $gitService, $screenshotService) {
    if (preg_match('/^\/projects\/(\d+)$/', $path, $matches)) {
        $user = requireAuth();
        $projectId = $matches[1];
        
        $deleted = $database->deleteProject($projectId, $user['id']);
        if ($deleted) {
            echo json_encode(['message' => 'Project deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete project']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
}

function requireAuth($requiredRole = null) {
    global $authService;
    
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    
    if (!$authHeader || !preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Authorization header missing or invalid']);
        exit;
    }
    
    $token = $matches[1];
    $authResult = $authService->isAuthorized($token, $requiredRole);
    
    if (!$authResult['valid']) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    return $authResult['user'];
}

function getCurrentUser($authService) {
    return $_SESSION['user'] ?? null;
}
?>
