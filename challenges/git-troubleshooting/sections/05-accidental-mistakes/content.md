# Fixing Accidental Mistakes

Everyone makes mistakes. Committing changes to the wrong branch, committing typos, or accidentally committing credentials/secrets like passwords are very common scenarios. Let's learn how to rectify these problems.

---

## 1. Committing to the Wrong Branch

If you accidentally commit work directly to `main` (or `master`) instead of a separate feature branch `feature-login`:
1. Create the new branch at your current HEAD (copying the commit):
   ```bash
   git branch feature-login
   ```
2. Reset `main` back by one commit, throwing away the local commit there:
   ```bash
   git reset --hard HEAD~1
   ```
This leaves `main` clean and leaves the commit safely isolated on `feature-login`.

---

## 2. Undoing the Latest Local Commit

If you committed too early, or want to edit the commit files and staging index:
```bash
git reset --soft HEAD~1
```
This moves the branch pointer back, but keeps all changes staged.

---

## 3. Removing Sensitive Files from History

If you committed a secret file `password.txt` in the latest commit, you must remove it. Running `git rm password.txt` will delete it, but the file **still exists in the previous commit history**.

To purge it from the current branch's latest commit entirely:
1. Untrack the file:
   ```bash
   git rm --cached password.txt
   ```
2. Add it to `.gitignore` to prevent tracking it again:
   ```bash
   echo "password.txt" >> .gitignore
   git add .gitignore
   ```
3. Amend your last commit to remove it from history:
   ```bash
   git commit --amend --no-edit
   ```
This overwrites your last commit, replacing it with a new commit that does not contain `password.txt`.

---

## Lab Tasks

### Task 1: Remove Sensitive File
1. Start the lab in your terminal:
   ```bash
   tld start git-remove-sensitive-file
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Sensitive file removed from commit history and ignored successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Undo the Last Commit
1. Start the lab in your terminal:
   ```bash
   tld start git-undo-last-commit
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Last commit undone and changes kept in staging index.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 3: Fix Commit on Wrong Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-wrong-branch-fix
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Accidental commit moved to 'feature-login' and default branch reset successfully.
4. Verify the task:
   ```bash
   tld check
   ```
