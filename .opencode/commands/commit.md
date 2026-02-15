---
description: Commit current changes with an appropriate message
agent: sisyphus
model: opencode/minimax-m2.5-free
---

Analyze the current repository state and create an appropriate git commit.

Current git status:
!`git status`

Staged changes (if any):
!`git diff --cached --stat 2>/dev/null || echo "No staged changes"`

Unstaged changes:
!`git diff --stat`

Full diff of unstaged changes:
!`git diff`

Based on the changes above:
1. If there are unstaged changes, stage them first with `git add .`
2. Analyze the changes to understand what was modified, added, or deleted
3. Generate a concise, descriptive commit message that follows conventional commit style (e.g., "feat: add new feature", "fix: resolve bug", "refactor: improve code structure", "docs: update documentation")
4. Execute the git commit with the generated message

If there are no changes to commit, inform the user that the working directory is clean.

Output the commit result and show the commit hash when successful.
