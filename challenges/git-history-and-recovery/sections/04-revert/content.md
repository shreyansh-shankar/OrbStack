# Undoing with Git Revert

While `git reset` rewrite history by moving branch pointers back, this is problematic if the branch has already been shared (pushed) to a remote server. Changing history on shared branches can cause significant synchronization errors for other developers.

To undo changes in shared history safely, Git provides **`git revert`**.

---

## 1. How Git Revert Works

`git revert` does not delete or change any existing commits. Instead, it computes the changes introduced by a specific old commit, inverts those changes, and creates a **brand new commit** that applies the inverse modifications.

```bash
git revert <commit-hash>
```

For example, if commit `2ff2218` added a line to a file, running `git revert 2ff2218` will create a new commit that deletes that line.

---

## 2. Reverting Multiple Commits

You can revert multiple commits in sequence. If you want to undo the changes of multiple commits without creating a revert commit for each one, use the `-n` (or `--no-commit`) flag:

```bash
git revert -n <commit-hash-1> <commit-hash-2>
```

This applies the inverse changes of the specified commits to your staging area and working directory, letting you inspect the final state and create a single commit manually.

---

## Lab Tasks

### Task 1: Revert a Bad Commit
1. Start the lab in your terminal:
   ```bash
   tld start git-revert-bad-commit
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Bad commit reverted successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Revert Multiple Commits
1. Start the lab in your terminal:
   ```bash
   tld start git-revert-multiple-commits
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Successfully reverted multiple commits in a single custom commit.
4. Verify the task:
   ```bash
   tld check
   ```
