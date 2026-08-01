# Multi-Container Pods

While the single-container pattern is most common, Pods can contain multiple containers that work together to form a cohesive unit.

Containers running inside the same Pod share the same **network namespace** and can share **storage volumes**.

---

## The Sidecar Pattern

The **Sidecar pattern** is a design pattern where a helper container (the sidecar) runs alongside the primary application container. The sidecar container enhances or extends the primary container's behavior.

Common examples of sidecars include:
- **Logging Agents**: Tail log files written by the primary app container and forward them to central storage.
- **Proxies / Service Meshes**: Intercept network connections to provide security (mTLS), metrics, or routing.
- **Config Syncers**: Poll an external config service and hot-reload local config files shared with the app container.

---

## Shared Volumes between Containers

To share files between two containers in the same Pod, you declare a Kubernetes volume at the Pod level and mount it inside both containers at their respective mount points.

The simplest volume type is `emptyDir`, which is created when a Pod is assigned to a node, and exists as long as that Pod is running on that node.

### Multi-Container Pod Manifest Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  volumes:
  - name: shared-logs
    emptyDir: {}
  containers:
  - name: app
    image: alpine
    command: ["sh", "-c", "while true; do echo 'App output' >> /var/log/app.log; sleep 5; done"]
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log
  - name: sidecar
    image: alpine
    command: ["sh", "-c", "tail -f /var/log/app.log"]
    volumeMounts:
    - name: shared-logs
      mountPath: /var/log
```
In this example, both containers mount the `shared-logs` volume at `/var/log`. The `sidecar` container reads the file written by the `app` container.

---

## Lab Tasks

### Task 1: Deploy a Sidecar Pod
1. Start the lab in your terminal:
   ```bash
   tld start k8s-sidecar-pod
   ```
2. Complete the task requirements: Multi-container sidecar pod successfully verified.
3. Verify the task:
   ```bash
   tld check
   ```
