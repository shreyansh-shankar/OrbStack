# Deployments

A Kubernetes Deployment provides declarative updates for Pods and ReplicaSets.

---

## Deployment Manifest Structure

Here is a standard YAML manifest for an Nginx Deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```

### Key Manifest Fields

1. **apiVersion**: Specifies the API version (for Deployments, always `apps/v1`).
2. **kind**: The resource type (`Deployment`).
3. **spec.replicas**: Specifies the number of identical pods to run (in this case, 3).
4. **spec.selector**: Tells the deployment controller which Pods to manage. The labels specified under `matchLabels` **must** match the labels defined in the pod template (`spec.template.metadata.labels`).
5. **spec.template**: The pod template spec. This defines the pods that the deployment creates.

---

## Managing Deployments

### Create / Apply
```bash
kubectl apply -f deployment.yaml
```

### Listing Deployments
```bash
kubectl get deployments
# Or abbreviated:
kubectl get deploy
```

### Describing Deployments
```bash
kubectl describe deployment nginx-deployment
```
Describing a deployment displays replicas status, conditions (e.g. `Available`, `Progressing`), and controller events.

---

## Lab Tasks

### Task 1: Create a Deployment
1. Start the lab in your terminal:
   ```bash
   tld start k8s-create-deployment
   ```
2. Complete the task requirements: Deployment 'nginx-deployment' successfully created with 3 running replicas.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: List Deployments
1. Start the lab in your terminal:
   ```bash
   tld start k8s-list-deployments
   ```
2. Navigate to `~/k8s-workloads`.
3. Complete the task requirements: Deployments count successfully verified.
4. Verify the task:
   ```bash
   tld check
   ```
