# Provider Errors

Provider errors occur when provider plugins fail to download, initialize, or authenticate with external systems.

## Key Troubleshooting Steps:
- **`Could not load plugin`:** Means `terraform init` has not been run in the directory.
- **`Provider requirements incompatible`:** Occurs when version constraints conflict across modules. Run `terraform init -upgrade` to update provider selections.

---

## Lab Tasks

### Task 1: Fix Uninitialized Provider Errors
1. Start the lab in your terminal:
   ```bash
   tld start tf-fix-provider-errors
   ```
2. Navigate to `~/terraform-troubleshoot-challenge`.
3. Complete the task requirements: Provider initialized and validated successfully.
4. Verify the task:
   ```bash
   tld check
   ```
