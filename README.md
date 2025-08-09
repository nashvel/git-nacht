# Git Nacht - Visual Patch Notes CLI

A Python CLI tool that automatically captures screenshots when Git commands are executed and stores them in a MySQL database for visual patch notes and development tracking.

## 🚀 Features

- **Automatic Screenshot Capture**: Captures screenshots of web applications when commits are made
- **Git Integration**: Seamlessly integrates with your Git workflow
- **Database Storage**: Stores screenshots and commit information in MySQL
- **Authentication System**: Role-based access control (Admin/User)
- **REST API**: Backend API for web interface integration
- **Multi-viewport Support**: Capture screenshots at different screen sizes
- **Visual Patch Notes**: Perfect for creating visual documentation of changes

## 📋 Requirements

- Python 3.8+
- MySQL 5.7+ or MariaDB
- Chrome/Chromium browser (for screenshots)
- Git repository

## 🛠️ Installation

1. **Clone or download this project**
2. **Run the setup script**:
   ```bash
   python setup.py
   ```

3. **Configure your database**:
   - Update `.env` file with your MySQL credentials
   - Create a MySQL database named `visual_patch_notes`

4. **Initialize the system**:
   ```bash
   python -m src.cli.main setup
   ```

## 🎯 Usage

### Basic Usage

1. **Make your Git commits as usual**:
   ```bash
   git add .
   git commit -m "fixed dashboard ui"
   ```

2. **Capture screenshot with nacht command**:
   ```bash
   git nacht -url "localhost:5173/dashboard"
   ```

### Alternative Usage

You can also use the Python script directly:
```bash
python git-nacht.py nacht -url "localhost:5173/dashboard"
```

### CLI Commands

- **Setup database**: `python -m src.cli.main setup`
- **List screenshots**: `python -m src.cli.main list`
- **Check status**: `python -m src.cli.main status`
- **Login**: `python -m src.cli.main login`

### API Server

Start the backend API server:
```bash
python src/api/app.py
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
project-git/
├── src/
│   ├── api/
│   │   └── app.py              # Flask REST API
│   ├── cli/
│   │   └── main.py             # Main CLI application
│   ├── models/
│   │   └── database.py         # Database models and operations
│   └── services/
│       ├── auth_service.py     # Authentication service
│       ├── git_service.py      # Git operations service
│       └── screenshot_service.py # Screenshot capture service
├── screenshots/                # Screenshot storage directory
├── git-nacht.py               # Git wrapper script
├── setup.py                   # Setup and installation script
├── requirements.txt           # Python dependencies
├── .env.example              # Environment configuration template
└── README.md                 # This file
```

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - User email (unique)
- `password_hash` - Hashed password
- `role` - User role (admin/user)
- `created_at` - Creation timestamp

### Screenshots Table
- `id` - Primary key
- `commit_hash` - Git commit hash
- `commit_message` - Commit message
- `url` - Screenshot URL
- `image_path` - Path to screenshot file
- `branch_name` - Git branch name
- `repository_path` - Repository path
- `user_id` - Foreign key to users table
- `created_at` - Creation timestamp

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=visual_patch_notes
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Screenshot Configuration
SCREENSHOT_TIMEOUT=10
SCREENSHOT_WIDTH=1920
SCREENSHOT_HEIGHT=1080

# Default Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Screenshots
- `GET /api/screenshots` - Get screenshots with pagination
- `GET /api/screenshots/<id>/image` - Get screenshot image
- `POST /api/screenshots/capture` - Manually capture screenshot

### Repository
- `GET /api/repositories` - Get repository information

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics

## 💡 Use Cases

1. **Visual Patch Notes**: Create a website that displays commit messages with corresponding screenshots
2. **Development Tracking**: Track UI changes over time with visual evidence
3. **QA Documentation**: Automatically document changes for testing teams
4. **Client Updates**: Show clients visual progress of their projects
5. **Bug Tracking**: Capture screenshots when fixing UI bugs

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- SQL injection protection
- CORS support for web integration

## 🚨 Troubleshooting

### Common Issues

1. **Chrome driver issues**: The tool automatically downloads ChromeDriver
2. **Database connection**: Check your MySQL credentials in `.env`
3. **Screenshot timeout**: Increase `SCREENSHOT_TIMEOUT` in `.env`
4. **Git repository**: Ensure you're in a Git repository directory

### Debug Mode

Run with debug information:
```bash
python -m src.cli.main status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source. Feel free to use and modify as needed.

## 🎉 Example Workflow

```bash
# 1. Make changes to your code
echo "console.log('Hello World');" > app.js

# 2. Stage and commit changes
git add .
git commit -m "added hello world feature"

# 3. Capture screenshot of your running application
git nacht -url "localhost:3000"

# 4. View your screenshots
python -m src.cli.main list
```

The screenshot will be automatically saved to your database with the commit information, ready to be displayed in your visual patch notes system!
# git-nacht
# git-nacht
