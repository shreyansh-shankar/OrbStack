# State Errors

State errors manifest as missing tracking, state lock failures, or corrupted `.tfstate` files.

## Resolution Techniques:
1. **Missing Tracking:** Use `terraform import` or run `terraform apply` to rebuild state mapping.
2. **Stale Lock:** If a process crashed leaving a lock behind, run `terraform force-unlock <LOCK_ID>`.

---

## Lab Tasks

### Task 1: Recover from Corrupt or Missing State
1. Start the lab in your terminal:
   ```bash
   tld start tf-recover-state
   ```
2. Navigate to `~/terraform-troubleshoot-challenge`.
3. Complete the task requirements: State recovered and verified.
4. Verify the task:
   ```bash
   tld check
   ```
