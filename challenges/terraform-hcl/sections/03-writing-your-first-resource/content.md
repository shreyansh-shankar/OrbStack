# Writing Your First Resource

To write a resource in HCL, you define a `resource` block containing the type of resource you want to create, its local identifier, and configuration arguments.

## Resource Syntax:
```hcl
resource "local_file" "welcome" {
  content  = "Welcome to The Last Deploy!"
  filename = "/tmp/welcome.txt"
}
```
- `"local_file"`: Tells Terraform which provider plugin is responsible for this resource.
- `"welcome"`: The internal name used to reference this resource elsewhere in the code.
- `content` and `filename`: Configuration arguments specific to the `local_file` resource type.

---

## Lab Tasks

### Task 1: Create Your First Resource Block
1. Start the lab in your terminal:
   ```bash
   tld start tf-first-resource
   ```
2. Navigate to `~/terraform-hcl-challenge`.
3. Complete the task requirements: First resource block created successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Format Your Resource Configuration
1. Start the lab in your terminal:
   ```bash
   tld start tf-format-resource
   ```
2. Navigate to `~/terraform-hcl-challenge`.
3. Complete the task requirements: Configuration formatted successfully.
4. Verify the task:
   ```bash
   tld check
   ```
