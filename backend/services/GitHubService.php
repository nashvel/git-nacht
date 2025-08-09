<?php
class GitHubService {
    private $database;
    private $encryptionKey;
    private $encryptionMethod = 'AES-256-CBC';

    public function __construct($database) {
        $this->database = $database;
        $this->encryptionKey = hash('sha256', JWT_SECRET); // Derive encryption key from JWT secret
    }

    /**
     * Encrypt GitHub token for secure storage
     */
    private function encryptToken($token) {
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($token, $this->encryptionMethod, $this->encryptionKey, 0, $iv);
        return base64_encode($iv . $encrypted);
    }

    /**
     * Decrypt GitHub token for use
     */
    private function decryptToken($encryptedToken) {
        $data = base64_decode($encryptedToken);
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);
        return openssl_decrypt($encrypted, $this->encryptionMethod, $this->encryptionKey, 0, $iv);
    }

    /**
     * Save GitHub integration for a user
     */
    public function saveGitHubIntegration($userId, $githubToken, $githubUsername = null) {
        // Encrypt the token before storing
        $encryptedToken = $this->encryptToken($githubToken);
        
        // Get GitHub user info if username not provided
        if (!$githubUsername) {
            $userInfo = $this->getGitHubUserInfo($githubToken);
            if ($userInfo && isset($userInfo['login'])) {
                $githubUsername = $userInfo['login'];
            }
        }
        
        // Get token scopes
        $scopes = $this->getTokenScopes($githubToken);
        
        return $this->database->saveGitHubIntegration(
            $userId,
            $githubUsername,
            $encryptedToken,
            json_encode($scopes)
        );
    }

    /**
     * Get GitHub integration for a user
     */
    public function getGitHubIntegration($userId) {
        return $this->database->getGitHubIntegration($userId);
    }

    /**
     * Get decrypted GitHub token for API calls
     */
    public function getDecryptedToken($userId) {
        $integration = $this->database->getGitHubIntegration($userId);
        
        if (!$integration || !$integration['encrypted_token']) {
            return null;
        }
        
        return $this->decryptToken($integration['encrypted_token']);
    }

    /**
     * Remove GitHub integration
     */
    public function removeGitHubIntegration($userId) {
        return $this->database->removeGitHubIntegration($userId);
    }

    /**
     * Verify GitHub token is still valid
     */
    public function verifyToken($userId) {
        $token = $this->getDecryptedToken($userId);
        
        if (!$token) {
            return false;
        }
        
        $userInfo = $this->getGitHubUserInfo($token);
        return $userInfo !== false;
    }

    /**
     * Get GitHub user information
     */
    public function getGitHubUserInfo($token) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://api.github.com/user',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $token,
                'User-Agent: Git-Nacht/1.0',
                'Accept: application/vnd.github.v3+json'
            ],
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            return json_decode($response, true);
        }
        
        return false;
    }

    /**
     * Get token scopes
     */
    public function getTokenScopes($token) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://api.github.com/user',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HEADER => true,
            CURLOPT_NOBODY => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $token,
                'User-Agent: Git-Nacht/1.0'
            ],
            CURLOPT_TIMEOUT => 10
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        // Extract X-OAuth-Scopes header
        if (preg_match('/X-OAuth-Scopes: ([^\r\n]+)/', $response, $matches)) {
            return array_map('trim', explode(',', $matches[1]));
        }
        
        return [];
    }

    /**
     * Get repository information from GitHub API
     */
    public function getRepositoryInfo($userId, $repoUrl) {
        $token = $this->getDecryptedToken($userId);
        
        if (!$token) {
            return ['error' => 'No GitHub token found'];
        }
        
        // Parse repository URL to get owner/repo
        $repoPath = $this->parseRepositoryUrl($repoUrl);
        if (!$repoPath) {
            return ['error' => 'Invalid repository URL'];
        }
        
        $apiUrl = "https://api.github.com/repos/{$repoPath}";
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $token,
                'User-Agent: Git-Nacht/1.0',
                'Accept: application/vnd.github.v3+json'
            ],
            CURLOPT_TIMEOUT => 15
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $repoData = json_decode($response, true);
            return [
                'name' => $repoData['name'],
                'full_name' => $repoData['full_name'],
                'description' => $repoData['description'],
                'private' => $repoData['private'],
                'default_branch' => $repoData['default_branch'],
                'language' => $repoData['language'],
                'stars' => $repoData['stargazers_count'],
                'forks' => $repoData['forks_count'],
                'updated_at' => $repoData['updated_at']
            ];
        } elseif ($httpCode === 404) {
            return ['error' => 'Repository not found or no access'];
        } elseif ($httpCode === 401) {
            return ['error' => 'GitHub token invalid or expired'];
        }
        
        return ['error' => 'Failed to fetch repository information'];
    }

    /**
     * Get recent commits from GitHub API
     */
    public function getRecentCommits($userId, $repoUrl, $limit = 10) {
        $token = $this->getDecryptedToken($userId);
        
        $repoPath = $this->parseRepositoryUrl($repoUrl);
        if (!$repoPath) {
            return ['error' => 'Invalid repository URL'];
        }
        
        $apiUrl = "https://api.github.com/repos/{$repoPath}/commits?per_page={$limit}";
        
        $ch = curl_init();
        
        // Set up headers - include auth token if available, otherwise try public access
        $headers = [
            'User-Agent: Git-Nacht/1.0',
            'Accept: application/vnd.github.v3+json'
        ];
        
        if ($token) {
            $headers[] = 'Authorization: Bearer ' . $token;
        }
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 15
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $commits = json_decode($response, true);
            $formattedCommits = [];
            
            foreach ($commits as $commit) {
                $formattedCommits[] = [
                    'hash' => $commit['sha'],
                    'short_hash' => substr($commit['sha'], 0, 7),
                    'message' => $commit['commit']['message'],
                    'author_name' => $commit['commit']['author']['name'],
                    'author_email' => $commit['commit']['author']['email'],
                    'date' => $commit['commit']['author']['date'],
                    'url' => $commit['html_url']
                ];
            }
            
            return $formattedCommits;
        }
        
        return ['error' => 'Failed to fetch commits'];
    }

    /**
     * Parse repository URL to extract owner/repo path
     */
    private function parseRepositoryUrl($url) {
        // Handle various GitHub URL formats
        $patterns = [
            '/github\.com\/([^\/]+\/[^\/]+?)(?:\.git)?(?:\/.*)?$/',
            '/github\.com:([^\/]+\/[^\/]+?)(?:\.git)?$/'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }

    /**
     * Generate GitHub OAuth URL for token setup
     */
    public function getGitHubOAuthUrl($clientId, $redirectUri, $scopes = ['repo', 'user:email']) {
        $params = [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'scope' => implode(' ', $scopes),
            'state' => bin2hex(random_bytes(16)) // CSRF protection
        ];
        
        return 'https://github.com/login/oauth/authorize?' . http_build_query($params);
    }

    /**
     * Check if user has required GitHub scopes
     */
    public function hasRequiredScopes($userId, $requiredScopes = ['repo']) {
        $integration = $this->database->getGitHubIntegration($userId);
        
        if (!$integration || !$integration['token_scopes']) {
            return false;
        }
        
        $userScopes = json_decode($integration['token_scopes'], true) ?: [];
        
        foreach ($requiredScopes as $scope) {
            if (!in_array($scope, $userScopes)) {
                return false;
            }
        }
        
        return true;
    }
}
?>
