# Merging Branches

Once you've completed work in a feature branch, you need to integrate it back into your main branch. This integration is called **merging**.

---

## The Merge Process

Merging takes the history and changes from a source branch and combines them into a target branch.

To perform a merge:
1. First, switch to the target branch (usually `main`):
   ```bash
   git switch main
   ```
2. Run the `git merge` command, specifying the source branch name:
   ```bash
   git merge <branch-name>
   ```

---

## Types of Merges

Git generally uses one of two merge strategies depending on how the histories have diverged:

### 1. Fast-Forward Merge
A fast-forward merge occurs when the commit history of the target branch (`main`) has not diverged from the source branch.
- In other words, `main` hasn't had any new commits since you branched off it.
- Git simply moves the target branch pointer forward to point to the latest commit on the source branch. No new "merge commit" is created.

### 2. Three-Way Merge (Recursive/Merge Commit)
A three-way merge occurs when both branches have diverged (meaning new commits were made on `main` *and* on the feature branch since they split).
- Git creates a new **merge commit** that combines the histories, pointing to both parent commits.

---

## Lab Tasks

### Task 1: Fast-Forward Merge
1. Start the lab in your terminal:
   ```bash
   tld start git-fast-forward-merge
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Fast-forward merge completed successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Merge a Feature Branch
1. Start the lab in your terminal:
   ```bash
   tld start git-merge-feature
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Branch 'feature-abc' merged into '$ACTIVE_BRANCH' successfully.
4. Verify the task:
   ```bash
   tld check
   ```
