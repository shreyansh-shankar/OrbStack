# Exposing Apps with NodePort

While `ClusterIP` is ideal for internal cluster traffic, we often need to expose applications to external clients. The simplest way to achieve this without an external load balancer is using a **NodePort** Service.

---

## What is a NodePort Service?

A NodePort Service builds on top of the ClusterIP Service.
1. It allocates a cluster-internal IP (ClusterIP) just like a normal Service.
2. It reserves a specific port across all nodes in the cluster (typically in the range of **30000–32767**).
3. Any traffic sent to that port on **any node's IP** is routed to the Service's backend Pods.

---

## Defining a NodePort Service

Below is an example of a NodePort Service specification:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nodeport-service
spec:
  type: NodePort
  selector:
    app: my-app
  ports:
    - port: 80         # Port exposed internally in the cluster
      targetPort: 80   # Port on the container inside the Pod
      nodePort: 30080  # Port exposed on all Kubernetes Nodes
```

- If you don't specify `nodePort`, Kubernetes will automatically allocate a random port in the default `30000-32767` range.
- If you specify a static `nodePort`, you must make sure it is not already in use by another Service.

---

## Lab Tasks

### Task 1: Access NodePort Service
1. Start the lab in your terminal:
   ```bash
   tld start k8s-access-nodeport
   ```
2. Navigate to `~/k8s-services-networking`.
3. Complete the task requirements: NodePort service accessed successfully.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Create a NodePort Service
1. Start the lab in your terminal:
   ```bash
   tld start k8s-create-nodeport
   ```
2. Complete the task requirements: NodePort service created successfully on nodePort 30080.
3. Verify the task:
   ```bash
   tld check
   ```
