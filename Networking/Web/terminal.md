# Terminal Mastery Guide (Linux & macOS)

A comprehensive, beginner-to-expert reference for terminal navigation, file management, process control, networking, and productivity tips. Master these to boost efficiency in development, debugging, and system administration.

**Quick Start for Beginners:**

- Open Terminal: Search for "Terminal" or "iTerm" on macOS; use Ctrl+Alt+T on Linux.
- Basic prompt: `user@machine:~$ ` – Type commands here.
- Help: `command --help` or `man command` for manuals.
- Tab completion: Press Tab to auto-complete paths/files.
- Up arrow: Recall previous commands.

**Table of Contents:**

- [Terminal Mastery Guide (Linux \& macOS)](#terminal-mastery-guide-linux--macos)
  - [1. File System \& Navigation](#1-file-system--navigation)
    - [Listing Files](#listing-files)
    - [Basic Navigation](#basic-navigation)
    - [File Manipulation](#file-manipulation)
    - [Copy \& Paste (cp)](#copy--paste-cp)
    - [Move \& Rename (mv)](#move--rename-mv)
    - [Creation \& Deletion](#creation--deletion)
    - [Developer Handy Actions](#developer-handy-actions)
  - [2. Environment \& Shell](#2-environment--shell)
  - [3. Processes, Signals \& Jobs](#3-processes-signals--jobs)
    - [Process Management](#process-management)
    - [Job Control (Background/Foreground)](#job-control-backgroundforeground)
    - [Signals Reference](#signals-reference)
  - [4. Ports \& Networking](#4-ports--networking)
    - [Check Listening Ports (PID + Port)](#check-listening-ports-pid--port)
    - [Reverse Lookup (Inspect Process by PID)](#reverse-lookup-inspect-process-by-pid)
    - [Kill Process on Port](#kill-process-on-port)
    - [IP \& DNS](#ip--dns)
  - [5. Network Diagnostics (Advanced)](#5-network-diagnostics-advanced)
  - [6. Disk \& System Health](#6-disk--system-health)
    - [Resources](#resources)
    - ["Silent" Disk Issues](#silent-disk-issues)
    - [Ops Panic Mode (Who is eating resources?)](#ops-panic-mode-who-is-eating-resources)
  - [7. Search \& Projects](#7-search--projects)
    - [Project Search](#project-search)
    - [Archives](#archives)
  - [8. macOS Specific](#8-macos-specific)
  - [9. Power User Aliases \& Functions](#9-power-user-aliases--functions)
    - [Safer Kill Port](#safer-kill-port)
    - [Node Cleanup](#node-cleanup)
    - [Quick Aliases](#quick-aliases)
  - [10. Shortcuts](#10-shortcuts)
  - [11. Additional Productivity Tips](#11-additional-productivity-tips)
    - [Text Editing](#text-editing)
    - [Permissions \& Ownership](#permissions--ownership)
    - [Package Management (Linux/macOS)](#package-management-linuxmacos)
    - [Git Basics (Version Control)](#git-basics-version-control)
    - [Web Development Helpers](#web-development-helpers)
    - [Automation \& Scripting](#automation--scripting)
    - [Common Pitfalls \& Tips](#common-pitfalls--tips)

---

## 1. File System & Navigation

### Listing Files

```bash
ls                        # List visible files
ls -a                     # List ALL files (including hidden .git, .env)
ls -la                    # List all + details (permissions, size, owner)
ls -lh                    # List details with human-readable sizes (KB, MB)
```

### Basic Navigation

```bash
pwd                       # Print current working directory
cd dir                    # Change directory to 'dir'
ls                        # List files
ls -la                    # List all (including hidden) + details
cd /path/to/dir           # Change directory
cd ..                     # Go up one level
cd ../..                  # Go up two levels
cd ~                      # Go to home directory
cd -                      # Go to previous directory
```

### File Manipulation

```bash
touch file.txt            # Create empty file
mkdir dir                 # Create directory
mkdir -p a/b/c            # Create nested directories
cp src.txt dst.txt        # Copy file
cp -r dir1 dir2           # Copy directory recursively
mv old.txt new.txt        # Move or Rename
rm file.txt               # Remove file
rm -rf dir                # Remove directory (force/recursive)
```

### Copy & Paste (cp)

```bash
# File to File (Duplicate)
cp source.txt copy.txt

# File to Folder (Copy to location)
cp file.txt /home/user/documents/

# Directory to Directory (Recursive copy)
cp -r src_folder/ /path/to/destination/

# Copy multiple files to folder
cp file1.js file2.js /path/to/folder/
```

### Move & Rename (mv)

```bash
mv old.txt new.txt                # Rename file
mv file.txt /path/to/destination/ # Move file to specific folder
mv folder/ ..                     # Move folder up one level
```

### Creation & Deletion

```bash
touch file.txt                    # Create empty file
mkdir new_folder                  # Create directory
mkdir -p a/b/c                    # Create nested directories (a -> b -> c)
rm file.txt                       # Delete file
rm -rf folder/                    # Delete folder (Force & Recursive)
```

---

### Developer Handy Actions

Workflow Shortcuts

```bash
code .                    # Open current folder in VS Code
open .                    # Open folder in Finder (macOS)
xdg-open .                # Open folder in File Explorer (Linux)
ln -s /original/path link # Create Symlink (Shortcut) to a file/folder
```

Content & Redirection

```bash
cat file.txt              # Print file content
less file.txt             # View large file (scrollable, 'q' to quit)
head -n 10 file.txt       # View first 10 lines
tail -f app.log           # Follow log output in real-time

# Redirects
echo "data" > file.txt    # Write to file (Overwrites existing!)
echo "data" >> file.txt   # Append to file (Keeps existing)
ps aux > processes.txt    # Save command output to a file
```

## 2. Environment & Shell

```bash
env                       # List all environment variables
printenv PATH             # Print specific variable
export NODE_ENV=prod      # Set env variable (session only)
echo $PATH                # Print executable search path
which node                # Show path to the executable
whereis node              # Show path to executable, source, and man
```

---

## 3. Processes, Signals & Jobs

### Process Management

```bash
ps aux | grep "name"      # Find process by name
pidof "name"              # Get PID of process
top                       # Live system view
htop                      # Interactive system view (better UI)
```

### Job Control (Background/Foreground)

_How to recover from `Ctrl + Z`_

```bash
command &                 # Run in background immediately
jobs                      # List current background jobs
fg %1                     # Bring job #1 to foreground
bg %1                     # Resume job #1 in background
nohup command &           # Run in background (survives terminal close)
disown -h %1              # Detach job from terminal (no HUP)
```

### Signals Reference

| Signal      | ID  | Description                   |
| :---------- | :-- | :---------------------------- |
| **SIGINT**  | 2   | Interrupt (Ctrl+C)            |
| **SIGKILL** | 9   | Force Kill (cannot be caught) |
| **SIGTERM** | 15  | Terminate (Graceful default)  |
| **SIGSTOP** | 19  | Pause Process (Ctrl+Z)        |
| **SIGCONT** | 18  | Resume Process                |

---

## 4. Ports & Networking

### Check Listening Ports (PID + Port)

```bash
# Universal (Linux/macOS) - Shows Command, PID, and Port
lsof -i -P -n | grep LISTEN
lsof -i :4000

# Linux Specific
ss -tulpn | grep LISTEN
netstat -tulpn            # Legacy
```

### Reverse Lookup (Inspect Process by PID)

```bash
lsof -p PID               # List all files/ports opened by PID
ps -fp PID                # Full process details for PID
pwdx PID                  # Show current working directory of PID
```

### Kill Process on Port

```bash
# Kill process on port 3000
kill $(lsof -t -i:3000)

# Force kill process on port 3000
kill -9 $(lsof -t -i:3000)

## multiple kill
kill -9 56621 4000
```

### IP & DNS

```bash
ip a                      # Show IPs (Linux)
ifconfig                  # Show IPs (macOS/Legacy)
hostname -I               # Quick IP (Linux)
nslookup google.com       # DNS Query
dig +short google.com     # DNS IPs only
```

---

## 5. Network Diagnostics (Advanced)

```bash
# Connectivity
ping -c 4 google.com      # Ping 4 times
nc -zv google.com 443     # Test specific port connectivity (Netcat)
mtr google.com            # Visual traceroute

# Packet Inspection
tcpdump -i any port 443   # Dump traffic on port 443
tcpdump -i eth0 icmp      # Dump ping packets only

# HTTP Timing Debug
curl -w "%{time_total}\n" -o /dev/null -s https://site.com
```

---

## 6. Disk & System Health

### Resources

```bash
df -h                     # Disk usage (human readable)
du -sh ./*                # Folder sizes in current dir
free -h                   # Memory (RAM) usage
uptime                    # System load average
```

### "Silent" Disk Issues

```bash
df -ih                    # Inode usage (File count limits)
lsof | wc -l              # Count of open file handles
```

### Ops Panic Mode (Who is eating resources?)

```bash
# Top 10 CPU Consumers
ps aux --sort=-%cpu | head

# Top 10 Memory Consumers
ps aux --sort=-%mem | head
```

---

## 7. Search & Projects

### Project Search

```bash
# List all node_modules (Fast - skips contents)
find . -name "node_modules" -type d -prune

# Find specific config files
find . -name ".env"
find . -name "package.json" -not -path "*/node_modules/*"

# Search text inside files
grep -r "TODO" .
```

### Archives

```bash
tar -czvf app.tar.gz app/ # Compress
tar -xzvf app.tar.gz      # Extract
zip -r app.zip app/       # Zip
unzip app.zip             # Unzip
```

---

## 8. macOS Specific

```bash
open .                    # Open current folder in Finder
open file.txt             # Open file in default app
pbcopy < file.txt         # Copy file content to clipboard
pbpaste > newfile.txt     # Paste clipboard to file
ifconfig                  # Check IP
```

---

## 9. Power User Aliases & Functions

Add these to `~/.bashrc` or `~/.zshrc`.

### Safer Kill Port

Tries to kill gracefully first. If it refuses, force kills.

```bash
killport() {
  PID=$(lsof -t -i:$1)
  if [ -z "$PID" ]; then
    echo "No process on port $1"
  else
    kill $PID 2>/dev/null || kill -9 $PID
    echo "Killed process $PID on port $1"
  fi
}
# Usage: killport 3000
```

### Node Cleanup

Recursively delete `node_modules` (The fastest method).

```bash
alias nuke_modules="find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +"
```

### Quick Aliases

```bash
alias ports='lsof -i -P -n | grep LISTEN'
alias myip='curl ifconfig.me'
alias ll='ls -la'
```

---

## 10. Shortcuts

- **Ctrl + C** : Send SIGINT (Stop command)
- **Ctrl + Z** : Send SIGSTOP (Background command)
- **Ctrl + D** : Exit shell / EOF
- **Ctrl + L** : Clear screen
- **Ctrl + R** : Reverse history search
- **Ctrl + A** : Go to start of line
- **Ctrl + E** : Go to end of line
- **!!** : Re-run last command

---

## 11. Additional Productivity Tips

### Text Editing

```bash
nano file.txt              # Simple editor (easy for beginners)
vi file.txt                # Powerful editor (steep learning curve)
vim file.txt               # Enhanced vi (install if needed)
code file.txt              # Edit in VS Code
```

### Permissions & Ownership

```bash
ls -l                      # View permissions (rwx for read/write/execute)
chmod 755 file.sh          # Make executable (owner: rwx, group/others: rx)
chmod +x script.sh         # Add execute permission
chown user:group file      # Change owner/group
sudo command               # Run as root (use sparingly)
```

### Package Management (Linux/macOS)

```bash
# macOS (Homebrew)
brew install package       # Install software
brew update && brew upgrade # Update all

# Ubuntu/Debian
sudo apt update            # Refresh package list
sudo apt install package   # Install
sudo apt remove package    # Uninstall

# CentOS/RHEL
sudo yum install package   # Or dnf for newer versions
```

### Git Basics (Version Control)

```bash
git init                   # Initialize repo
git clone url              # Clone remote repo
git status                 # Check changes
git add .                  # Stage all changes
git commit -m "msg"        # Commit staged changes
git push origin main       # Push to remote
git pull                   # Fetch and merge changes
git log --oneline          # View commit history
```

### Web Development Helpers

```bash
# API Testing
curl -X GET https://api.example.com/data  # GET request
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://api.example.com  # POST JSON

# Download Files
wget https://example.com/file.zip  # Download file
curl -O https://example.com/file.zip  # Same with curl

# Node.js/NPM (if installed)
npm init                    # Create package.json
npm install package         # Install dependency
npm start                   # Run start script
yarn add package            # Yarn alternative
```

### Automation & Scripting

- **Bash Scripts**: Write reusable commands in `.sh` files (e.g., `#!/bin/bash\nls -la`).
- **Cron Jobs**: Schedule tasks with `crontab -e` (e.g., `0 9 * * * /path/to/script.sh` for daily 9 AM).
- **History**: `history` to list commands; `!n` to run nth command.

### Common Pitfalls & Tips

- Always check `pwd` before destructive commands like `rm -rf`.
- Use `alias` for frequent commands (e.g., `alias gs='git status'`).
- Backup important files before major changes.
- For large outputs, pipe to `less`: `command | less`.
- Combine commands: `ps aux | grep node | head -5` (find top Node processes).
- Learn one advanced tool per week to build expertise.
