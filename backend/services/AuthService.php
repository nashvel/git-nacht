<?php
require_once __DIR__ . '/SessionService.php';

class AuthService {
    private $database;
    private $jwtSecret;
    private $sessionService;

    public function __construct($database) {
        $this->database = $database;
        $this->jwtSecret = JWT_SECRET;
        $this->sessionService = new SessionService($database);
    }

    public function createUserSession($user, $permanent = false, $deviceInfo = null, $ipAddress = null) {
        if ($permanent) {
            // Create permanent session
            return $this->sessionService->createPermanentSession($user, $deviceInfo, $ipAddress);
        } else {
            // Create temporary JWT session
            $payload = [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role'],
                'iat' => time(),
                'exp' => time() + JWT_EXPIRY
            ];

            $token = $this->generateJWT($payload);
            
            return [
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role']
                ],
                'expires_at' => date('c', $payload['exp']),
                'permanent' => false
            ];
        }
    }

    public function isAuthorized($token, $requiredRole = null) {
        try {
            // First try permanent session validation
            $sessionResult = $this->sessionService->validatePermanentSession($token);
            
            if ($sessionResult['valid']) {

                $user = $sessionResult['user'];
                
                // Check role if required

                if ($requiredRole && $user['role'] !== $requiredRole) {

                    return ['valid' => false, 'user' => null];
                }
                
                return ['valid' => true, 'user' => $user, 'type' => 'permanent'];
            }
            
            // If not permanent session, try JWT validation
            $payload = $this->verifyJWT($token);
            
            if (!$payload) {

                return ['valid' => false, 'user' => null];
            }

            // Check if token is expired
            if ($payload['exp'] < time()) {

                return ['valid' => false, 'user' => null];
            }

            // Check role if required

            if ($requiredRole && $payload['role'] !== $requiredRole) {

                return ['valid' => false, 'user' => null];
            }


            
            return [
                'valid' => true, 
                'user' => [
                    'id' => $payload['id'],
                    'email' => $payload['email'],
                    'name' => $payload['name'],
                    'role' => $payload['role']
                ],
                'type' => 'jwt'
            ];
        } catch (Exception $e) {
            error_log("Auth verification error: " . $e->getMessage());
            error_log("Auth verification stack trace: " . $e->getTraceAsString());
            return ['valid' => false, 'user' => null];
        }
    }

    private function generateJWT($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->jwtSecret, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    private function verifyJWT($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }

        list($base64Header, $base64Payload, $base64Signature) = $parts;

        $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Header)), true);
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);

        if (!$header || !$payload) {
            return false;
        }

        // Verify signature
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Signature));
        $expectedSignature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->jwtSecret, true);

        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }

        return $payload;
    }

    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    public function logout($token) {
        // Try to logout permanent session
        if ($this->sessionService->logout($token)) {
            return true;
        }
        
        // For JWT tokens, we can't invalidate them server-side
        // The client should just delete the token
        return true;
    }

    public function logoutAllDevices($userId) {
        return $this->sessionService->logoutAllDevices($userId);
    }

    public function getUserActiveSessions($userId) {
        return $this->sessionService->getUserActiveSessions($userId);
    }

    public function getSessionService() {
        return $this->sessionService;
    }
}
?>
