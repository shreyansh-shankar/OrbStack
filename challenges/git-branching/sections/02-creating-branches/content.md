# Creating & Switching Branches

Working with branches is one of Git's most powerful workflows. Let's learn how to create a branch, switch to it, and manage local branches.

---

## 1. Creating a Branch

To create a new branch without switching to it, use the `git branch` command followed by the name of the new branch:

```bash
git branch <branch-name>
```

For example, to create a branch named `feature-login`:
```bash
git branch feature-login
```

This creates a new pointer at the same commit `HEAD` is currently pointing to.

---

## 2. Switching to a Branch

Creating a branch only places a pointer. To start working on that branch, you must switch your working directory to it.

Historically, this is done using:
```bash
git checkout <branch-name>
```

In newer versions of Git, you can use the more descriptive `git switch` command:
```bash
git switch <branch-name>
```

---

## 3. Creating & Switching in One Step

A very common shortcut to create a new branch and switch to it immediately is:

Using checkout:
```bash
git checkout -b <branch-name>
```

Using switch:
```bash
git switch -c <branch-name>
```
The `-c` stands for *create*.

---

## Lab Tasks

### Task 1: Create a Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-create-branch
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Branch 'feature-login' created successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Switch to a Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-switch-branch
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Successfully switched to branch 'feature-login'.
4. Verify the task:
   ```bash
   tld check
   ```
