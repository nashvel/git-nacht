#!/usr/bin/env python3
"""
Git Nacht CLI - Clean version that works with PHP backend database
"""
import os
import sys
import subprocess
import re
from datetime import datetime
from pathlib import Path

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from models.database import Database

class GitNachtCLI:
    def __init__(self):
        self.db = Database()
        self.project_root = os.path.join(os.path.dirname(__file__), '..', '..')
        self.user_id = None
        
    def authenticate(self):
        """Authenticate user with interactive login"""
        if not self.db.connect():
            print("❌ Could not connect to database")
            return False
        
        import getpass
        
        print("🔐 Git Nacht CLI Login")
        email = input("Email: ")
        password = getpass.getpass("Password: ")
        
        self.user_id = self.db.authenticate_user(email, password)
        return self.user_id is not None
    
    def has_recent_commit(self):
        """Check if there's a recent commit (within last 5 minutes)"""
        try:
            import subprocess
            from datetime import datetime, timedelta
            
            # Get the timestamp of the last commit
            result = subprocess.run(
                ['git', 'log', '-1', '--format=%ct'], 
                capture_output=True, 
                text=True,
                cwd=self.project_root
            )
            
            if result.returncode == 0:
                commit_timestamp = int(result.stdout.strip())
                commit_time = datetime.fromtimestamp(commit_timestamp)
                current_time = datetime.now()
                
                # Check if commit is within last 5 minutes
                time_diff = current_time - commit_time
                if time_diff <= timedelta(minutes=5):
                    return True
                else:
                    print(f"⚠️  Last commit was {time_diff} ago. Please make a fresh commit.")
                    return False
            else:
                print("❌ No git commits found in this repository.")
                return False
                
        except Exception as e:
            print(f"❌ Failed to check commit history: {e}")
            return False
        
    def take_screenshot(self, url):
        """Take screenshot using Selenium and save to PHP backend path"""
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.chrome.service import Service
            from webdriver_manager.chrome import ChromeDriverManager
            import time
            
            # Ensure upload directory exists
            upload_path = self.db.ensure_upload_directory()
            
            # Generate filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            commit_hash = self.db.get_latest_commit_hash()
            filename = f"screenshot_{commit_hash}_{timestamp}.png"
            full_path = os.path.join(upload_path, filename)
            
            print(f"📸 Taking screenshot of {url}...")
            
            # Setup Chrome options
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--window-size=1920,1080")
            
            # Setup Chrome driver
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            try:
                # Navigate to URL
                driver.get(url)
                
                # Wait for page to load
                time.sleep(3)
                
                # Take screenshot
                driver.save_screenshot(full_path)
                
                print(f"✅ Screenshot saved: {filename}")
                
                # Save to database
                project_id = self.db.get_current_project_id(self.user_id)
                relative_path = f"uploads/screenshots/{filename}"  # Path relative to backend
                
                screenshot_id = self.db.save_screenshot(
                    project_id=project_id,
                    commit_hash=commit_hash,
                    url=url,
                    screenshot_path=relative_path,
                    user_id=self.user_id or 1
                )
                
                if screenshot_id:
                    print(f"✅ Screenshot linked to project {project_id}")
                    return True
                else:
                    print("⚠️  Screenshot saved but not linked to database")
                    return False
                    
            finally:
                driver.quit()
                
        except ImportError as e:
            print("❌ Required packages not installed. Run:")
            print("   pip install selenium webdriver-manager")
            return False
        except Exception as e:
            print(f"❌ Screenshot failed: {e}")
            return False

    def handle_nacht_command(self, url):
        """Handle the nacht command to take screenshots"""
        print(f"🚀 Git Nacht CLI - Taking screenshot of {url}")
        
        # Authenticate user
        print("🔐 Authenticating...")
        if not self.authenticate():
            print("❌ Authentication failed")
            return False
        
        # Ensure screenshots table exists
        if not self.db.create_screenshots_table_if_not_exists():
            print("❌ Failed to setup screenshots table")
            return False
        
        # Take screenshot
        success = self.take_screenshot(url)
        
        if success:
            print("🎉 Screenshot captured and saved successfully!")
        else:
            print("❌ Failed to capture screenshot")
        
        # Close database connection
        self.db.disconnect()
        return success
    
    def execute_git_command(self, command):
        """Execute git command normally"""
        try:
            result = subprocess.run(command, shell=True, cwd=self.project_root, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"❌ Git command failed with error: {result.stderr}")
            else:
                print(f"✅ Git command executed: {command}")
                if result.stdout:
                    print(result.stdout)
            return result.returncode == 0
        except Exception as e:
            print(f"❌ Git command failed: {e}")
            return False
