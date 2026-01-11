# Commit

# Normal commit

git commit -m "your message"

# Commit bypassing hooks

git commit -m "your message" --no-verify

# Commit amend (modify last commit, keep message)

git commit --amend --no-edit

# Commit amend with new message

git commit --amend -m "new message"

# Stage selected changes interactively

git add -p

Reset (Undoing Changes)

# Soft reset (keep changes staged)

git reset --soft HEAD~1

# Mixed reset (keep changes unstaged)

git reset --mixed HEAD~1

# Hard reset (discard changes completely)

git reset --hard HEAD~1

# Reset branch to remote develop

git fetch origin
git reset --hard origin/develop

Stash

git stash # Stash changes
git stash save "WIP: message" # With message
git stash list # List stashes
git stash apply # Apply, keep stash
git stash pop # Apply and drop stash
git stash drop stash@{2} # Drop specific stash
git stash clear

Branching

git checkout -b feat/new-feature # Create branch
git checkout develop # Switch branch
git branch -d branchname # Delete local
git branch -D branchname # Force delete local
git push origin --delete branch # Delete remote

Rebasing & Merging
git fetch origin
git rebase origin/develop # Rebase on develop
git rebase -i HEAD~3 # Interactive rebase
git rebase --abort # Abort rebase
git merge develop # Merge develop

Cherry-pick & Patch

git cherry-pick <commit-hash> # Cherry-pick commit
git format-patch -1 <commit-hash> # Create patch file
git apply patchfile.patch # Apply patch

Logs & History

git log --oneline --graph --decorate --all # Pretty log
git show # Show last commit
git blame file.js # Blame file

Remote

git remote add origin git@github.com:user/repo.git # Add remote
git remote -v # Show remotes
git fetch -p
