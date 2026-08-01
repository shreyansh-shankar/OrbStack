# Debugging Pods

When a Pod isn't running correctly, it usually stays in a failed state like `ImagePullBackOff`, `CrashLoopBackOff`, or `Pending`. Understanding these states is crucial to diagnosing pod-level problems.

---

## 1. ImagePullBackOff

This state indicates that Kubernetes is unable to retrieve the container image specified in the Pod definition.
- **Common causes**: Typo in the image name/tag, or referencing a private registry without configuring imagePullSecrets.
- **Diagnose**: Run `kubectl describe pod <pod-name>` and look at events for errors like `pull access denied` or `manifest not found`.

---

## 2. CrashLoopBackOff

This status shows that the container successfully scheduled and started, but then crashed immediately. Kubernetes restarts it, but because it keeps crashing, a back-off delay is applied before subsequent restarts.
- **Common causes**: Application bugs, unhandled exceptions, missing environment variables, or incorrect run command arguments.
- **Diagnose**: View application standard logs:
  ```bash
  # Read stdout/stderr logs of the crashed container
  kubectl logs <pod-name>

  # Read logs of the *previous* crashed instance of the pod
  kubectl logs <pod-name> --previous
  ```

---

## 3. Pending Pods

A Pod remains in `Pending` state when it cannot be scheduled on any node in the cluster.
- **Common causes**: Insufficient resources (CPU or Memory requests exceed node capacity), unsatisfiable nodeSelectors or taints.
- **Diagnose**: Run `kubectl describe pod <pod-name>` and inspect the warning events under the scheduler.

---

## Lab Tasks

### Task 1: Debug CrashLoopBackOff
1. Start the lab in your terminal:
   ```bash
   tld start k8s-debug-crashloopbackoff
   ```
2. Navigate to `~/k8s-troubleshooting`.
3. Complete the task requirements: Successfully identified the crashed error code from pod logs.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Debug ImagePullBackOff
1. Start the lab in your terminal:
   ```bash
   tld start k8s-debug-imagepullbackoff
   ```
2. Complete the task requirements: ImagePullBackOff resolved successfully! Pod is running.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 3: Debug Pending Pod
1. Start the lab in your terminal:
   ```bash
   tld start k8s-debug-pending-pod
   ```
2. Complete the task requirements: Pending pod scheduling error resolved successfully.
3. Verify the task:
   ```bash
   tld check
   ```
