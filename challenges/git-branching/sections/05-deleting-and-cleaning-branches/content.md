# Deleting & Cleaning Branches

As you develop more features, your repository will accumulate many branches. To keep your workspace clean and organized, you should delete feature branches once they are successfully merged.

---

## 1. Listing Branches

To list all local branches in your repository:
```bash
git branch
```

The branch marked with an asterisk `*` is the branch you are currently on.

To list both local and remote branches:
```bash
git branch -a
```

---

## 2. Deleting a Merged Branch

If a branch has already been merged into your current branch (e.g. `main`), you can safely delete it using the `-d` (lowercase) flag:

```bash
git branch -d <branch-name>
```

For example:
```bash
git branch -d feature-login
```

This acts as a safety check: if the branch has **not** been merged, Git will warn you and prevent the deletion to avoid losing work.

---

## 3. Forcing Deletion of an Unmerged Branch

If you want to discard an experimental or abandoned branch without merging it, you must use the `-D` (uppercase) flag to force deletion:

```bash
git branch -D <branch-name>
```
This skips the safety checks and permanently deletes the branch.

---

## Lab Tasks

### Task 1: Delete a Merged Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-delete-merged-branch
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Merged branch 'feature-old' deleted successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: List Branches
1. Start the lab in your terminal:
   ```bash
   tld start git-list-branches
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Branch list saved and verified successfully.
4. Verify the task:
   ```bash
   tld check
   ```
