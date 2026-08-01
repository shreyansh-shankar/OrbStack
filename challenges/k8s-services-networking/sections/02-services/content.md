# Kubernetes Services & ClusterIP

A **Service** is an abstract way to expose an application running on a set of Pods as a network service. With Kubernetes, you don't need to modify your application to use an unfamiliar service discovery mechanism. Kubernetes gives Pods their own IP addresses and a single DNS name for a set of Pods, and can load-balance across them.

---

## Service Types

Kubernetes supports four main types of Services:
1. **ClusterIP (Default)**: Exposes the Service on a cluster-internal IP. Choosing this value makes the Service only reachable from within the cluster.
2. **NodePort**: Exposes the Service on each Node's IP at a static port (the `NodePort`). You can contact the NodePort Service from outside the cluster by requesting `<NodeIP>:<NodePort>`.
3. **LoadBalancer**: Exposes the Service externally using a cloud provider's load balancer.
4. **ExternalName**: Maps the Service to the contents of the `externalName` field (e.g. `foo.bar.example.com`).

---

## Defining a ClusterIP Service

Here is a standard YAML manifest for a ClusterIP Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: ClusterIP
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
```

- **`spec.selector`**: Identifies the target Pods by matching their labels (in this case, Pods with `app: my-app`).
- **`spec.ports[].port`**: The port that the Service itself will expose inside the cluster.
- **`spec.ports[].targetPort`**: The port on the container inside the target Pod that receives the traffic.

---

## Lab Tasks

### Task 1: Access a Service Internal to Cluster
1. Start the lab in your terminal:
   ```bash
   tld start k8s-access-service
   ```
2. Navigate to `~/k8s-services-networking`.
3. Complete the task requirements: Successfully accessed the internal cluster service from the client pod.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Create a ClusterIP Service
1. Start the lab in your terminal:
   ```bash
   tld start k8s-create-clusterip-service
   ```
2. Complete the task requirements: ClusterIP service created and targets backend pods successfully.
3. Verify the task:
   ```bash
   tld check
   ```
