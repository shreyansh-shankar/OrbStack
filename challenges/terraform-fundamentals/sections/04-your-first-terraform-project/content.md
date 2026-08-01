# Your First Terraform Project

A Terraform project is simply a directory containing configuration files with the `.tf` extension. These configuration files use the **HashiCorp Configuration Language (HCL)**.

## HCL Syntax
The most common block in Terraform is the `resource` block, which defines a piece of infrastructure:
```hcl
resource "local_file" "example" {
  content  = "Hello, Devops!"
  filename = "${path.module}/hello.txt"
}
```
- **`resource`:** Declares a resource block.
- **`local_file`:** The resource type (managed by the `local` provider).
- **`example`:** The local name (identifier) of the resource, used inside Terraform to reference it.
- **Arguments (inside braces):** Attributes like `content` and `filename` that configure the resource.

## Initializing the Directory
To download the required providers (like the `local` provider used above), you must initialize the workspace:
```bash
terraform init
```
This downloads plugins to a hidden `.terraform/` directory.

---

## Lab Tasks

### Task 1: Format Your Terraform Configurations
1. Start the lab in your terminal:
   ```bash
   tld start tf-format-project
   ```
2. Navigate to `~/terraform-challenge`.
3. Complete the task requirements: Configurations formatted correctly.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Initialize a Terraform Project
1. Start the lab in your terminal:
   ```bash
   tld start tf-init-project
   ```
2. Navigate to `~/terraform-challenge`.
3. Complete the task requirements: Terraform workspace initialized successfully.
4. Verify the task:
   ```bash
   tld check
   ```
