<?php

class ScreenshotService {
    private $uploadPath;
    private $maxFileSize;
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    public function __construct($uploadPath = 'uploads/', $maxFileSize = 10485760) { // 10MB default
        $this->uploadPath = rtrim($uploadPath, '/') . '/';
        $this->maxFileSize = $maxFileSize;
        
        // Create upload directory if it doesn't exist
        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
    }
    
    /**
     * Upload and process a screenshot
     */
    public function uploadScreenshot($file, $projectId, $commitHash = null) {
        try {
            // Validate file
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                return ['success' => false, 'error' => $validation['error']];
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = $this->generateFilename($projectId, $commitHash, $extension);
            $filepath = $this->uploadPath . $filename;
            
            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                return ['success' => false, 'error' => 'Failed to save file'];
            }
            
            // Optimize image
            $this->optimizeImage($filepath);
            
            // Generate thumbnail
            $thumbnailPath = $this->generateThumbnail($filepath);
            
            return [
                'success' => true,
                'filename' => $filename,
                'filepath' => $filepath,
                'thumbnail' => $thumbnailPath,
                'size' => filesize($filepath),
                'mime_type' => mime_content_type($filepath)
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Upload failed: ' . $e->getMessage()];
        }
    }
    
    /**
     * Serve a screenshot file
     */
    public function serveScreenshot($filename) {
        $filepath = $this->uploadPath . $filename;
        
        if (!file_exists($filepath)) {
            return ['success' => false, 'error' => 'File not found'];
        }
        
        $mimeType = mime_content_type($filepath);
        $fileSize = filesize($filepath);
        
        // Set headers
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . $fileSize);
        header('Cache-Control: public, max-age=31536000'); // Cache for 1 year
        
        // Output file
        readfile($filepath);
        return ['success' => true];
    }
    
    /**
     * Delete a screenshot
     */
    public function deleteScreenshot($filename) {
        $filepath = $this->uploadPath . $filename;
        
        if (file_exists($filepath)) {
            unlink($filepath);
            
            // Also delete thumbnail if exists
            $thumbnailPath = $this->getThumbnailPath($filename);
            if (file_exists($thumbnailPath)) {
                unlink($thumbnailPath);
            }
            
            return ['success' => true];
        }
        
        return ['success' => false, 'error' => 'File not found'];
    }
    
    /**
     * Get screenshot info
     */
    public function getScreenshotInfo($filename) {
        $filepath = $this->uploadPath . $filename;
        
        if (!file_exists($filepath)) {
            return ['success' => false, 'error' => 'File not found'];
        }
        
        $imageInfo = getimagesize($filepath);
        
        return [
            'success' => true,
            'filename' => $filename,
            'size' => filesize($filepath),
            'mime_type' => mime_content_type($filepath),
            'width' => $imageInfo[0] ?? null,
            'height' => $imageInfo[1] ?? null,
            'created' => filemtime($filepath)
        ];
    }
    
    /**
     * Validate uploaded file
     */
    private function validateFile($file) {
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return ['valid' => false, 'error' => 'Invalid file upload'];
        }
        
        if ($file['size'] > $this->maxFileSize) {
            return ['valid' => false, 'error' => 'File too large'];
        }
        
        $mimeType = mime_content_type($file['tmp_name']);
        if (!in_array($mimeType, $this->allowedTypes)) {
            return ['valid' => false, 'error' => 'Invalid file type'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Generate unique filename
     */
    private function generateFilename($projectId, $commitHash, $extension) {
        $timestamp = time();
        $random = bin2hex(random_bytes(8));
        
        if ($commitHash) {
            return "project_{$projectId}_commit_{$commitHash}_{$timestamp}_{$random}.{$extension}";
        } else {
            return "project_{$projectId}_{$timestamp}_{$random}.{$extension}";
        }
    }
    
    /**
     * Optimize image (reduce file size while maintaining quality)
     */
    private function optimizeImage($filepath) {
        $imageInfo = getimagesize($filepath);
        if (!$imageInfo) return;
        
        $mimeType = $imageInfo['mime'];
        
        // Load image based on type
        switch ($mimeType) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($filepath);
                break;
            case 'image/png':
                $image = imagecreatefrompng($filepath);
                break;
            case 'image/gif':
                $image = imagecreatefromgif($filepath);
                break;
            default:
                return; // Skip optimization for unsupported types
        }
        
        if (!$image) return;
        
        // Save optimized version
        switch ($mimeType) {
            case 'image/jpeg':
                imagejpeg($image, $filepath, 85); // 85% quality
                break;
            case 'image/png':
                imagepng($image, $filepath, 6); // Compression level 6
                break;
            case 'image/gif':
                imagegif($image, $filepath);
                break;
        }
        
        imagedestroy($image);
    }
    
    /**
     * Generate thumbnail
     */
    private function generateThumbnail($filepath, $maxWidth = 300, $maxHeight = 200) {
        $imageInfo = getimagesize($filepath);
        if (!$imageInfo) return null;
        
        $originalWidth = $imageInfo[0];
        $originalHeight = $imageInfo[1];
        $mimeType = $imageInfo['mime'];
        
        // Calculate thumbnail dimensions
        $ratio = min($maxWidth / $originalWidth, $maxHeight / $originalHeight);
        $thumbWidth = intval($originalWidth * $ratio);
        $thumbHeight = intval($originalHeight * $ratio);
        
        // Load original image
        switch ($mimeType) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($filepath);
                break;
            case 'image/png':
                $source = imagecreatefrompng($filepath);
                break;
            case 'image/gif':
                $source = imagecreatefromgif($filepath);
                break;
            default:
                return null;
        }
        
        if (!$source) return null;
        
        // Create thumbnail
        $thumbnail = imagecreatetruecolor($thumbWidth, $thumbHeight);
        
        // Preserve transparency for PNG and GIF
        if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
            imagealphablending($thumbnail, false);
            imagesavealpha($thumbnail, true);
            $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
            imagefilledrectangle($thumbnail, 0, 0, $thumbWidth, $thumbHeight, $transparent);
        }
        
        // Resize image
        imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $originalWidth, $originalHeight);
        
        // Save thumbnail
        $thumbnailPath = $this->getThumbnailPath(basename($filepath));
        
        switch ($mimeType) {
            case 'image/jpeg':
                imagejpeg($thumbnail, $thumbnailPath, 80);
                break;
            case 'image/png':
                imagepng($thumbnail, $thumbnailPath, 6);
                break;
            case 'image/gif':
                imagegif($thumbnail, $thumbnailPath);
                break;
        }
        
        imagedestroy($source);
        imagedestroy($thumbnail);
        
        return $thumbnailPath;
    }
    
    /**
     * Get thumbnail path for a given filename
     */
    private function getThumbnailPath($filename) {
        $pathInfo = pathinfo($filename);
        return $this->uploadPath . 'thumbs/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
    }
    
    /**
     * Cleanup old screenshots (optional maintenance function)
     */
    public function cleanupOldScreenshots($daysOld = 30) {
        $cutoffTime = time() - ($daysOld * 24 * 60 * 60);
        $deleted = 0;
        
        $files = glob($this->uploadPath . '*');
        foreach ($files as $file) {
            if (is_file($file) && filemtime($file) < $cutoffTime) {
                unlink($file);
                $deleted++;
            }
        }
        
        return ['success' => true, 'deleted' => $deleted];
    }
}
