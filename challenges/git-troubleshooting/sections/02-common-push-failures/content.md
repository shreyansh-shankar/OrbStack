# Common Push Failures

When sharing your local commits, push commands can fail due to remote repository state or tracking configuration errors. Let's inspect these common failures and how to handle them.

---

## 1. Non-Fast-Forward Rejects

A **non-fast-forward reject** happens when your local branch history is out of sync with the remote branch history.

If another developer pushed commit `C` to the remote branch, and you have committed `D` locally without pulling first, your histories have diverged. If you try to push, Git rejects it to prevent losing the remote commit `C`.

### How to resolve:
1. **Pull and Integrate**: Download remote changes and merge them:
   ```bash
   git pull origin main
   ```
2. **Resolve Conflicts**: If you edited the same lines, fix the conflict markers and commit.
3. **Push**:
   ```bash
   git push origin main
   ```

---

## 2. Missing Upstream Tracking

If you create a local branch using `git switch -c new-feature`, it does not have a corresponding tracking counterpart on the remote server. Running `git push` without arguments will result in:
`fatal: The current branch new-feature has no upstream branch.`

### How to resolve:
You must push and tell Git to remember the relationship (upstream) using the `-u` (or `--set-upstream`) option:
```bash
git push -u origin new-feature
```
On subsequent pushes, you can simply run `git push`.

---

## Lab Tasks

### Task 1: Fix Non-Fast-Forward Reject
1. Start the lab in your terminal:
   ```bash
   tld start git-fix-non-fast-forward
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Non-fast-forward push reject resolved and pushed successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Fix Upstream Tracking Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-fix-upstream-branch
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Upstream tracking branch configured and pushed successfully.
4. Verify the task:
   ```bash
   tld check
   ```
