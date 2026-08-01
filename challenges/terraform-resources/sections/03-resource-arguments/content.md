# Resource Arguments

Resource arguments configure resource attributes. Each resource type supports different arguments.

For example, the `local_file` resource type requires `filename` and optionally accepts `content` or `directory_permission`.

## Arguments vs Attributes:
- **Arguments:** Settings you configure on a resource (inputs).
- **Attributes:** Values returned by a resource after provisioning (outputs, e.g., `id`, `hex`).

---

## Lab Tasks

### Task 1: Update Resource Arguments
1. Start the lab in your terminal:
   ```bash
   tld start tf-update-resource
   ```
2. Navigate to `~/terraform-resources-challenge`.
3. Complete the task requirements: Resource argument updated and applied successfully.
4. Verify the task:
   ```bash
   tld check
   ```
