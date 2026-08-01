# Recover a Broken Deployment

When rolling out updates to a Deployment, configurations can sometimes be invalid or specify broken image tags. In these cases, the rollout gets stuck.

---

## Triage stuck updates

To identify a stuck deployment:
1. **Rollout Status**: Check if the rollout is blocked:
   ```bash
   kubectl rollout status deployment/my-deployment
   ```
2. **Describe Deployment**: Check the replica count status and conditions:
   ```bash
   kubectl describe deployment my-deployment
   ```
   Under the `Conditions` section, look at `Progressing`. If its status is `False` with the reason `ProgressDeadlineExceeded`, the rollout is broken and has timed out.

---

## Recovery Workflow

To recover and fix a stuck deployment:
- **Set Correct Image**: Update the image dynamically to a valid name:
  ```bash
  kubectl set image deployment/my-deployment container-name=valid-image:tag
  ```
- **Undo / Rollback**: Roll back to the last known working revision:
  ```bash
  kubectl rollout undo deployment/my-deployment
  ```

---

## Lab Tasks

### Task 1: Fix Stuck Rollout
1. Start the lab in your terminal:
   ```bash
   tld start k8s-fix-broken-deployment
   ```
2. Complete the task requirements: Stuck deployment successfully recovered and is running.
3. Verify the task:
   ```bash
   tld check
   ```
