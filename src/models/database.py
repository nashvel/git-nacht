#!/usr/bin/env python3
"""
Database model for Git Nacht Python CLI
Connects to the same MySQL database used by the PHP backend
"""

import mysql.connector
import os
from datetime import datetime
import json

class Database:
    def __init__(self):
        # Load environment variables from backend .env file
        self.load_env_from_php()
        
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = int(os.getenv('DB_PORT', '3306'))
        self.database = os.getenv('DB_NAME', 'git_nacht')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        
        # Screenshot upload path (same as PHP backend)
        self.upload_path = os.getenv('UPLOAD_PATH', os.path.join(
            os.path.dirname(__file__), '..', '..', 'backend', 'uploads', 'screenshots'
        ))
        
        self.connection = None
        
    def load_env_from_php(self):
        """Load environment variables from PHP backend .env file"""
        env_path = os.path.join(
            os.path.dirname(__file__), '..', '..', 'backend', '.env'
        )
        
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
    
    def connect(self):
        """Connect to MySQL database"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password
            )
            return True
        except mysql.connector.Error as err:
            print(f"❌ Database connection failed: {err}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
    
    def ensure_upload_directory(self):
        """Ensure the upload directory exists"""
        os.makedirs(self.upload_path, exist_ok=True)
        return self.upload_path
    
    def save_screenshot(self, project_id, commit_hash, url, screenshot_path, user_id=1):
        """
        Save screenshot information to database
        Uses the same schema as PHP backend
        """
        if not self.connection or not self.connection.is_connected():
            print("❌ No database connection")
            return False
        
        try:
            cursor = self.connection.cursor()
            
            # Insert screenshot record
            query = """
                INSERT INTO screenshots (project_id, commit_hash, url, file_path, user_id, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            values = (
                project_id,
                commit_hash,
                url,
                screenshot_path,
                user_id,
                datetime.now()
            )
            
            cursor.execute(query, values)
            self.connection.commit()
            
            screenshot_id = cursor.lastrowid
            cursor.close()
            
            print(f"✅ Screenshot saved to database (ID: {screenshot_id})")
            return screenshot_id
            
        except mysql.connector.Error as err:
            print(f"❌ Failed to save screenshot: {err}")
            return False
    
    def get_latest_commit_hash(self):
        """Get the latest git commit hash"""
        try:
            import subprocess
            result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'], 
                capture_output=True, 
                text=True, 
                cwd=os.path.join(os.path.dirname(__file__), '..', '..')
            )
            if result.returncode == 0:
                return result.stdout.strip()[:7]  # Short hash
        except Exception as e:
            print(f"❌ Failed to get commit hash: {e}")
        return 'unknown'
    
    def get_current_project_id(self):
        """
        Get current project ID based on git remote URL
        This connects to your existing projects in the PHP database
        """
        try:
            import subprocess
            result = subprocess.run(
                ['git', 'remote', 'get-url', 'origin'], 
                capture_output=True, 
                text=True,
                cwd=os.path.join(os.path.dirname(__file__), '..', '..')
            )
            
            if result.returncode == 0:
                remote_url = result.stdout.strip()
                
                # Query database for project with matching repository URL
                cursor = self.connection.cursor()
                query = "SELECT id FROM projects WHERE repository_url = %s LIMIT 1"
                cursor.execute(query, (remote_url,))
                result = cursor.fetchone()
                cursor.close()
                
                if result:
                    return result[0]
                else:
                    print(f"⚠️  No project found for repository: {remote_url}")
                    return 1  # Default to project ID 1
            
        except Exception as e:
            print(f"❌ Failed to get project ID: {e}")
        
        return 1  # Default project ID
    
    def create_screenshots_table_if_not_exists(self):
        """Create screenshots table if it doesn't exist"""
        if not self.connection or not self.connection.is_connected():
            return False
            
        try:
            cursor = self.connection.cursor()
            
            # Create screenshots table
            create_table_query = """
                CREATE TABLE IF NOT EXISTS screenshots (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    project_id INT NOT NULL,
                    commit_hash VARCHAR(40),
                    url TEXT,
                    file_path VARCHAR(500) NOT NULL,
                    user_id INT DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                )
            """
            
            cursor.execute(create_table_query)
            self.connection.commit()
            cursor.close()
            
            print("✅ Screenshots table ready")
            return True
            
        except mysql.connector.Error as err:
            print(f"❌ Failed to create screenshots table: {err}")
            return False
