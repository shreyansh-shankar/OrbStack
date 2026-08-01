# Cluster Introspection

Cluster Introspection refers to querying and examining the cluster state, configurations, and connectivity of running resources.

## Querying Resource Details

For deep introspection of any Kubernetes resource, you can output details in different formats (JSON, YAML) using the `-o` or `--output` flag:
```bash
# Get details of a pod in YAML format
kubectl get pod app-pod -o yaml

# Get specific fields using JSONPath
kubectl get pod app-pod -o jsonpath='{.status.podIP}'
```

---

## Inspecting Services

A Kubernetes **Service** is an abstract way to expose an application running on a set of Pods as a network service.

Key fields of a Service to inspect:
- **ClusterIP**: The internal IP address assigned to the service, reachable only inside the cluster.
- **Port**: The port that the service exposes to the cluster.
- **TargetPort**: The port on the pod that the service forwards traffic to.
- **Selector**: The label selector used to direct traffic to matching pods.

To query all services in all namespaces:
```bash
kubectl get svc -A
```
To describe a specific service:
```bash
kubectl describe svc my-service -n my-namespace
```

---

## Lab Tasks

### Task 1: Explore Cluster Services
1. Start the lab in your terminal:
   ```bash
   tld start k8s-explore-cluster
   ```
2. Navigate to `~/k8s-fundamentals`.
3. Complete the task requirements: Service ClusterIP successfully validated.
4. Verify the task:
   ```bash
   tld check
   ```
