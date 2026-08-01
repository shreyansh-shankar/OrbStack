# Destroying Infrastructure

When resources are no longer needed, you must tear them down to avoid costs and clean up your environment.

The `terraform destroy` command:
1. Examines your current `terraform.tfstate` file.
2. Formulates a plan to delete all resources managed in the workspace.
3. Teards down the infrastructure in reverse dependency order.
4. Removes resources from the state file.

---

## Lab Tasks

### Task 1: Destroy Provisioned Resource
1. Start the lab in your terminal:
   ```bash
   tld start tf-destroy-resource
   ```
2. Navigate to `~/terraform-resources-challenge`.
3. Complete the task requirements: Resource destroyed successfully.
4. Verify the task:
   ```bash
   tld check
   ```
