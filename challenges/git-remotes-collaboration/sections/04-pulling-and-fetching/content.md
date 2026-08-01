# Pulling & Fetching Updates

When working in a team, other developers will push changes to the remote repository. To incorporate their work into your local project copy, you must download those changes from the server.

Git offers two commands to download remote changes: `git fetch` and `git pull`.

---

## 1. Git Fetch (Safe Download)

`git fetch` downloads all new history, commits, and branches from the remote repository to your local computer.

```bash
git fetch <remote-name>
```

### Key Characteristic:
- `git fetch` **does not modify your working directory**.
- It updates your **remote-tracking branches** (like `origin/main` or `origin/feature-login`).
- This makes it completely safe: you can inspect what others did (using `git log origin/main` or comparing changes) without risk of conflicts or merging into your current branch.

---

## 2. Git Pull (Download & Integrate)

`git pull` downloads remote changes and **immediately integrates** them into your current local branch.

```bash
git pull <remote-name> <branch-name>
```

### Under the Hood:
Under the hood, `git pull` is a shortcut that performs two operations:
1. `git fetch`: Download remote updates.
2. `git merge`: Merge the remote-tracking branch into your current branch.

Because `git pull` automatically runs a merge, it can result in **merge conflicts** if your local changes overlap with the remote changes.

---

## Lab Tasks

### Task 1: Compare Fetch vs Pull
1. Start the lab in your terminal:
   ```bash
   tld start git-compare-fetch-vs-pull
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Remote changes fetched and compared successfully without merging.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Fetch Remote Updates
1. Start the lab in your terminal:
   ```bash
   tld start git-fetch-updates
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Remote updates fetched successfully without modifying the local working directory.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 3: Pull Remote Changes
1. Start the lab in your terminal:
   ```bash
   tld start git-pull-changes
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Remote changes pulled and integrated successfully.
4. Verify the task:
   ```bash
   tld check
   ```
