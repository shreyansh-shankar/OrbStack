# Resources

Resources are the most important block type in Terraform. They describe one or more infrastructure objects, such as virtual networks, compute instances, or local files.

## Resource Block Syntax
```hcl
resource "provider_resource-type" "local-name" {
  argument1 = value1
  argument2 = value2
}
```
- **Resource Type (`local_file`)**: Denotes the type of infrastructure to manage. It always starts with the provider prefix.
- **Resource Name (`welcome`)**: An internal label to represent this resource within the current Terraform module.

---

## Lab Tasks

### Task 1: Create a Local File Resource
1. Start the lab in your terminal:
   ```bash
   tld start tf-create-local-file
   ```
2. Navigate to `~/terraform-resources-challenge`.
3. Complete the task requirements: Local file resource created successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Create a Random Resource
1. Start the lab in your terminal:
   ```bash
   tld start tf-create-random-resource
   ```
2. Navigate to `~/terraform-resources-challenge`.
3. Complete the task requirements: Random resource created and verified.
4. Verify the task:
   ```bash
   tld check
   ```
