# Creating Your First Module

A child module is simply a directory containing Terraform `.tf` files.

## Calling a Child Module:
From your root module, invoke a child module using a `module` block and specify the `source` argument:
```hcl
module "file_writer" {
  source = "./modules/file_writer"
}
```

When you add or modify a `module` block, always run `terraform init` to let Terraform register the module source.

---

## Lab Tasks

### Task 1: Call a Child Module from Root
1. Start the lab in your terminal:
   ```bash
   tld start tf-call-module
   ```
2. Navigate to `~/terraform-modules-challenge`.
3. Complete the task requirements: Child module called and initialized successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Create a Child Module
1. Start the lab in your terminal:
   ```bash
   tld start tf-create-module
   ```
2. Navigate to `~/terraform-modules-challenge`.
3. Complete the task requirements: Child module created successfully.
4. Verify the task:
   ```bash
   tld check
   ```
