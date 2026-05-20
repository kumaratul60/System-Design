# Git & GitHub Repo Analysis (Pre-Read)

Run these commands before reading code to quickly understand a repository's architecture, hotspots, and current team velocity.

---

## 1) Hotspots (High Churn)

Identify files that change most frequently-often indicators of fragile code or over-centralized logic.

```bash
git log --format=format: --name-only --since="1 year ago" \
| sort | uniq -c | sort -nr | head -20
```

---

## 2) God Objects (Churn + Size)

A file that changes often is a hotspot; if it's also _large_, it's likely a "God Object" needing refactoring.

```bash
git log --format=format: --name-only --since="1 year ago" | sort | uniq -c | sort -nr | head -15 \
| awk '{print $2}' | xargs wc -l | sort -nr
```

---

## 3) Bug-Prone Files

Filter commits mentioning "fix," "bug," or "broken" to highlight unstable areas.

```bash
git log -i -E --grep="fix|bug|broken" --name-only --format='' \
| sort | uniq -c | sort -nr | head -20
```

---

## 4) Branch Health & Stale Work

Identify active vs. stale remote branches to understand what's actually being worked on.

```bash
git branch -r --sort=-committerdate --format="%(committerdate:relative)%09%(refname:short)%09%(authorname)" | head -15
```

---

## 5) Emergency & Revert Patterns

Find recent production instability or rolled-back changes.

```bash
git log --oneline --since="6 months ago" \
| grep -iE 'revert|hotfix|emergency|rollback'

git log -i -E --grep="fix|bug|broken" --name-only --format='' | sort | uniq -c | sort -nr | head -20

```

---

## 6) Ownership & Knowledge Silos

Quickly identify the primary maintainer of a specific directory or file.

```bash
git shortlog -sn -- <path/to/dir-or-file>
```

```bash
git shortlog -sn --no-merges
git shortlog -sn --no-merges --since="6 months ago"

```

## Is This Project Accelerating or Dying

Commit count by month, for the entire history of the repo. I scan the output looking for shapes. A steady rhythm is healthy. But what does it look like when the count drops by half in a single month? Usually someone left. A declining curve over 6 to 12 months tells you the team is losing momentum. Periodic spikes followed by quiet months means the team batches work into releases instead of shipping continuously.

```bash
git log --format='%ad' --date=format:'%Y-%m' | sort | uniq -c
```

---

## 7) Visual Repo Topology

See the "shape" of the repo: long-lived branches, merge patterns, and recent activity.

```bash
git log --oneline --graph --decorate --all -n 25
```

---

# GitHub PR & Team Velocity

## 8) Detailed Open PR Scan

Identify large, complex, or stale PRs that might block the team.

```bash
gh pr list --limit 100 --state open \
--json number,title,author,changedFiles,updatedAt \
--template '{{range .}}{{.number | color "cyan"}} | {{.author.login | printf "%-15s"}} | {{.changedFiles | printf "%3d"}} files | {{.updatedAt | timeago}} | {{.title}}{{"\n"}}{{end}}'
```

---

## 9) Conflict Risk Assessment

Identify PRs that touch more than 50 files—likely candidates for merge conflicts and slow reviews.

```bash
gh pr list --json number,changedFiles,title \
--jq '.[] | select(.changedFiles > 50) | "\(.number) | \(.changedFiles) files | \(.title)"'
```

---

## 10) Rebase All Feature Branches

Batch-rebase all open PRs against the current base branch (requires `gh`).

```bash
gh pr list --state open --json number --jq '.[].number' \
| xargs -I {} gh pr update-branch --rebase {}
```

---

# Strategy: The "Pre-Read" Workflow

1.  **Health Check:** Run `Hotspots` + `God Objects` → Locate the "danger zones."
2.  **Ownership:** Run `shortlog` on hotspots → Know who to ask for context.
3.  **In-Flight Work:** Run `gh pr list` → See what's changing _right now_.
4.  **Instability:** Run `Bug-Prone` + `Emergency` → Identify fragile systems.
5.  **Context:** Run `Visual Topology` → Understand the branching strategy.

---

# Optional: All-in-One Analysis Script

```bash
#!/usr/bin/env bash

printf "\n--- HOTSPOTS (1 YEAR) ---\n"
git log --format=format: --name-only --since="1 year ago" | sort | uniq -c | sort -nr | head -10

printf "\n--- GOD OBJECTS (CHURN + LINES) ---\n"
git log --format=format: --name-only --since="1 year ago" | sort | uniq -c | sort -nr | head -10 | awk '{print $2}' | xargs wc -l | sort -nr

printf "\n--- TOP CONTRIBUTORS ---\n"
git shortlog -sn --no-merges -n 5

printf "\n--- STALE BRANCHES (TOP 5) ---\n"
git branch -r --sort=committerdate --format="%(committerdate:relative) -> %(refname:short)" | head -5
```

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: What is "Trunk-Based Development" vs. "GitFlow" at scale?
> **Answer:** 
> - **GitFlow:** Uses long-lived feature branches, develop, and release branches. **Pros:** Stable, controlled releases. **Cons:** Merge hell, high lead time.
> - **Trunk-Based:** Developers push small, frequent commits directly to `main` (or short-lived PRs). **Pros:** Fast feedback, CI/CD compatibility. **Cons:** Requires rigorous automated testing and **Feature Flags** to prevent breaking production.
> - **The "Staff" Choice:** High-velocity teams (Amazon, Google) use Trunk-Based development to minimize integration friction.

### Q2: How do you solve the "Monorepo Bloat" problem in Git?
> **Answer:** As a monorepo grows to GBs of history, `git clone` and `git status` become painfully slow. 
> - **The Fix:** 
>   1. **Sparse Checkout:** Only download the specific directories you need to work on.
>   2. **Shallow Clone (`--depth 1`):** Only download the latest commit history.
>   3. **VFS for Git (Microsoft):** A virtual filesystem that only downloads files when they are accessed.

### Q3: Explain "Git Hooks" as a Governance Tool.
> **Answer:** You can use **Pre-commit** and **Pre-push** hooks to enforce team standards. 
> - **Examples:** Block commits that contain "FIXME" comments, ensure `package-lock.json` is updated, run linting, and prevent committing large files or secrets (using tools like `git-secrets`).

### Q4: Why is `git push --force` dangerous, and what is the safer alternative?
> **Answer:** `--force` overwrites the remote branch with your local history, potentially deleting someone else's work if they pushed in the meantime. 
> - **The Alternative:** **`git push --force-with-lease`**. This command checks if the remote branch has changed since your last fetch. If it has, it refuses to push, protecting the work of your teammates.

---

Use this to build an architectural map of an unfamiliar repository in under 2 minutes.

- https://piechowski.io/post/git-commands-before-reading-code
