# Terminal Guide (Linux & macOS)

**Efficient, chapter-wise, zero-redundancy terminal reference for developers.**
Optimized for fast lookup, daily workflows, and production debugging.

---

## Index

- [Terminal Guide (Linux \& macOS)](#terminal-guide-linux--macos)
  - [Index](#index)
  - [Quick Start](#quick-start)
  - [1. Navigation \& Filesystem](#1-navigation--filesystem)
  - [2. File Operations \& Symlinks](#2-file-operations--symlinks)
  - [3. Streams, Redirection \& Piping](#3-streams-redirection--piping)
  - [4. Viewing \& Editing Files](#4-viewing--editing-files)
  - [5. Permissions \& Ownership](#5-permissions--ownership)
  - [6. Search \& Discovery](#6-search--discovery)
  - [7. SSH \& Remote Access](#7-ssh--remote-access)
  - [8. Processes & Jobs](#8-processes--jobs)
  - [9. Networking & Ports](#9-networking--ports)
  - [10. Disk \& System Health](#10-disk--system-health)
  - [11. Archives (Zip/Tar)](#11-archives-ziptar)
  - [12. Git & Packages](#12-git--packages)
  - [13. macOS Specific](#13-macos-specific)
  - [14. Shortcuts \& Chaining](#14-shortcuts--chaining)
  - [15. Environment Variables](#15-environment-variables)
  - [16. macOS: System Cleanup & Analysis](#16-macos-system-cleanup--analysis)

---

## Quick Start

```bash
man ls              # Open full manual (quit with 'q')
clear               # Clear the screen (Ctrl+L)
history             # Show command history
!!                  # Run the last command again
sudo !!             # Run the last command with Sudo
~/.bashrc           # Bash config file (Linux)
~/.zshrc            # Zsh config file (macOS default)
source ~/.zshrc     # Reload shell config to apply changes
alias la="ls -la"   # Example: Create a shortcut 'la' for 'ls -la'
ulimit -n           # Max open files allowed
lsof | wc -l        # Current open file count
nohup command &     # Run command that survives terminal closure
disown              # Detach a background job from the shell
```

---

## 1. Navigation & Filesystem

**Goal:** Move around the system fast.

```bash
pwd                 # "Print Working Directory" (Where am I?)
cd folder/          # Enter a folder
cd ..               # Move up one level
cd ~                # Go to Home directory
cd -                # Toggle back to previous location (like a "Back" button)

# Listing files
ls                  # List visible files
ls -a               # List ALL files (including hidden, e.g., .env, .git)
ls -la              # Detailed list (permissions, size, owner, date)
ls -lt              # Sort by last modified time (newest first)
```
> **Pro Tip:** Modern alternatives like `exa` or `lsd` offer better defaults, colors, and features.

---

## 2. File Operations & Symlinks

**Goal:** Manage project structure and shortcuts.

### Create & Delete

```bash
touch file.txt      # Create empty file or update its timestamp
mkdir -p a/b/c      # Create nested folders (a -> b -> c) at once
rm file.txt         # Delete file (Permanent!)
rm -rf folder/      # Force delete folder and its contents (Handle with care!)
```

### Copy & Move

```bash
cp file.txt copy.txt    # Duplicate a file
cp -r src/ dist/        # Copy a folder recursively
mv old.txt new.txt      # Rename (if in same folder)
mv file.txt /tmp/       # Move (if to a different folder)
```

### Symlinks (Shortcuts)

_Crucial for linking configurations or node versions._

```bash
ln -s /path/to/original link-name   # Create a "soft link" (a pointer)
ls -l link-name                     # Verify where it points
```

---

## 3. Streams, Redirection & Piping

**Goal:** Save logs and combine tools.

### Redirection (`>` and `>>`)

```bash
echo "Hello" > file.txt   # OVERWRITE file with "Hello"
echo "World" >> file.txt  # APPEND "World" to the end of file
ps aux > processes.log    # Save command output to a file
```

### Piping (`|`)

_Take the output of command A and pass it as input to command B._

```bash
cat app.log | grep "Error"      # Show only errors from the log
ps aux | grep node | head -5    # Find node processes, show only top 5
history | grep "docker"         # Find "docker" in your past commands
```

### Debugging & Control Flow

```bash
command > out.txt        # Redirect stdout to a file
command 2> err.txt       # Redirect stderr to a file
command &> all.txt       # Redirect both stdout and stderr
command || echo "failed" # Run second command ONLY if the first one fails
command && echo "ok"     # Run second command ONLY if the first one succeeds
echo $?                  # Get exit code of last command (0 = success)
```

---

## 4. Viewing & Editing Files

**Goal:** Inspect logs or edit configs quickly.

```bash
cat file.txt        # Print whole file (for small files)
less big.log        # Scrollable view for large files (Press 'q' to quit)
head -n 10 file.txt # View first 10 lines
tail -n 10 file.txt # View last 10 lines
tail -f app.log     # Watch file changes in real-time (Live logs)
code .              # Open current folder in VS Code
nano file.txt       # Basic in-terminal editor (Ctrl+O Save, Ctrl+X Exit)
```
> **Pro Tip:** `bat` is a modern alternative to `cat` with syntax highlighting and Git integration.

---

## 5. Permissions & Ownership

**Goal:** Fix "Permission Denied" errors.

### Understanding `ls -l`

Output example: `-rwxr-xr--`
1.  **`-`**: File type (d: directory, l: link)
2.  **`rwx`**: Owner permissions (Read, Write, Execute)
3.  **`r-x`**: Group permissions
4.  **`r--`**: Others permissions

### Commands

```bash
chmod +x script.sh       # Make file Executable for everyone
chmod 755 script.sh      # Set permissions using numbers (r=4, w=2, x=1)
chown user:group file    # Change ownership
sudo command             # Run command as Root (Superuser)
```

---

## 6. Search & Discovery

**Goal:** Find code snippets, configurations, or lost files.

### Search INSIDE files (`grep`)

```bash
grep "TODO" file.ts         # Find "TODO" in a specific file
grep -r "API_KEY" .         # Recursive search in all files in current directory
grep -i "error" app.log     # Case-insensitive search
grep -v "DEBUG" app.log     # Invert match: show lines that DO NOT contain "DEBUG"
grep -n "fail" app.log      # Show line numbers with matches
```
> **Pro Tip:** `ripgrep` (`rg`) is a modern, faster, and more developer-friendly alternative to `grep`.

### Search FOR files (`find`)

```bash
find . -name "*.ts"      # Find all TypeScript files in current directory
find . -name ".env"      # Find all .env files
find /var/log -mtime -7  # Find files in /var/log modified in the last 7 days
find . -name node_modules -type d -prune # Search excluding node_modules
```
> **Pro Tip:** `fd` is a simpler, faster, and more intuitive alternative to `find`.

---

## 7. SSH & Remote Access

**Goal:** Manage servers and transfer files securely.

```bash
ssh user@192.168.1.5         # Login to a remote server
exit                         # Logout from the server

# Secure Copy (SCP)
scp file.txt user@ip:/var/www/      # Copy LOCAL file to REMOTE
scp user@ip:/var/log/app.log .      # Copy REMOTE file to LOCAL (.)
```

---

## 8. Processes & Jobs

**Goal:** Manage stuck applications and system performance.

```bash
ps aux | grep 'node'     # Find running Node processes (the old way)
pgrep 'node'             # Find PID of Node processes directly
pkill 'node'             # Kill Node processes by name

top                      # Live System Monitor
htop                     # Interactive, user-friendly monitor
kill PID                 # Graceful stop (sends SIGTERM)
kill -9 PID              # Force kill (sends SIGKILL, the "nuclear option")
```

---

## 9. Networking & Ports

**Goal:** Debug APIs, firewalls, and local servers.

```bash
lsof -i :3000            # See what is running on port 3000
kill $(lsof -t -i:3000)  # Kill process on port 3000 instantly

curl -I https://site.com # Show Headers only (Debug CORS/Status)
curl -o data.json url    # Download and save to file
wget https://file.zip    # Download file (resumes, recursive)

# DNS & Connectivity
ping google.com          # Check if a host is reachable
dig google.com           # Advanced DNS lookup
nslookup google.com      # Another DNS lookup tool
```

---

## 10. Disk & System Health

**Goal:** Ops troubleshooting and system monitoring.

```bash
df -h                    # Disk usage (shows free space per partition)
du -sh ./*               # Size of all folders in current directory
free -h                  # RAM usage (Linux)
uptime                   # System load average & uptime
```

---

## 11. Archives (Zip/Tar)

**Goal:** Compress and extract files.

```bash
zip -r app.zip folder/   # Compress a folder to Zip
unzip app.zip            # Extract a Zip file
tar -czvf app.tar.gz src/ # Compress 'src' folder to a gzipped Tar archive
tar -xzvf app.tar.gz      # Extract a gzipped Tar archive
```

---

## 12. Git & Packages

**Goal:** Version control and software installation.

```bash
git status               # Check changes
git pull                 # Get updates
brew install node        # macOS Install (using Homebrew)
sudo apt install curl    # Debian/Ubuntu Linux Install
sudo yum install curl    # RHEL/CentOS Linux Install
```

---

## 13. macOS Specific

```bash
open .                   # Open current folder in Finder
pbcopy < file.txt        # Copy file content to Clipboard
pbpaste > new.txt        # Paste Clipboard to file
```

---

## 14. Shortcuts & Chaining

**Goal:** Improve speed and workflow efficiency.

### Command Chaining

```bash
mkdir test && cd test    # Run 'cd' ONLY if 'mkdir' succeeds
npm install ; npm start  # Run 'install', then run 'start' (regardless of errors)
```

### Keyboard Shortcuts

| Keys         | Action                    |
| :----------- | :------------------------ |
| **Ctrl + C** | Stop running command      |
| **Ctrl + L** | Clear screen              |
| **Ctrl + R** | Search command history    |
| **Ctrl + A** | Jump to start of line     |
| **Ctrl + E** | Jump to end of line       |
| **Tab**      | Autocomplete file/command |

---

## 15. Environment Variables

**Goal:** Manage configuration for applications and the shell itself.

```bash
# Viewing Variables
env                  # Show all environment variables
printenv HOME        # Show the value of a specific variable ($HOME)
echo $HOME           # Another way to show a variable's value

# Setting Variables
export MY_VAR="hello"   # Set a variable for the current session
echo $MY_VAR         # Displays "hello"

# Running a command with a temporary variable
MY_VAR="temp" node my_script.js

# To make a variable permanent, add the 'export' line to your
# shell's config file (~/.zshrc or ~/.bashrc) and then reload it.
source ~/.zshrc
```

---

## 16. macOS: System Cleanup & Analysis

**Goal:** Safely check for installed packages, analyze disk usage, and perform cleanups without breaking the OS.

### Safety First: macOS vs. Linux

**Do NOT use these Linux commands on macOS:** `dpkg`, `rpm`, `apt`, `yum`, `systemctl`. They will fail or, worse, cause damage. macOS has its own set of tools.

### 1. Viewing Installed Packages (Read-Only & Safe)

```bash
# Homebrew (Community package manager)
brew list            # List all installed packages
brew list --versions # List packages with version numbers

# Mac App Store
mas list             # List all apps installed from the App Store

# Node.js Global Packages
npm list -g --depth=0
yarn global list
pnpm list -g --depth=0
```

### 2. Analyzing System Health & Disk Usage (Read-Only & Safe)

```bash
# Check for common issues with your Homebrew setup
brew doctor
```

The best tool for analyzing disk space is `ncdu`. It provides an interactive way to see what's eating your disk space.

```bash
# Install ncdu (if you don't have it)
brew install ncdu

# Run ncdu (read-only)
ncdu ~          # Safest: Scan your home folder only
sudo ncdu /     # Advanced: Scan the entire disk (view only!)
```

Other useful read-only commands:

```bash
df -h /         # Show free space on the root disk
# See size of top-level folders. WARNING: Can be slow.
sudo du -xh /System /Applications /Library /usr /opt 2>/dev/null | sort -h
```

### 3. Finding Hidden Files & Folders (Read-Only & Safe)

Focus your search on your home directory (`~`) to avoid system areas.

```bash
# Find hidden folders inside your home directory
find ~ -type d -name ".*" -maxdepth 2
```

### 4. Inspecting Startup & Background Services (Read-Only & Safe)

```bash
# View all loaded services
launchctl list

# Check user-specific startup agents (usually safe to inspect)
ls ~/Library/LaunchAgents

# System-wide daemons (DO NOT DELETE FROM HERE)
ls /Library/LaunchDaemons
ls /System/Library/LaunchAgents
ls /System/Library/LaunchDaemons
```

### 5. Safe Cleanup Operations

The `-n` or `--dry-run` flag is crucial. It shows you what *would* be removed without actually deleting anything. **Always dry run first.**

```bash
# See what cleanup would remove (dry run)
brew cleanup -n

# Actually clean up old Homebrew packages and caches
brew cleanup

# See what unused dependencies would be removed (dry run)
brew autoremove -n

# Manually delete caches and logs (Generally safe)
# Open these in Finder and inspect before deleting content
open ~/Library/Caches
open ~/Library/Logs
open ~/Downloads
```

### 6. 🚫 What NOT to Delete (CRITICAL) 🚫

Deleting files from these locations will likely break macOS and require a reinstall. **HANDS OFF!**

-   `/System`
-   `/private`
-   `/usr`
-   `/bin`
-   `/sbin`
-   Any file or folder protected by SIP (System Integrity Protection).

**✅ Golden Rule for macOS:**
If you didn't put it there yourself, or it's not inside your home folder (`~`), **don't delete it.** When in doubt, leave it alone.
