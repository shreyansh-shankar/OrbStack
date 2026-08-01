# Undoing with Git Reset

The `git reset` command is used to undo commits by moving the branch pointer back in time. Git provides three modes of reset, which determine what happens to your staging area and working directory changes when a commit is undone.

---

## The Three Reset Modes

Let's assume we want to undo the last commit (`HEAD~1`):

### 1. Soft Reset (`--soft`)
```bash
git reset --soft HEAD~1
```
- **What it does**: Moves the branch pointer back by one commit.
- **Staging Area**: **Kept**. All changes from the undone commit remain staged (ready to commit).
- **Working Directory**: **Kept**. Your files are unmodified.

### 2. Mixed Reset (`--mixed` / Default)
```bash
git reset HEAD~1
```
- **What it does**: Moves the branch pointer back by one commit.
- **Staging Area**: **Reset**. Changes are removed from the staging area.
- **Working Directory**: **Kept**. Your files are unmodified (they appear as modified, unstaged changes).

### 3. Hard Reset (`--hard`)
```bash
git reset --hard HEAD~1
```
- **What it does**: Moves the branch pointer back by one commit.
- **Staging Area**: **Reset**.
- **Working Directory**: **Reset**. **All changes since that commit are permanently discarded.**

> [!WARNING]
> A `git reset --hard` will permanently overwrite uncommitted changes in your working directory. Use it with extreme caution!

---

## Lab Tasks

### Task 1: Perform a Hard Reset
1. Start the lab in your terminal:
   ```bash
   tld start git-hard-reset
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Hard reset completed successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Perform a Mixed Reset
1. Start the lab in your terminal:
   ```bash
   tld start git-mixed-reset
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Mixed reset completed successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 3: Perform a Soft Reset
1. Start the lab in your terminal:
   ```bash
   tld start git-soft-reset
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Soft reset completed successfully.
4. Verify the task:
   ```bash
   tld check
   ```
