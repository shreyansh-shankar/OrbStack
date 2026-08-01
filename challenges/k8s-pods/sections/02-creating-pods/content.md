# Creating Pods

There are two primary ways to create Pods in Kubernetes: imperatively (using `kubectl run`) and declaratively (using a YAML configuration manifest).

---

## 1. Imperative Creation
Imperative commands are quick for testing or debugging:
```bash
kubectl run nginx-pod --image=nginx
```
This commands tells Kubernetes to start a Pod named `nginx-pod` running the `nginx` image immediately in your current active context namespace.

---

## 2. Declarative Creation
Declarative configurations are reproducible, version-controlled, and recommended for production:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: web
spec:
  containers:
  - name: web-container
    image: nginx
    ports:
    - containerPort: 80
```

To deploy this declarative configuration to your cluster:
```bash
kubectl apply -f pod-manifest.yaml
```
To delete it using the manifest file:
```bash
kubectl delete -f pod-manifest.yaml
```

---

## Lab Tasks

### Task 1: Create Your First Pod
1. Start the lab in your terminal:
   ```bash
   tld start k8s-create-first-pod
   ```
2. Complete the task requirements: Successfully created and running nginx-pod.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Delete a Pod
1. Start the lab in your terminal:
   ```bash
   tld start k8s-delete-pod
   ```
2. Complete the task requirements: Pod 'dynamic-pod' successfully deleted.
3. Verify the task:
   ```bash
   tld check
   ```
