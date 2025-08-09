<?php
class SessionService {
    private $database;
    private $encryptionKey;

    public function __construct($database) {
        $this->database = $database;
        $this->encryptionKey = JWT_SECRET; // Use JWT secret as encryption key
    }

    public function createPermanentSession($user, $deviceInfo = null, $ipAddress = null) {
        // Generate a secure permanent token
        $permanentToken = $this->generateSecureToken();
        $tokenHash = hash('sha256', $permanentToken);
        
        // Store session in database (no expiration for permanent sessions)
        $sessionId = $this->database->createUserSession(
            $user['id'],
            $tokenHash,
            $deviceInfo,
            $ipAddress,
            null // No expiration for permanent sessions
        );

        if ($sessionId) {
            return [
                'token' => $permanentToken,
                'session_id' => $sessionId,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role']
                ],
                'permanent' => true
            ];
        }

        return false;
    }

    public function validatePermanentSession($token) {
        if (!$token) {
            return ['valid' => false, 'user' => null];
        }

        $tokenHash = hash('sha256', $token);
        $session = $this->database->getUserSession($tokenHash);

        if (!$session) {
            return ['valid' => false, 'user' => null];
        }

        // Update last activity
        $this->database->updateSessionActivity($tokenHash);

        return [
            'valid' => true,
            'user' => [
                'id' => $session['user_id'],
                'email' => $session['email'],
                'name' => $session['name'],
                'role' => $session['role']
            ],
            'session' => $session
        ];
    }

    public function logout($token) {
        if (!$token) {
            return false;
        }

        $tokenHash = hash('sha256', $token);
        return $this->database->deactivateUserSession($tokenHash);
    }

    public function logoutAllDevices($userId) {
        return $this->database->deactivateAllUserSessions($userId);
    }

    public function getUserActiveSessions($userId) {
        try {
            $connection = $this->database->getConnection();
            $stmt = $connection->prepare("
                SELECT id, device_info, ip_address, last_activity, created_at
                FROM user_sessions 
                WHERE user_id = ? AND is_active = TRUE
                ORDER BY last_activity DESC
            ");
            $stmt->execute([$userId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Get user active sessions error: " . $e->getMessage());
            return [];
        }
    }

    public function cleanupExpiredSessions() {
        try {
            $connection = $this->database->getConnection();
            $stmt = $connection->prepare("
                UPDATE user_sessions 
                SET is_active = FALSE 
                WHERE expires_at IS NOT NULL AND expires_at < NOW()
            ");
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Cleanup expired sessions error: " . $e->getMessage());
            return false;
        }
    }

    private function generateSecureToken($length = 64) {
        // Generate cryptographically secure random token
        $bytes = random_bytes($length);
        return bin2hex($bytes);
    }

    public function getDeviceInfo($userAgent = null, $ipAddress = null) {
        $deviceInfo = [];
        
        if ($userAgent) {
            // Parse user agent for device information
            $deviceInfo['user_agent'] = $userAgent;
            
            // Basic device detection
            if (preg_match('/Mobile|Android|iPhone|iPad/', $userAgent)) {
                $deviceInfo['device_type'] = 'mobile';
            } elseif (preg_match('/Tablet|iPad/', $userAgent)) {
                $deviceInfo['device_type'] = 'tablet';
            } else {
                $deviceInfo['device_type'] = 'desktop';
            }
            
            // Browser detection
            if (preg_match('/Chrome/', $userAgent)) {
                $deviceInfo['browser'] = 'Chrome';
            } elseif (preg_match('/Firefox/', $userAgent)) {
                $deviceInfo['browser'] = 'Firefox';
            } elseif (preg_match('/Safari/', $userAgent)) {
                $deviceInfo['browser'] = 'Safari';
            } elseif (preg_match('/Edge/', $userAgent)) {
                $deviceInfo['browser'] = 'Edge';
            }
        }
        
        if ($ipAddress) {
            $deviceInfo['ip_address'] = $ipAddress;
        }
        
        return json_encode($deviceInfo);
    }
}
?>
