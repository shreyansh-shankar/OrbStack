# Resolving Merge Conflicts

When you try to merge two branches that modified the **same lines of the same file** in different ways, Git won't know which version to keep. This causes a **merge conflict**.

---

## Conflict Indicators

When a conflict occurs:
1. Git halts the merge process and prints a warning.
2. It modifies the conflicted file, adding **conflict markers** to highlight the differences:

```html
<<<<<<< HEAD
<h1>Welcome to Main Site</h1>
=======
<h1>Welcome to My Feature Page</h1>
>>>>>>> feature-branch
```

- **`<<<<<<< HEAD`**: Indicates the beginning of the changes on your current branch.
- **`=======`**: Divides your changes from the changes in the incoming branch.
- **`>>>>>>> feature-branch`**: Indicates the end of the changes from the incoming branch.

---

## Resolving a Conflict

To resolve a conflict, you must manually edit the conflicted files:
1. Open the file in an editor.
2. Decide which content to keep (or write a new version combining both).
3. **Remove all conflict markers** (`<<<<<<<`, `=======`, and `>>>>>>>`).
4. Stage the resolved files using:
   ```bash
   git add <resolved-file>
   ```
5. Complete the merge commit by running:
   ```bash
   git commit
   ```
   (Alternatively, in modern Git, you can run `git merge --continue`).

---

## Lab Tasks

### Task 1: Complete the Merge Commit
1. Start the lab in your terminal:
   ```bash
   tld start git-complete-merge
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Merge commit completed successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Resolve Merge Conflict
1. Start the lab in your terminal:
   ```bash
   tld start git-resolve-merge-conflict
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Merge conflict in index.html resolved and staged successfully.
4. Verify the task:
   ```bash
   tld check
   ```
