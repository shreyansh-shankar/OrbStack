# Volumes

On-disk files in a container are ephemeral, which presents some problems for non-trivial applications when running in containers:
1. When a container crashes, the kubelet restarts it, but files are lost (the container starts with a clean state).
2. Sharing files between containers running together in a Pod is difficult.

A Kubernetes **Volume** solves both of these problems.

---

## Transient Volumes (`emptyDir`)

An `emptyDir` volume is created when a Pod is assigned to a node, and exists as long as that Pod is running on that node.

As the name says, the volume is initially empty. All containers in the Pod can read and write the same files in the `emptyDir` volume, though that volume can be mounted at the same or different paths in each container. When a Pod is removed from a node for any reason, the data in the `emptyDir` is deleted permanently.

---

## Defining a Pod Volume Mount

To configure a volume in a Pod:
1. Define a volume under `spec.volumes` specifying name and storage provider type.
2. Define `volumeMounts` inside the container spec referencing that volume name and target path.

```yaml
spec:
  volumes:
  - name: cache-volume
    emptyDir: {}
  containers:
  - name: web
    image: nginx
    volumeMounts:
    - name: cache-volume
      mountPath: /cache
```
Here, directory `/cache` inside the container is backed by the transient volume named `cache-volume`.

---

## Lab Tasks

### Task 1: Create transient emptyDir Volume
1. Start the lab in your terminal:
   ```bash
   tld start k8s-emptydir-volume
   ```
2. Complete the task requirements: Transient emptyDir volume successfully verified.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Create Shared Volume
1. Start the lab in your terminal:
   ```bash
   tld start k8s-shared-volume
   ```
2. Complete the task requirements: Multi-container emptyDir shared volume successfully verified.
3. Verify the task:
   ```bash
   tld check
   ```
