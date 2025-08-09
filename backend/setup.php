<?php
require_once 'config/database.php';
require_once 'models/Database.php';

echo "🚀 Setting up Git Nacht PHP Backend...\n\n";

try {
    // Initialize database
    $database = new Database();
    
    echo "📡 Connecting to database...\n";
    if (!$database->connect()) {
        throw new Exception("Failed to connect to database");
    }
    echo "✅ Database connection successful\n\n";
    
    echo "🔧 Creating database tables...\n";
    if (!$database->createTables()) {
        throw new Exception("Failed to create database tables");
    }
    echo "✅ Database tables created successfully\n\n";
    
    echo "👤 Creating admin user...\n";
    if (!$database->createAdminUser()) {
        throw new Exception("Failed to create admin user");
    }
    echo "✅ Admin user created successfully\n";
    echo "   📧 Email: admin@gitnacht.com\n";
    echo "   🔑 Password: admin123\n\n";
    
    // Create upload directories
    echo "📁 Creating upload directories...\n";
    $uploadPath = UPLOAD_PATH;
    if (!is_dir($uploadPath)) {
        if (mkdir($uploadPath, 0755, true)) {
            echo "✅ Created upload directory: $uploadPath\n";
        } else {
            echo "⚠️  Warning: Could not create upload directory: $uploadPath\n";
        }
    } else {
        echo "✅ Upload directory already exists: $uploadPath\n";
    }
    
    $thumbsPath = $uploadPath . 'thumbs/';
    if (!is_dir($thumbsPath)) {
        if (mkdir($thumbsPath, 0755, true)) {
            echo "✅ Created thumbnails directory: $thumbsPath\n";
        } else {
            echo "⚠️  Warning: Could not create thumbnails directory: $thumbsPath\n";
        }
    } else {
        echo "✅ Thumbnails directory already exists: $thumbsPath\n";
    }
    
    echo "\n🎉 Setup completed successfully!\n\n";
    echo "📋 Next steps:\n";
    echo "1. Copy .env.example to .env and configure your settings\n";
    echo "2. Start your PHP server: php -S localhost:8000\n";
    echo "3. Your API will be available at: http://localhost:8000/api\n";
    echo "4. Use your Python CLI as usual - it will work with this PHP backend\n\n";
    echo "🔗 API Endpoints:\n";
    echo "   GET  /api/health           - Health check\n";
    echo "   POST /api/auth/login       - User login\n";
    echo "   POST /api/auth/register    - User registration\n";
    echo "   GET  /api/projects         - Get projects\n";
    echo "   POST /api/projects         - Create project\n";
    echo "   GET  /api/screenshots      - Get screenshots\n";
    echo "   POST /api/screenshots      - Create screenshot record\n\n";
    
} catch (Exception $e) {
    echo "❌ Setup failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
