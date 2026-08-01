# Recovering Lost Branches & Commits

One of the most stressful experiences in development is accidentally deleting a branch containing unmerged changes. Because the branch pointer is deleted, it doesn't appear in your branch list (`git branch`).

However, as long as commits were created in that branch, Git still keeps the commit objects in its database, and the checkout history remains in your local **reflog**.

---

## Restoring a Deleted Branch

Let's assume you had a branch named `feature-experimental` that you deleted using `git branch -D feature-experimental`.

To restore this branch:
1. Run `git reflog` to view your HEAD moves history.
2. Look for the last transition onto or within that branch (e.g. `checkout: moving from feature-experimental to main` or `commit: Add experiment code`).
3. Take note of the commit hash associated with that entry (e.g. `d4e5f67`).
4. Recreate the branch pointing exactly at that commit hash:
   ```bash
   git branch experimental-restored <commit-hash>
   ```

Now, checking out `experimental-restored` restores your files and history exactly as they were!

---

## Lab Tasks

### Task 1: Recover Deleted History
1. Start the lab in your terminal:
   ```bash
   tld start git-recover-deleted-history
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Deleted branch successfully recovered and restored.
4. Verify the task:
   ```bash
   tld check
   ```
