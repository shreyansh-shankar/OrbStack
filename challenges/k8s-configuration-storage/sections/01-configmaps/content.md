# ConfigMaps

A **ConfigMap** is an API object used to store non-confidential data in key-value pairs. Decoupling configuration artifacts from image content helps keep containerized applications portable.

---

## 1. Creating ConfigMaps

You can create ConfigMaps using declarative YAML files or imperatively using `kubectl`:
```bash
# Create ConfigMap from literal values
kubectl create configmap app-config --from-literal=app.environment=production

# Create ConfigMap from a file containing configurations
kubectl create configmap app-config --from-file=app.properties
```

---

## 2. Using ConfigMaps inside Pods

ConfigMaps can be consumed inside pods in three ways:
- **Environment Variables**: Map keys to container environment variables.
- **Volume Mounts**: Mount keys as files inside a directory.
- **Command-line arguments**: Use mapped env vars in container command parameters.

### Env Var Injection Manifest Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-pod
spec:
  containers:
  - name: app
    image: nginx
    env:
    - name: ENVIRONMENT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: app.environment
```
In this example, the container's environment variable `ENVIRONMENT` will be populated with the value associated with key `app.environment` inside ConfigMap `app-config`.

---

## Lab Tasks

### Task 1: Create a ConfigMap
1. Start the lab in your terminal:
   ```bash
   tld start k8s-create-configmap
   ```
2. Complete the task requirements: ConfigMap 'app-config' successfully verified.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Use ConfigMap as Env Var
1. Start the lab in your terminal:
   ```bash
   tld start k8s-use-configmap
   ```
2. Complete the task requirements: ConfigMap environment variable injection verified successfully.
3. Verify the task:
   ```bash
   tld check
   ```
