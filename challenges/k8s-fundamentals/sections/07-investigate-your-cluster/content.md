# Investigate Your Cluster

When applications run into issues on Kubernetes (e.g. crash loops, failing probes, configuration issues), you need tools to investigate and debug their runtime behavior.

The two main commands for debugging container state are:
- `kubectl logs`: Queries standard output/error logs of container runtimes.
- `kubectl get events`: Inspects recent cluster actions, warning messages, and scheduling events.

---

## Triage Workflow

### 1. Identify Failing Pods
List all pods in the namespace and check their status:
```bash
kubectl get pods
```
Look for statuses like `CrashLoopBackOff`, `Error`, `ImagePullBackOff`, or `Pending`.

### 2. Inspect Pod Details and Events
Describe the pod to view its container specs, volumes, lifecycle states, and recent events:
```bash
kubectl describe pod failing-pod
```
Scroll down to the **Events** section at the bottom. This lists warnings about scheduling failures, resource limits exceeded, mount failures, or crashing runtimes.

### 3. Retrieve Application Logs
Query stdout/stderr of the container to find errors thrown by the application code:
```bash
kubectl logs failing-pod
```
If the pod is crash-looping, the current container logs might be empty or represent a new iteration. To query the logs of the *previous* crashed instance of the container:
```bash
kubectl logs failing-pod --previous
```
If the pod contains multiple containers, specify the container name:
```bash
kubectl logs failing-pod -c app-container
```

---

## Lab Tasks

### Task 1: Investigate Cluster Failures
1. Start the lab in your terminal:
   ```bash
   tld start k8s-cluster-investigation
   ```
2. Navigate to `~/k8s-fundamentals`.
3. Complete the task requirements: Successfully investigated cluster failure and retrieved the crash error code.
4. Verify the task:
   ```bash
   tld check
   ```
