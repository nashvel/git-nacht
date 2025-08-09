# Git Nacht PHP Backend

A modern PHP backend for Git Nacht - Visual Patch Notes system. This backend maintains the same API structure as the original Python Flask backend while providing better performance and easier deployment.

## Features

- **RESTful API** - Clean REST endpoints for all operations
- **JWT Authentication** - Secure token-based authentication
- **MySQL Database** - Reliable data storage with proper relationships
- **File Upload Support** - Screenshot storage and serving
- **CORS Enabled** - Ready for frontend integration
- **Compatible with Python CLI** - Works seamlessly with existing Python CLI tool

## Quick Start

### 1. Setup

```bash
# Copy environment configuration
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_NAME=visual_patch_notes
# DB_USER=your_username
# DB_PASSWORD=your_password

# Run setup script
php setup.php
```

### 2. Start Server

```bash
# Start PHP development server
php -S localhost:8000

# Or use with Apache/Nginx
# Point document root to this directory
```

### 3. Test API

```bash
# Health check
curl http://localhost:8000/api/health

# Login (default admin)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gitnacht.com","password":"admin123"}'
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get specific project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Screenshots
- `GET /api/screenshots` - Get screenshots with pagination
- `POST /api/screenshots` - Record new screenshot
- `GET /api/screenshots/{filename}` - Serve screenshot file

### System
- `GET /api/health` - Health check endpoint

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password_hash` - Hashed password
- `role` - User role (user/admin)
- `created_at`, `updated_at` - Timestamps

### Projects Table
- `id` - Primary key
- `name` - Project name
- `description` - Project description
- `repository` - Git repository URL
- `user_id` - Foreign key to users
- `created_at`, `updated_at` - Timestamps

### Screenshots Table
- `id` - Primary key
- `commit_hash` - Git commit hash
- `commit_message` - Commit message
- `url` - Screenshot URL
- `image_path` - Path to screenshot file
- `branch_name` - Git branch name
- `repository_path` - Repository path
- `user_id` - Foreign key to users
- `project_id` - Foreign key to projects
- `created_at` - Timestamp

## Integration with Python CLI

Your existing Python CLI tool will work seamlessly with this PHP backend. The API endpoints match exactly, so you just need to:

1. Update your Python CLI configuration to point to `http://localhost:8000/api`
2. Continue using all your existing CLI commands:
   - `git-nacht setup`
   - `git-nacht exec git commit -m "message"`
   - `git-nacht nacht --url "localhost:3000"`
   - `git-nacht list`
   - `git-nacht status`

## Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=visual_patch_notes
DB_USER=root
DB_PASSWORD=

# Security
JWT_SECRET=your-secret-key-change-this

# File Storage
UPLOAD_PATH=uploads/screenshots/

# Application
APP_ENV=development
APP_URL=http://localhost:8000
```

### File Permissions

Make sure the following directories are writable:
- `uploads/screenshots/` - For screenshot storage
- `uploads/screenshots/thumbs/` - For thumbnail generation

## Frontend Integration

Update your React frontend to use the PHP backend:

```javascript
// In your frontend configuration
const API_BASE_URL = 'http://localhost:8000/api';

// All existing API calls will work the same
fetch(`${API_BASE_URL}/projects`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Production Deployment

### Apache Configuration

```apache
<VirtualHost *:80>
    DocumentRoot /path/to/git-nacht/backend
    ServerName gitnacht.yourdomain.com
    
    <Directory /path/to/git-nacht/backend>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Rewrite rules for clean URLs
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^api/(.*)$ index.php [QSA,L]
</VirtualHost>
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name gitnacht.yourdomain.com;
    root /path/to/git-nacht/backend;
    index index.php;

    location /api/ {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## Security Notes

1. **Change JWT Secret** - Update `JWT_SECRET` in production
2. **Database Security** - Use strong database credentials
3. **File Permissions** - Restrict upload directory access
4. **HTTPS** - Use HTTPS in production
5. **Input Validation** - All inputs are validated and sanitized

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **File Upload Issues**
   - Check directory permissions
   - Verify `UPLOAD_PATH` exists
   - Check PHP `upload_max_filesize`

3. **CORS Issues**
   - Update `CORS_ALLOWED_ORIGINS` in config
   - Check frontend URL matches

### Logs

Check PHP error logs for detailed error information:
```bash
tail -f /var/log/php_errors.log
```

## Support

This PHP backend maintains 100% API compatibility with your existing Python Flask backend, so all your frontend code and Python CLI tools will work without any changes.
