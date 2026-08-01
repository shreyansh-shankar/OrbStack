# Module Inputs and Outputs

Modules interact with the root module using input variables and output values.

## Passing Inputs:
Inside a child module, declare variables in `variables.tf`. When invoking the module, pass values as block arguments:
```hcl
module "storage" {
  source    = "./modules/storage"
  file_text = "Custom content"
}
```

## Reading Outputs:
Child modules expose outputs declared in `outputs.tf`. The root module references child outputs using `module.<MODULE_NAME>.<OUTPUT_NAME>`:
```hcl
resource "local_file" "summary" {
  content  = "Storage file path is ${module.storage.file_path}"
  filename = "/tmp/summary.txt"
}
```

---

## Lab Tasks

### Task 1: Pass Input Arguments to a Module
1. Start the lab in your terminal:
   ```bash
   tld start tf-module-inputs
   ```
2. Navigate to `~/terraform-modules-challenge`.
3. Complete the task requirements: Module input arguments configured successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Access Output Values from a Module
1. Start the lab in your terminal:
   ```bash
   tld start tf-module-outputs
   ```
2. Navigate to `~/terraform-modules-challenge`.
3. Complete the task requirements: Module output value accessed successfully.
4. Verify the task:
   ```bash
   tld check
   ```
