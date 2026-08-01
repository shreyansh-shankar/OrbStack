# Validation Errors

Validation errors happen when HCL syntax is valid, but the arguments provided to resources, modules, or variables violate schema constraints.

## Common Causes:
1. **Invalid Attribute Names:** Specifying an argument that the resource type does not accept.
2. **Type Mismatch:** Passing a string where a number or list is expected.
3. **Missing Required Arguments:** Omitting mandatory parameters (e.g., leaving out `filename` on `local_file`).

Run `terraform validate` after `terraform init` to catch schema errors before planning.

---

## Lab Tasks

### Task 1: Fix Validation Errors
1. Start the lab in your terminal:
   ```bash
   tld start tf-fix-validation-errors
   ```
2. Navigate to `~/terraform-troubleshoot-challenge`.
3. Complete the task requirements: Validation errors resolved.
4. Verify the task:
   ```bash
   tld check
   ```
