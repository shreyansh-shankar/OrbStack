# Working Tree Problems

When writing code, you often end up with untracked junk files, uncommitted edits in files that you want to throw away, or unfinished modifications that prevent you from switching branches. Git provides powerful tools to clean, restore, and stash changes.

---

## 1. Purging Untracked Files (`git clean`)

Untracked files are files in your working directory that are not tracked by Git and are not ignored by `.gitignore`. To delete them:

```bash
git clean -f
```
To also delete untracked directories, use the `-d` flag:
```bash
git clean -fd
```
Use `git clean -n` or `git clean -nd` to do a **dry run** to inspect what files would be deleted before running the actual deletion.

---

## 2. Discarding Local Modifications (`git restore`)

If you edit a tracked file and realize the edits are incorrect, you can restore the file to the state of the last committed index:

```bash
git restore <file-path>
```
(Previously, developers ran `git checkout -- <file-path>` which achieves the same result).

---

## 3. Stashing Unfinished Work (`git stash`)

If you need to switch branches or pull changes, but have uncommitted modifications that you do not want to commit yet, you can **stash** them.

To shelf modifications to a clean stack:
```bash
git stash
```

This restores your working directory to a clean HEAD state. Once you are ready to recover your edits:
```bash
git stash pop
```
(This restores the stashed modifications and removes them from the stash list).
To view all active stashes:
```bash
git stash list
```

---

## Lab Tasks

### Task 1: Clean Working Tree
1. Start the lab in your terminal:
   ```bash
   tld start git-clean-working-tree
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Working tree cleaned successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Restore a Tracked File
1. Start the lab in your terminal:
   ```bash
   tld start git-restore-file
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Tracked file restored successfully to stable commit.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 3: Stash Local Modifications
1. Start the lab in your terminal:
   ```bash
   tld start git-stash-changes
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Changes stashed successfully.
4. Verify the task:
   ```bash
   tld check
   ```
