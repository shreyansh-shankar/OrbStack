# Labels and Selectors

**Labels** are key/value pairs that are attached to Kubernetes resources (such as Pods). They are intended to be used to specify identifying attributes of objects that are meaningful and relevant to users, but do not directly imply semantics to the core system.

**Selectors** are the grouping primitive in Kubernetes. They allow you to query and filter collections of resources based on their labels.

---

## 1. Adding and Modifying Labels

You can specify labels in the metadata block of any resource YAML configuration:
```yaml
metadata:
  labels:
    app: backend
    environment: production
```

Or attach them dynamically to active resources using the CLI:
```bash
# Add environment=production label to metadata-pod
kubectl label pod metadata-pod environment=production

# Overwrite existing label value
kubectl label pod metadata-pod environment=development --overwrite
```

---

## 2. Label Selectors

There are two types of selectors: equality-based (e.g. `environment=production`) and set-based (e.g. `environment in (production, staging)`).

### Querying Resources by Label Selector
To query resources using labels, use the `-l` or `--selector` flag:
```bash
# List all pods with label environment=production
kubectl get pods -l environment=production

# List all pods with both environment=production AND app=nginx
kubectl get pods -l environment=production,app=nginx

# List all pods where tier label is NOT backend
kubectl get pods -l 'tier!=backend'
```

---

## Lab Tasks

### Task 1: Label a Resource
1. Start the lab in your terminal:
   ```bash
   tld start k8s-add-labels
   ```
2. Complete the task requirements: Label environment=production verified successfully on metadata-pod.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Query by Label Selector
1. Start the lab in your terminal:
   ```bash
   tld start k8s-query-by-label
   ```
2. Navigate to `~/k8s-workloads`.
3. Complete the task requirements: Successfully queried and verified backend pods list.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 3: Selector Match
1. Start the lab in your terminal:
   ```bash
   tld start k8s-selector-match
   ```
2. Navigate to `~/k8s-workloads`.
3. Complete the task requirements: Selector match query verified successfully.
4. Verify the task:
   ```bash
   tld check
   ```
