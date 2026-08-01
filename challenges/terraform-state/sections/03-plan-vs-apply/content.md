# Plan vs Apply

`terraform plan` compares your configuration files against state and real-world infrastructure to generate an execution plan.

## Saving Execution Plans
For automated pipelines, you can save an execution plan to an output file:
```bash
terraform plan -out=tfplan
```
Then, execute exact changes from the saved file using:
```bash
terraform apply tfplan
```
This guarantees that only the pre-approved plan is applied, avoiding unexpected changes if infrastructure drifted between plan and apply.

---

## Lab Tasks

### Task 1: Generate and Read Execution Plan
1. Start the lab in your terminal:
   ```bash
   tld start tf-read-plan
   ```
2. Navigate to `~/terraform-state-challenge`.
3. Complete the task requirements: Execution plan generated and saved successfully.
4. Verify the task:
   ```bash
   tld check
   ```
