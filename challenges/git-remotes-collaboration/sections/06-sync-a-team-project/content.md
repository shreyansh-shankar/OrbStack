# Synchronizing a Team Project

In a real development team, synchronizing your code with your colleagues is a daily cycle. Let's look at the standard process to safely sync your local changes with a remote repository:

---

## The Synchronization Cycle

1. **Pull Latest Changes**: Before starting new work, pull updates from the server to ensure your local history is aligned with the remote:
   ```bash
   git pull origin main
   ```
2. **Create a Local Feature Branch**: Isolate your new feature:
   ```bash
   git switch -c feature-name
   ```
3. **Commit Your Work**: Add and commit your files:
   ```bash
   git add .
   git commit -m "Implement feature description"
   ```
4. **Push and Set Upstream**: Upload your branch, mapping it to origin:
   ```bash
   git push -u origin feature-name
   ```
5. **Merge (on server/PR)**: Typically, changes are merged on the server via Pull Requests. Once merged, you can delete the branch remote and local.

Always pulling before coding is the best way to prevent merge conflicts.

---

## Lab Tasks

### Task 1: Sync Local and Remote Project
1. Start the lab in your terminal:
   ```bash
   tld start git-sync-local-and-remote
   ```
2. Navigate to `~/git-challenge`.
3. Complete the task requirements: Local and remote synchronization completed successfully.
4. Verify the task:
   ```bash
   tld check
   ```
