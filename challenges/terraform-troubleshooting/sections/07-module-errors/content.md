# Module Errors

Module errors happen when:
- The `source` directory or URL cannot be resolved.
- A required input variable is missing in the `module` invocation block.
- Module outputs referenced in root configurations are named incorrectly.

Always run `terraform init` after modifying module sources or paths.

---

## Lab Tasks

### Task 1: Fix Module Invocation Errors
1. Start the lab in your terminal:
   ```bash
   tld start tf-fix-module
   ```
2. Navigate to `~/terraform-troubleshoot-challenge`.
3. Complete the task requirements: Module invocation error resolved.
4. Verify the task:
   ```bash
   tld check
   ```
