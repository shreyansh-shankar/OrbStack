# Recover a Broken Application

Real-world production incidents rarely have a single cause. A broken application often combines several simultaneous issues: a deployment using a bad image, a missing ConfigMap it depends on, or a misconfigured Secret mount.

---

## Multi-Layer Triage Workflow

When an application is completely down, work systematically from the top down:

### Step 1 — Identify Failing Pods
```bash
kubectl get pods
```
Look for any pod not in `Running` state.

### Step 2 — Read Events
```bash
kubectl describe pod <pod-name>
```
Events section reveals whether the failure is due to image pulls, volume mounts, scheduling, or liveness probes.

### Step 3 — Fix in Dependency Order

If a deployment depends on a ConfigMap that doesn't exist, create the ConfigMap **first**, then fix the deployment image. The correct fix order prevents the cluster from cycling through partial failures.

### Step 4 — Verify Recovery
```bash
kubectl get pods
kubectl rollout status deployment/<deployment-name>
```
Confirm all pods transition to `Running` state and the rollout completes successfully.

---

## Lab Tasks

### Task 1: Recover Production Application
1. Start the lab in your terminal:
   ```bash
   tld start k8s-recover-production-application
   ```
2. Complete the task requirements: Production application successfully recovered! ConfigMap created, image fixed, and pod is running.
3. Verify the task:
   ```bash
   tld check
   ```
