#!/usr/bin/env python3
"""
Setup script for Git Nacht - Visual Patch Notes CLI
"""

import os
import sys
import subprocess
from pathlib import Path

def install_requirements():
    """Install Python requirements"""
    print("📦 Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def create_env_file():
    """Create .env file from example"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if env_file.exists():
        print("ℹ️  .env file already exists")
        return True
    
    if env_example.exists():
        try:
            env_content = env_example.read_text()
            env_file.write_text(env_content)
            print("✅ Created .env file from .env.example")
            print("⚠️  Please update .env file with your database credentials")
            return True
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")
            return False
    else:
        print("❌ .env.example file not found")
        return False

def create_directories():
    """Create necessary directories"""
    directories = [
        "screenshots",
        "logs",
        "data"
    ]
    
    for directory in directories:
        dir_path = Path(directory)
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"📁 Created directory: {directory}")
    
    return True

def setup_git_alias():
    """Setup git alias for git-nacht"""
    try:
        current_dir = os.getcwd()
        git_nacht_path = os.path.join(current_dir, "git-nacht.py")
        
        # Create git alias
        alias_command = f'git config --global alias.nacht "!python \\"{git_nacht_path}\\""'
        subprocess.run(alias_command, shell=True, check=True)
        
        print("✅ Git alias 'nacht' created successfully")
        print("💡 You can now use: git nacht -url 'localhost:5173/dashboard'")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Could not create git alias: {e}")
        print("💡 You can manually run: python git-nacht.py nacht -url 'localhost:5173/dashboard'")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up Git Nacht - Visual Patch Notes CLI")
    print("=" * 50)
    
    success = True
    
    # Install requirements
    if not install_requirements():
        success = False
    
    # Create .env file
    if not create_env_file():
        success = False
    
    # Create directories
    if not create_directories():
        success = False
    
    # Setup git alias
    setup_git_alias()  # Not critical for success
    
    print("\n" + "=" * 50)
    
    if success:
        print("✅ Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Update .env file with your MySQL database credentials")
        print("2. Run: python -m src.cli.main setup")
        print("3. Test with: python git-nacht.py nacht -url 'localhost:5173'")
        print("\n🔧 Usage examples:")
        print("   git add . && git commit -m 'message' && git nacht -url 'localhost:5173/dashboard'")
        print("   python git-nacht.py nacht -url 'localhost:3000'")
        print("   python -m src.cli.main list")
    else:
        print("❌ Setup completed with errors")
        print("Please check the error messages above and try again")
        sys.exit(1)

if __name__ == "__main__":
    main()
