# Recover a Stateful Application

Storage issues are one of the most common causes of Pod failures in stateful configurations. When a Pod references a PersistentVolumeClaim that doesn't exist, cannot be bound, or has access conflicts, it gets stuck in `ContainerCreating`, `Pending`, or `CrashLoopBackOff` state.

---

## Triage Storage Errors

To diagnose storage and mount errors:
1. **Get Pod Status**: See if the pod is stuck:
   ```bash
   kubectl get pods
   ```
2. **Describe Pod**: Look for storage warning events:
   ```bash
   kubectl describe pod db-pod
   ```
   Look for warnings like:
   - `FailedMount`: Volume mount failed (e.g. storage driver error, lock conflicts).
   - `FailedScheduling`: Could not match nodes (e.g. PV is located in zone-a, but pod was scheduled to zone-b).
   - `volume... not found`: The claimName referenced in Pod volumes does not exist in the namespace.

---

## Resolving Missing Claim Failures

If a Pod references a non-existent claim name, you must create a PersistentVolumeClaim with the exact matching metadata name in that namespace. Once the claim is created, the control plane binds it to a PersistentVolume, and the node's kubelet immediately mounts it, allowing the container to start.

---

## Lab Tasks

### Task 1: Fix Pod Storage Mount
1. Start the lab in your terminal:
   ```bash
   tld start k8s-fix-storage-configuration
   ```
2. Complete the task requirements: Storage configuration fixed and db-pod successfully mounted and running.
3. Verify the task:
   ```bash
   tld check
   ```
