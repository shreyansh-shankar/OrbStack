# Cloning Repositories

If a project has already been started and is hosted on a remote server, the first thing you need to do is get a copy of it on your local machine. In Git, this process is called **cloning**.

---

## 1. The Git Clone Command

When you run `git clone`, Git downloads all versions of every file in the project's history. It initializes a new `.git` directory, pulls down all the history data, checks out a working copy of the latest version, and automatically configures a remote pointing back to the source URL.

```bash
git clone <remote-url> [local-directory-name]
```

- If you don't specify a `local-directory-name`, Git will create a folder named after the repository name.

---

## 2. Inspecting Remotes

Once cloned, you can inspect the remote repository connection details.

To list the configured remote servers:
```bash
git remote
```
(Usually, this outputs `origin`).

To list the URLs that Git has stored for reading and writing to the remote:
```bash
git remote -v
```

To see detailed configuration properties of a remote:
```bash
git remote show origin
```
This shows tracking branch status, pull/push rules, and endpoints.

---

## Lab Tasks

### Task 1: Clone a Remote Repository
1. Start the lab in your terminal:
   ```bash
   tld start git-clone-repository
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Remote repository cloned successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Inspect Remote Properties
1. Start the lab in your terminal:
   ```bash
   tld start git-inspect-remote
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Remote repository details inspected and recorded successfully.
4. Verify the task:
   ```bash
   tld check
   ```
