# Working with Namespaces

In Kubernetes, **namespaces** provide a mechanism for isolating groups of resources within a single cluster. Names of resources must be unique within a namespace, but not across namespaces.

Namespace-based scoping is applicable only for namespaced objects (e.g. Deployments, Services, Pods) and not for cluster-wide objects (e.g. StorageClass, Nodes, PersistentVolumes).

---

## When to Use Multiple Namespaces

- **Environment Isolation**: Separate dev, staging, and production environments within the same physical cluster.
- **Multi-tenancy**: Keep teams or projects separated so they don't accidentally modify or query each other's resources.
- **Resource Constraints**: Apply resource quotas or limits to individual namespaces (e.g. limiting the dev namespace memory usage).

---

## Key Namespace Operations

### 1. Listing Namespaces
```bash
kubectl get namespaces
# Or short form:
kubectl get ns
```
Default namespaces created by Kubernetes include:
- `default`: The default namespace for resources with no other namespace spec.
- `kube-system`: The namespace for resources created by the Kubernetes system.
- `kube-public`: Created automatically and readable by all users (mostly for cluster bootstrap info).
- `kube-node-lease`: Holds Node Lease objects associated with each node (for node heartbeat status).

### 2. Creating a Namespace
```bash
kubectl create namespace development
```

### 3. Querying Resources in a Specific Namespace
```bash
kubectl get pods -n kube-system
```

### 4. Changing Default Namespace Context
By default, `kubectl` directs requests to the `default` namespace. To change the namespace of your active context permanently:
```bash
kubectl config set-context --current --namespace=development
```
After running this, running `kubectl get pods` will list pods in `development` namespace automatically.

---

## Lab Tasks

### Task 1: Create a Namespace
1. Start the lab in your terminal:
   ```bash
   tld start k8s-create-namespace
   ```
2. Complete the task requirements: Namespace 'production' created successfully.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Switch Default Namespace
1. Start the lab in your terminal:
   ```bash
   tld start k8s-switch-namespace
   ```
2. Complete the task requirements: Successfully switched default context namespace to development.
3. Verify the task:
   ```bash
   tld check
   ```
