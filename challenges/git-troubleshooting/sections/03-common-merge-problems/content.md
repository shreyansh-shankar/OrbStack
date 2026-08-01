# Common Merge Problems

Merge conflicts are part of collaborative coding, but sometimes a merge gets so messy or confusing that you want to start over, or you need to finalize it properly after conflict edits. Let's look at how to manage active merge states.

---

## 1. Aborting a Merge

If you run `git merge` and are confronted with hundreds of complex conflict markers across multiple files, you might decide it is safer to stop the merge, align with your team, and try again later.

To completely cancel the merge and return your repository to the exact clean state before the merge attempt, use the `--abort` flag:

```bash
git merge --abort
```

This commands cleans conflict markers, removes the conflict state, and resets the working directory.

---

## 2. Completing a Merge

If you *do* want to resolve conflicts:
1. Open the conflicted files.
2. Locate the conflict markers:
   ```text
   <<<<<<< HEAD
   local changes
   =======
   remote changes
   >>>>>>> branch-name
   ```
3. Edit the files to keep the desired code, removing the conflict marker lines completely.
4. Stage the resolved files:
   ```bash
   git add <resolved-file>
   ```
5. Commit to complete the merge:
   ```bash
   git commit
   ```
   (This creates a merge commit containing both branch parents).

---

## Lab Tasks

### Task 1: Abort a Conflicted Merge
1. Start the lab in your terminal:
   ```bash
   tld start git-abort-merge
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Conflicted merge aborted successfully and repository clean.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Finish a Conflicted Merge
1. Start the lab in your terminal:
   ```bash
   tld start git-finish-conflicted-merge
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Conflicted merge resolved and committed successfully.
4. Verify the task:
   ```bash
   tld check
   ```
