# Debug a Failed Pod

Kubernetes Pods can fail for various reasons. The most common runtime pod container failures are:

---

## 1. ImagePullBackOff or ErrImagePull
- **Reason**: The kubelet cannot pull the specified container image from the registry.
- **Common causes**: Typo in the image name or tag, referencing a private image without configuring image pull secrets, or registry rate limits / network outages.
- **Triage**: Run `kubectl describe pod <name>` and look at the events at the bottom.

---

## 2. CrashLoopBackOff
- **Reason**: The container starts, but exits/crashes repeatedly. Kubernetes restarts the container with an exponential back-off delay.
- **Common causes**: Application code throwing uncaught exceptions, missing environment variables/secrets, port conflicts, or lack of permissions to write to volume mounts.
- **Triage**: Run `kubectl logs <name> --previous` to see stdout/stderr logs of the last crashed iteration.

---

## 3. Pending
- **Reason**: The pod cannot be scheduled on any node.
- **Common causes**: Insufficient CPU/Memory resources on cluster nodes, node selectors or taints/tolerations constraints, or volume mount claims that cannot be resolved.
- **Triage**: Run `kubectl describe pod <name>` and inspect the scheduler events.

---

## Lab Tasks

### Task 1: Debug Pod Image Typo
1. Start the lab in your terminal:
   ```bash
   tld start k8s-debug-failed-pod
   ```
2. Complete the task requirements: Successfully debugged and running pod with correct image.
3. Verify the task:
   ```bash
   tld check
   ```
