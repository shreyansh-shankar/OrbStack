# Local Values

A local value assigns a name to an expression, allowing you to reuse the expression multiple times throughout a module without repeating it (DRY principle).

## Syntax:
```hcl
locals {
  service_name = "payment-api"
  environment  = "production"
  common_tags = {
    Service     = local.service_name
    Environment = local.environment
  }
}
```

Locals are referenced using `local.local_name`.

---

## Lab Tasks

### Task 1: Use Local Values for DRY Code
1. Start the lab in your terminal:
   ```bash
   tld start tf-use-locals
   ```
2. Navigate to `~/terraform-expr-challenge`.
3. Complete the task requirements: Local values utilized successfully.
4. Verify the task:
   ```bash
   tld check
   ```
