#!/usr/bin/env python3
"""
Git Nacht - Git wrapper that intercepts commands and captures screenshots
Usage: python git-nacht.py <git-command>
Example: python git-nacht.py add . && python git-nacht.py commit -m "fixed dashboard ui" && python git-nacht.py nacht -url "localhost:5173/dashboard"
"""

import sys
import os
import subprocess
import re

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from cli.main import GitNachtCLI

def main():
    if len(sys.argv) < 2:
        print("Usage: python git-nacht.py <command>")
        print("Examples:")
        print("  python git-nacht.py add .")
        print("  python git-nacht.py commit -m 'message'")
        print("  python git-nacht.py shot localhost:5173/dashboard")
        print("  python git-nacht.py shot localhost:5173/features")
        sys.exit(1)

    command = ' '.join(sys.argv[1:])
    cli = GitNachtCLI()

    # Handle shot command (shortened from nacht -url)
    if command.startswith('shot'):
        # Check if there's a recent commit first
        if not cli.has_recent_commit():
            print("❌ No recent commit found. Please run 'git commit' first.")
            print("💡 Workflow: git add . → git commit -m 'message' → python git-nacht.py shot <url>")
            return
            
        # Extract URL from command
        parts = command.split()
        if len(parts) < 2:
            print("❌ Invalid shot command. Use: shot <url>")
            print("Examples:")
            print("  python git-nacht.py shot localhost:5173/dashboard")
            print("  python git-nacht.py shot localhost:5173/features")
            return
            
        url = parts[1]
        if not url.startswith(('http://', 'https://')):
            url = f"http://{url}"
        
        cli.handle_nacht_command(url)
        return

    # Handle legacy nacht command for backwards compatibility
    if command.startswith('nacht'):
        url_match = re.search(r'-url\s+["\']?([^"\']+)["\']?', command)
        if url_match:
            url = url_match.group(1)
            if not url.startswith(('http://', 'https://')):
                url = f"http://{url}"
            
            # Check for recent commit
            if not cli.has_recent_commit():
                print("❌ No recent commit found. Please run 'git commit' first.")
                return
            
            cli.handle_nacht_command(url)
        else:
            print("❌ Invalid nacht command. Use: nacht -url 'localhost:5173/dashboard'")
        return

    # Handle regular git commands
    if command.startswith('git ') or command in ['add', 'commit', 'push', 'pull', 'status', 'log']:
        if not command.startswith('git '):
            command = f"git {command}"
        
        # Execute git command
        result = subprocess.run(command, shell=True)
        sys.exit(result.returncode)
    else:
        print(f"❌ Unknown command: {command}")
        sys.exit(1)

if __name__ == '__main__':
    main()
