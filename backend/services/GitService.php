<?php
class GitService {
    public function extractRepoName($repositoryUrl) {
        // Extract repository name from URL
        $url = rtrim($repositoryUrl, '/');
        $parts = explode('/', $url);
        $repoName = end($parts);
        
        // Remove .git extension if present
        if (substr($repoName, -4) === '.git') {
            $repoName = substr($repoName, 0, -4);
        }
        
        return $repoName ?: 'Unknown Repository';
    }

    public function validateRepositoryUrl($url) {
        // Basic URL validation
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        // Check if it's a common Git hosting service
        $validHosts = [
            'github.com',
            'gitlab.com',
            'bitbucket.org',
            'dev.azure.com',
            'sourceforge.net'
        ];

        $host = parse_url($url, PHP_URL_HOST);
        
        // Allow any host that contains git or ends with common patterns
        if (strpos($host, 'git') !== false || 
            in_array($host, $validHosts) ||
            preg_match('/\.(git|com|org|net)$/', $host)) {
            return true;
        }

        return false;
    }

    public function parseGitNachtCommand($command) {
        // Parse git nacht command to extract URL
        if (preg_match('/git\s+nacht\s+(?:-url\s+)?["\']?([^"\']+)["\']?/', $command, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }

    public function isCommitCommand($command) {
        // Check if command is a git commit command
        return preg_match('/git\s+commit/', $command) === 1;
    }

    public function getRepositoryInfo($path = '.') {
        // Get basic repository information
        $info = [
            'name' => $this->extractRepoName($path),
            'path' => realpath($path),
            'branch' => $this->getCurrentBranch($path),
            'remote_url' => $this->getRemoteUrl($path),
            'latest_commit' => $this->getLatestCommit($path)
        ];

        return $info;
    }

    private function getCurrentBranch($path = '.') {
        $command = "cd " . escapeshellarg($path) . " && git rev-parse --abbrev-ref HEAD 2>/dev/null";
        $output = shell_exec($command);
        return $output ? trim($output) : 'main';
    }

    private function getRemoteUrl($path = '.') {
        $command = "cd " . escapeshellarg($path) . " && git config --get remote.origin.url 2>/dev/null";
        $output = shell_exec($command);
        return $output ? trim($output) : null;
    }

    private function getLatestCommit($path = '.') {
        $command = "cd " . escapeshellarg($path) . " && git log -1 --format='%H|%h|%s|%an|%ae|%ad' --date=iso 2>/dev/null";
        $output = shell_exec($command);
        
        if (!$output) {
            return null;
        }

        $parts = explode('|', trim($output));
        if (count($parts) >= 6) {
            return [
                'hash' => $parts[0],
                'short_hash' => $parts[1],
                'message' => $parts[2],
                'author_name' => $parts[3],
                'author_email' => $parts[4],
                'date' => $parts[5]
            ];
        }

        return null;
    }

    public function isGitRepository($path = '.') {
        $gitDir = $path . '/.git';
        return is_dir($gitDir) || is_file($gitDir);
    }

    public function getCommitHistory($path = '.', $limit = 10) {
        $command = "cd " . escapeshellarg($path) . " && git log --format='%H|%h|%s|%an|%ae|%ad' --date=iso -n " . intval($limit) . " 2>/dev/null";
        $output = shell_exec($command);
        
        if (!$output) {
            return [];
        }

        $commits = [];
        $lines = explode("\n", trim($output));
        
        foreach ($lines as $line) {
            if (empty($line)) continue;
            
            $parts = explode('|', $line);
            if (count($parts) >= 6) {
                $commits[] = [
                    'hash' => $parts[0],
                    'short_hash' => $parts[1],
                    'message' => $parts[2],
                    'author_name' => $parts[3],
                    'author_email' => $parts[4],
                    'date' => $parts[5]
                ];
            }
        }

        return $commits;
    }

    public function getChangedFiles($commitHash, $path = '.') {
        $command = "cd " . escapeshellarg($path) . " && git show --name-only --format='' " . escapeshellarg($commitHash) . " 2>/dev/null";
        $output = shell_exec($command);
        
        if (!$output) {
            return [];
        }

        return array_filter(explode("\n", trim($output)));
    }

    public function getDiffStats($commitHash, $path = '.') {
        $command = "cd " . escapeshellarg($path) . " && git show --stat --format='' " . escapeshellarg($commitHash) . " 2>/dev/null";
        $output = shell_exec($command);
        
        if (!$output) {
            return null;
        }

        // Parse the diff stats
        $lines = explode("\n", trim($output));
        $stats = [
            'files_changed' => 0,
            'insertions' => 0,
            'deletions' => 0,
            'files' => []
        ];

        foreach ($lines as $line) {
            if (preg_match('/(\d+) files? changed/', $line, $matches)) {
                $stats['files_changed'] = intval($matches[1]);
            }
            if (preg_match('/(\d+) insertions?/', $line, $matches)) {
                $stats['insertions'] = intval($matches[1]);
            }
            if (preg_match('/(\d+) deletions?/', $line, $matches)) {
                $stats['deletions'] = intval($matches[1]);
            }
            
            // Parse individual file stats
            if (preg_match('/^\s*(.+?)\s+\|\s+(\d+)\s+([+-]+)$/', $line, $matches)) {
                $stats['files'][] = [
                    'file' => trim($matches[1]),
                    'changes' => intval($matches[2]),
                    'visual' => $matches[3]
                ];
            }
        }

        return $stats;
    }
}
?>
