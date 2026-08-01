# Built-in Functions

The Terraform language includes built-in functions that you can call from within expressions to transform and combine values.

## Common Functions:
- **String:** `lower()`, `upper()`, `trimspace()`, `join()`, `replace()`, `format()`
- **Collection:** `length()`, `concat()`, `flatten()`, `element()`, `slice()`
- **Map:** `keys()`, `values()`, `merge()`
- **Encoding:** `jsonencode()`, `yamlencode()`, `base64encode()`

Test built-in functions interactively by running `terraform console`.

---

## Lab Tasks

### Task 1: Use Built-in Collection Functions
1. Start the lab in your terminal:
   ```bash
   tld start tf-list-functions
   ```
2. Navigate to `~/terraform-expr-challenge`.
3. Complete the task requirements: Built-in collection function verified.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Use Built-in String Functions
1. Start the lab in your terminal:
   ```bash
   tld start tf-string-functions
   ```
2. Navigate to `~/terraform-expr-challenge`.
3. Complete the task requirements: Built-in string function verified.
4. Verify the task:
   ```bash
   tld check
   ```
