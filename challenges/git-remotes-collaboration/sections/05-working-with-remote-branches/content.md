# Working with Remote Branches

Collaboration involves working on multiple branches that exist on the remote repository. Let's learn how to track remote branches locally and how to clean up remote branches when a feature is deleted.

---

## 1. Tracking a Remote Branch

When you fetch updates, Git creates read-only remote-tracking branches (like `origin/feature-branch`). You cannot make commits directly onto these branches. 

To start working on a remote branch locally, you must create a local branch that tracks it.

If you simply check out the branch name, Git will automatically look for a remote branch with the same name. If it finds one, it creates a local tracking branch for you:
```bash
git switch <branch-name>
```
or:
```bash
git checkout <branch-name>
```

Under the hood, this is equivalent to:
```bash
git checkout --track origin/<branch-name>
```

---

## 2. Deleting a Remote Branch

Once a feature is merged, the branch pointer should be deleted not only locally but also on the remote repository to prevent list clutter.

To delete a branch from the remote server, use `git push` with the `--delete` flag:

```bash
git push origin --delete <branch-name>
```

For example, to delete `feature-login` from origin:
```bash
git push origin --delete feature-login
```

This deletes the pointer on the remote repository and removes the branch from the server.

---

## Lab Tasks

### Task 1: Delete a Remote Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-delete-remote-branch
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Remote branch deleted successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Track a Remote Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-track-remote-branch
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Remote branch tracked and checked out successfully.
4. Verify the task:
   ```bash
   tld check
   ```
