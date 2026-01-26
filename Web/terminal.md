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
    - [Create \& Delete](#create--delete)
    - [Copy \& Move](#copy--move)
    - [Symlinks (Shortcuts)](#symlinks-shortcuts)
  - [3. Streams, Redirection \& Piping](#3-streams-redirection--piping)
    - [Redirection (`>` and `>>`)](#redirection--and-)
    - [Piping (`|`)](#piping-)
    - [debugging CI, scripts, prod issues.](#debugging-ci-scripts-prod-issues)
  - [4. Viewing \& Editing Files](#4-viewing--editing-files)
  - [5. Permissions \& Ownership](#5-permissions--ownership)
    - [Understanding `ls -l`](#understanding-ls--l)
    - [Commands](#commands)
  - [6. Search \& Discovery](#6-search--discovery)
  - [7. SSH \& Remote Access](#7-ssh--remote-access)
  - [8. Processes \& Jobs](#8-processes--jobs)
  - [9. Networking \& Ports](#9-networking--ports)
  - [10. Disk \& System Health](#10-disk--system-health)
  - [11. Archives (Zip/Tar)](#11-archives-ziptar)
  - [12. Git \& Packages](#12-git--packages)
  - [13. macOS Specific](#13-macos-specific)
  - [14. Shortcuts \& Chaining](#14-shortcuts--chaining)
    - [Command Chaining](#command-chaining)
    - [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Quick Start

```bash
man ls              # Open full manual (quit with 'q')
clear               # Clear the screen (Ctrl+L)
history             # Show command history
!!                  # Run the last command again
sudo !!             # Run the last command with Sudo
~/.bashrc           # Bash (Linux)
~/.zshrc            # Zsh (macOS default)
source ~/.zshrc     # Reload config
ulimit -n           # Max open files
lsof | wc -l        # Current open file count
df -ih              # Inode usage (file count exhaustion)
nohup command &     # Survive terminal close
disown              # Detach job from shell

history | tail
!123                # Run command #123
!!                  # Repeat last command
Ctrl+R              # Reverse search (already listed, good)





```

---

## 1. Navigation & Filesystem

**Goal:** Move around the system fast.

```bash
pwd                 # "Print Working Directory" (Where am I?)
cd folder/          # Enter a folder
cd ..               # Move up one level
cd ../..            # Move up two levels
cd ~                # Go to Home directory
cd -                # Toggle back to previous location (The "Back" button)

ls                  # List visible files
ls -a               # List ALL files (including hidden .env, .git)
ls -la              # Detailed list (permissions, size, owner, date)
```

---

## 2. File Operations & Symlinks

**Goal:** Manage project structure and shortcuts.

### Create & Delete

```bash
touch file.txt      # Create empty file
mkdir -p a/b/c      # Create nested folders (a -> b -> c) at once
rm file.txt         # Delete file (Permanent!)
rm -rf folder/      # Force delete folder (Handle with care)
```

### Copy & Move

```bash
cp file.txt copy.txt    # Duplicate a file
cp -r src/ dist/        # Copy a folder recursively
mv old.txt new.txt      # Rename (if dest is same folder)
mv file.txt /tmp/       # Move (if dest is different folder)
```

### Symlinks (Shortcuts)

_Crucial for linking configurations or node versions._

```bash
ln -s /path/to/original link-name   # Create a "soft link"
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

_Take the output of command A and pass it to command B._

```bash
cat app.log | grep "Error"      # Show only errors from the log
ps aux | grep node | head -5    # Find node processes, show only top 5
history | grep "docker"         # Find "docker" in your past commands
```

### debugging CI, scripts, prod issues.

```bash
command > out.txt        # stdout
command 2> err.txt       # stderr
command &> all.txt       # stdout + stderr
command || echo "failed" # Run if command fails
command && echo "ok"     # Run if command succeeds
echo $?                  # Exit code of last command (0 = success)
```

---

## 4. Viewing & Editing Files

**Goal:** Inspect logs or edit configs.

```bash
cat file.txt        # Print whole file (small files)
less big.log        # Scrollable view (Press 'q' to quit)
head -n 10 file.txt # View first 10 lines
tail -f app.log     # Watch file changes in real-time (Live logs)
code .              # Open current folder in VS Code
nano file.txt       # Edit in terminal (Ctrl+O Save, Ctrl+X Exit)
```

---

## 5. Permissions & Ownership

**Goal:** Fix "Permission Denied" errors.

### Understanding `ls -l`

Output example: `-rwxr-xr--`

1. **`-`** : File (if `d`, it is a directory)
2. **`rwx`** (Owner): Read, Write, Execute
3. **`r-x`** (Group): Read, Execute
4. **`r--`** (Others): Read only

### Commands

```bash
chmod +x script.sh       # Make file Executable
chown user:group file    # Change ownership
sudo command             # Run command as Root (Superuser)
```

---

## 6. Search & Discovery

**Goal:** Find code snippets or lost files.

```bash
# Search INSIDE files
grep "TODO" file.ts      # Find "TODO" in specific file
grep -r "API_KEY" .      # Recursive search in ALL files here

# Search FOR files
find . -name "*.ts"      # Find all TypeScript files
find . -name ".env"      # Find .env files
find . -name node_modules -type d -prune # Search excluding node_modules
```

---

## 7. SSH & Remote Access

**Goal:** Manage servers and transfer files.

```bash
ssh user@192.168.1.5         # Login to remote server
exit                         # Logout from server

# Secure Copy (SCP)
scp file.txt user@ip:/var/www/      # Copy LOCAL file to REMOTE
scp user@ip:/var/log/app.log .      # Copy REMOTE file to LOCAL (.)
```

---

## 8. Processes & Jobs

**Goal:** Manage stuck apps and performance.

```bash
ps aux | grep node       # Find running Node processes
top                      # Live System Monitor
htop                     # Interactive Monitor (Better UI)
kill PID                 # Graceful stop (Get PID from ps aux)
kill -9 PID              # Force kill (Nuclear option)
```

---

## 9. Networking & Ports

**Goal:** Debug APIs and local servers.

```bash
lsof -i :3000            # See what is running on port 3000
kill $(lsof -t -i:3000)  # Kill process on port 3000 instantly

curl -I https://site.com # Show Headers only (Debug CORS/Status)
curl -o data.json url    # Download and save to file
wget https://file.zip    # Download file
```

---

## 10. Disk & System Health

**Goal:** Ops troubleshooting.

```bash
df -h                    # Disk usage (Free space)
du -sh ./*               # Size of folders in current dir
free -h                  # RAM usage
uptime                   # Load average & uptime
```

---

## 11. Archives (Zip/Tar)

```bash
zip -r app.zip folder/   # Compress to Zip
unzip app.zip            # Extract Zip
tar -czvf app.tar.gz src/ # Compress to Tar
tar -xzvf app.tar.gz      # Extract Tar
```

---

## 12. Git & Packages

**Goal:** Version control and installation.

```bash
git status               # Check changes
git pull                 # Get updates
brew install node        # macOS Install
sudo apt install curl    # Linux Install
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

**Goal:** Speed and Workflow.

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
| **Ctrl + R** | Search history            |
| **Ctrl + A** | Jump to start of line     |
| **Ctrl + E** | Jump to end of line       |
| **Tab**      | Autocomplete file/command |

---

**✅ Golden Rules:**

1. Always run `pwd` before running `rm -rf`.
2. Use `mv` to rename files in the same folder.
3. Pipe huge output to less: `cat large.log | less`.
