# Repairing a Broken Repository

In complex collaborative projects, a branch can diverge so badly from the team's official remote repository that it becomes extremely difficult to merge, rebase, or reconcile. The commit history is cluttered, or local edits are incompatible.

When a local branch is beyond repair, the cleanest and safest solution is to **discard all local commits on that branch and align it exactly with the remote server branch**.

---

## The Force-Reset Repair Cycle

To align your local branch `dev` to match `origin/dev` exactly, replacing all local commits:

1. **Fetch Latest Remote Data**:
   Ensure you have the latest remote metadata and commits:
   ```bash
   git fetch origin
   ```
2. **Force-Reset Local Branch**:
   Move your branch pointer to point exactly at `origin/dev` and clean your working tree:
   ```bash
   git reset --hard origin/dev
   ```

This deletes all local commits on `dev` that are not present on `origin/dev`, and matches the working tree to the server version.

---

## Lab Tasks

### Task 1: Recover Development Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-recover-development-branch
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Local development branch successfully aligned with remote server state.
4. Verify the task:
   ```bash
   tld check
   ```
