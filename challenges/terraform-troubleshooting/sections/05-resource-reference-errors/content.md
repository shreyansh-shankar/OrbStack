# Resource Reference Errors

Reference errors occur when code tries to access a resource or attribute that does not exist.

## Typical Scenarios:
- **Typo in Resource Identifier:** Calling `local_file.my_file` when the block is named `resource "local_file" "myfile"`.
- **Referencing Non-Existent Attributes:** Trying to read `resource.id` when the provider names that field `resource.name`.
- **Undefined Variables:** Calling `var.env` without declaring `variable "env"` in `variables.tf`.

---

## Lab Tasks

### Task 1: Fix Resource Reference Typos
1. Start the lab in your terminal:
   ```bash
   tld start tf-fix-resource-references
   ```
2. Navigate to `~/terraform-troubleshoot-challenge`.
3. Complete the task requirements: Resource reference error resolved.
4. Verify the task:
   ```bash
   tld check
   ```
