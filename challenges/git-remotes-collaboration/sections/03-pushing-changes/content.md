# Pushing Changes

Once you have made commits locally in your repository, they only exist on your machine. To share your work with your team, you need to upload (or "push") those commits to the remote server.

---

## 1. The Git Push Command

The `git push` command takes two main arguments:
1. The remote server name (usually `origin`).
2. The branch name you want to push.

```bash
git push <remote-name> <branch-name>
```

For example, to push your local `main` branch to the remote repository named `origin`:
```bash
git push origin main
```

---

## 2. Setting the Upstream (Tracking) Branch

When pushing a new branch for the first time, you should tell Git to establish a tracking connection between your local branch and the remote branch. This is called setting the **upstream**.

Use the `-u` (or `--set-upstream`) flag:
```bash
git push -u origin <branch-name>
```

### Benefits of Tracking Branches:
- Once set, you no longer need to type the remote name and branch name. You can simply run `git push` or `git pull` while on that branch.
- Git will be able to show you status information like: "Your branch is ahead of 'origin/main' by 2 commits."

---

## Lab Tasks

### Task 1: Push Changes to Remote
1. Start the lab in your terminal:
   ```bash
   tld start git-first-push
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Changes successfully pushed to the remote repository.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Push a New Local Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-push-new-branch
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: New local branch pushed and tracking configured successfully.
4. Verify the task:
   ```bash
   tld check
   ```
