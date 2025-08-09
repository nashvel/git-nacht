#!/usr/bin/env python3
import click
import os
import sys
import subprocess
import re
from pathlib import Path
from colorama import init, Fore, Style

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from models.database import Database
from services.git_service import GitService
from services.screenshot_service import ScreenshotService
from services.auth_service import AuthService

# Initialize colorama for Windows
init()

class GitNachtCLI:
    def __init__(self):
        self.db = Database()
        self.git_service = GitService()
        self.screenshot_service = ScreenshotService()
        self.auth_service = AuthService()
        self.current_user = None

    def setup_database(self):
        """Setup database and create tables"""
        if not self.db.connect():
            click.echo(f"{Fore.RED}❌ Failed to connect to database{Style.RESET_ALL}")
            return False
        
        if not self.db.create_tables():
            click.echo(f"{Fore.RED}❌ Failed to create database tables{Style.RESET_ALL}")
            return False
        
        if not self.db.create_admin_user():
            click.echo(f"{Fore.RED}❌ Failed to create admin user{Style.RESET_ALL}")
            return False
        
        return True

    def execute_git_command(self, command):
        """Execute git command and capture screenshot if needed"""
        # Check if this is a commit command
        if not self.git_service.is_commit_command(command):
            click.echo(f"{Fore.YELLOW}⚠️  Not a commit command, executing normally...{Style.RESET_ALL}")
            result = subprocess.run(command, shell=True, cwd=self.git_service.repo_path)
            return result.returncode == 0

        # Execute the git command first
        click.echo(f"{Fore.CYAN}🔄 Executing: {command}{Style.RESET_ALL}")
        result = subprocess.run(command, shell=True, cwd=self.git_service.repo_path)
        
        if result.returncode != 0:
            click.echo(f"{Fore.RED}❌ Git command failed{Style.RESET_ALL}")
            return False

        click.echo(f"{Fore.GREEN}✅ Git command executed successfully{Style.RESET_ALL}")
        return True

    def handle_nacht_command(self, url):
        """Handle git nacht command with screenshot"""
        if not self.git_service.is_git_repo():
            click.echo(f"{Fore.RED}❌ Not in a Git repository{Style.RESET_ALL}")
            return False

        # Get latest commit info
        commit_info = self.git_service.get_latest_commit()
        if not commit_info:
            click.echo(f"{Fore.RED}❌ Could not get commit information{Style.RESET_ALL}")
            return False

        click.echo(f"{Fore.CYAN}📸 Taking screenshot of: {url}{Style.RESET_ALL}")
        click.echo(f"{Fore.CYAN}📝 Commit: {commit_info['short_hash']} - {commit_info['message']}{Style.RESET_ALL}")

        # Capture screenshot
        screenshot_path = self.screenshot_service.capture_screenshot(
            url, 
            commit_info['hash'], 
            commit_info['message']
        )

        if not screenshot_path:
            click.echo(f"{Fore.RED}❌ Failed to capture screenshot{Style.RESET_ALL}")
            return False

        # Save to database
        if self.db.connection:
            repo_info = self.git_service.get_repository_info()
            user_id = self.current_user['id'] if self.current_user else None
            
            screenshot_id = self.db.insert_screenshot(
                commit_hash=commit_info['hash'],
                commit_message=commit_info['message'],
                url=url,
                image_path=screenshot_path,
                branch_name=commit_info['branch'],
                repository_path=repo_info['path'] if repo_info else None,
                user_id=user_id
            )

            if screenshot_id:
                click.echo(f"{Fore.GREEN}✅ Screenshot saved to database (ID: {screenshot_id}){Style.RESET_ALL}")
            else:
                click.echo(f"{Fore.YELLOW}⚠️  Screenshot captured but not saved to database{Style.RESET_ALL}")

        return True

@click.group()
@click.pass_context
def cli(ctx):
    """Git Nacht - Visual Patch Notes CLI Tool"""
    ctx.ensure_object(dict)
    ctx.obj['cli'] = GitNachtCLI()

@cli.command()
@click.pass_context
def setup(ctx):
    """Setup database and initialize the system"""
    cli_obj = ctx.obj['cli']
    
    click.echo(f"{Fore.CYAN}🚀 Setting up Git Nacht...{Style.RESET_ALL}")
    
    if cli_obj.setup_database():
        click.echo(f"{Fore.GREEN}✅ Setup completed successfully!{Style.RESET_ALL}")
        click.echo(f"{Fore.YELLOW}💡 You can now use 'git-nacht exec' to run git commands with screenshots{Style.RESET_ALL}")
    else:
        click.echo(f"{Fore.RED}❌ Setup failed{Style.RESET_ALL}")
        sys.exit(1)

@cli.command()
@click.argument('command', nargs=-1, required=True)
@click.pass_context
def exec(ctx, command):
    """Execute git command and capture screenshot if followed by nacht command"""
    cli_obj = ctx.obj['cli']
    command_str = ' '.join(command)
    
    # Check if this is a nacht command
    if 'git nacht' in command_str:
        url = cli_obj.git_service.parse_git_nacht_command(command_str)
        if url:
            cli_obj.handle_nacht_command(url)
        else:
            click.echo(f"{Fore.RED}❌ Invalid nacht command format. Use: git nacht -url \"localhost:5173/dashboard\"{Style.RESET_ALL}")
        return

    # Execute regular git command
    cli_obj.execute_git_command(command_str)

@cli.command()
@click.option('--url', required=True, help='URL to screenshot')
@click.pass_context
def nacht(ctx, url):
    """Capture screenshot of URL for the latest commit"""
    cli_obj = ctx.obj['cli']
    
    # Add protocol if missing
    if not url.startswith(('http://', 'https://')):
        url = f"http://{url}"
    
    cli_obj.handle_nacht_command(url)

@cli.command()
@click.option('--limit', default=10, help='Number of screenshots to show')
@click.pass_context
def list(ctx, limit):
    """List recent screenshots"""
    cli_obj = ctx.obj['cli']
    
    if not cli_obj.db.connect():
        click.echo(f"{Fore.RED}❌ Could not connect to database{Style.RESET_ALL}")
        return

    screenshots = cli_obj.db.get_screenshots(limit=limit)
    
    if not screenshots:
        click.echo(f"{Fore.YELLOW}📷 No screenshots found{Style.RESET_ALL}")
        return

    click.echo(f"{Fore.CYAN}📷 Recent Screenshots:{Style.RESET_ALL}")
    click.echo("-" * 80)
    
    for shot in screenshots:
        click.echo(f"{Fore.GREEN}🔹 {shot['commit_hash'][:8]}{Style.RESET_ALL} - {shot['commit_message']}")
        click.echo(f"   📅 {shot['created_at']} | 🌐 {shot['url']}")
        click.echo(f"   📁 {shot['image_path']}")
        if shot['user_email']:
            click.echo(f"   👤 {shot['user_email']}")
        click.echo()

@cli.command()
@click.pass_context
def status(ctx):
    """Show repository and system status"""
    cli_obj = ctx.obj['cli']
    
    click.echo(f"{Fore.CYAN}📊 Git Nacht Status{Style.RESET_ALL}")
    click.echo("-" * 40)
    
    # Git repository status
    if cli_obj.git_service.is_git_repo():
        repo_info = cli_obj.git_service.get_repository_info()
        click.echo(f"{Fore.GREEN}✅ Git Repository: {repo_info['name']}{Style.RESET_ALL}")
        click.echo(f"   📂 Path: {repo_info['path']}")
        click.echo(f"   🌿 Branch: {repo_info['branch']}")
        if repo_info['remote_url']:
            click.echo(f"   🔗 Remote: {repo_info['remote_url']}")
        
        if repo_info['latest_commit']:
            commit = repo_info['latest_commit']
            click.echo(f"   📝 Latest: {commit['short_hash']} - {commit['message']}")
    else:
        click.echo(f"{Fore.RED}❌ Not in a Git repository{Style.RESET_ALL}")
    
    # Database status
    if cli_obj.db.connect():
        click.echo(f"{Fore.GREEN}✅ Database: Connected{Style.RESET_ALL}")
        screenshots = cli_obj.db.get_screenshots(limit=1)
        if screenshots:
            click.echo(f"   📷 Total screenshots: Available")
        cli_obj.db.disconnect()
    else:
        click.echo(f"{Fore.RED}❌ Database: Not connected{Style.RESET_ALL}")

@cli.command()
@click.option('--email', prompt=True, help='User email')
@click.option('--password', prompt=True, hide_input=True, help='User password')
@click.pass_context
def login(ctx, email, password):
    """Login to the system"""
    cli_obj = ctx.obj['cli']
    
    if not cli_obj.db.connect():
        click.echo(f"{Fore.RED}❌ Could not connect to database{Style.RESET_ALL}")
        return

    user = cli_obj.db.get_user_by_email(email)
    if not user or not cli_obj.db.verify_password(password, user['password_hash']):
        click.echo(f"{Fore.RED}❌ Invalid credentials{Style.RESET_ALL}")
        return

    # Create session
    session = cli_obj.auth_service.create_user_session(user)
    cli_obj.current_user = user
    
    click.echo(f"{Fore.GREEN}✅ Logged in as {user['email']} ({user['role']}){Style.RESET_ALL}")
    click.echo(f"🔑 Token: {session['token'][:20]}...")

if __name__ == '__main__':
    cli()
