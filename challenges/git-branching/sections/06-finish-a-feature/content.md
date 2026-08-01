# Finish a Feature

Now that you've learned individual branching, merging, and deleting commands, let's tie them all together into a standard, cohesive Git workflow used by developers every day.

---

## The Feature Branch Workflow

Whenever you start working on a new feature or fix:
1. **Create and switch** to a clean feature branch:
   ```bash
   git switch -c feature-name
   ```
2. **Work and commit** your changes in the branch:
   ```bash
   git add .
   git commit -m "Describe your changes"
   ```
3. **Switch back** to the main branch:
   ```bash
   git switch main
   ```
4. **Merge** your feature branch changes:
   ```bash
   git merge feature-name
   ```
5. **Delete** the local feature branch once it has been successfully integrated:
   ```bash
   git branch -d feature-name
   ```

Following this workflow ensures that the main branch remains clean and deployable at all times.

---

## Lab Tasks

### Task 1: Complete Feature Workflow
1. Start the lab in your terminal:
   ```bash
   tld start git-complete-feature-workflow
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Complete feature branch workflow executed successfully.
4. Verify the task:
   ```bash
   tld check
   ```
