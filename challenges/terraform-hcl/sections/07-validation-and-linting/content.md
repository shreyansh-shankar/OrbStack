# Validation and Linting

Before applying configurations, always validate them using built-in commands and linting utilities.

## 1. Validation (`terraform validate`)
This command verifies whether configurations are syntactically valid and internally consistent (e.g., checks arguments, types, and variables).
It requires the project to be initialized (`terraform init`) first.

## 2. Linting (`tflint`)
While validate checks syntax correctness, linting tools analyze best practices, warnings, potential errors, and deprecated providers.

---

## Lab Tasks

### Task 1: Fix HCL Syntax Errors
1. Start the lab in your terminal:
   ```bash
   tld start tf-fix-syntax
   ```
2. Navigate to `~/terraform-hcl-challenge`.
3. Complete the task requirements: Syntax errors fixed and configuration validated.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Validate a Terraform Project
1. Start the lab in your terminal:
   ```bash
   tld start tf-validate-project
   ```
2. Navigate to `~/terraform-hcl-challenge`.
3. Complete the task requirements: Project is initialized and validated successfully.
4. Verify the task:
   ```bash
   tld check
   ```
