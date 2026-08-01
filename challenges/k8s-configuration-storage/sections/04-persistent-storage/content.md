# Persistent Storage

While transient volumes survive container crashes inside the same Pod, they do not survive Pod deletion. To persist data across Pod lifetimes, Kubernetes uses PersistentVolumes and PersistentVolumeClaims.

---

## Persistent Volumes & Claims

- **PersistentVolume (PV)**: A piece of storage in the cluster that has been provisioned by an administrator or dynamically provisioned using Storage Classes. It is a cluster resource just like a node.
- **PersistentVolumeClaim (PVC)**: A request for storage by a user. It is similar to a Pod. Pods consume node resources and PVCs consume PV resources. Claims can request specific size and access modes (e.g., they can be mounted once read/write or many times read-only).

---

## Declaring a PersistentVolumeClaim

Here is an example PVC manifest:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: task-pv-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### Access Modes
- **ReadWriteOnce (RWO)**: The volume can be mounted as read-write by a single node.
- **ReadOnlyMany (ROX)**: The volume can be mounted as read-only by many nodes.
- **ReadWriteMany (RWX)**: The volume can be mounted as read-write by many nodes.
- **ReadWriteOncePod (RWOP)**: The volume can be mounted as read-write by a single Pod.

---

## Mounting a PVC inside a Pod

Once the PVC is created, you reference it under the Pod's volumes block using `persistentVolumeClaim`:
```yaml
spec:
  volumes:
    - name: task-pv-storage
      persistentVolumeClaim:
        claimName: task-pv-claim
  containers:
    - name: task-pv-container
      image: nginx
      volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: task-pv-storage
```
Data written to `/usr/share/nginx/html` in this container will be persisted to the backing PersistentVolume and remains safe even if the Pod is deleted.

---

## Lab Tasks

### Task 1: Create a Storage Claim
1. Start the lab in your terminal:
   ```bash
   tld start k8s-create-pvc
   ```
2. Complete the task requirements: PersistentVolumeClaim 'task-pv-claim' successfully verified.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Mount PVC in Pod
1. Start the lab in your terminal:
   ```bash
   tld start k8s-mount-persistent-volume
   ```
2. Complete the task requirements: PVC dynamic storage volume mount successfully verified.
3. Verify the task:
   ```bash
   tld check
   ```
