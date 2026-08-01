# Secrets

A **Secret** is an object that contains a small amount of sensitive data such as a password, a token, or a key. Putting such information in a Secret is safer and more flexible than putting it verbatim in a Pod definition or in a container image.

---

## 1. Secret Storage & Encoding
Unlike ConfigMaps, keys inside Secrets are base64-encoded:
- When you define a Secret in YAML, the values under `data` must be base64-encoded.
- Alternatively, you can use the `stringData` field to write values in cleartext (Kubernetes will automatically encode them upon creation).

### Creating a Secret imperatively:
```bash
kubectl create secret generic db-secret --from-literal=password=supersecret
```

---

## 2. Using Secrets in Pods

You can mount a Secret as files in a Volume inside a container, or expose it as environment variables:

### Secret Volume Mount Example
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-pod
spec:
  volumes:
  - name: secret-vol
    secret:
      secretName: db-secret
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - name: secret-vol
      mountPath: /etc/db
      readOnly: true
```
In this example:
- The secret `db-secret` is mounted as a volume at `/etc/db`.
- Kubernetes creates a file for each key in the secret under that directory (e.g. `/etc/db/password` will contain the decoded value `supersecret`).

---

## Lab Tasks

### Task 1: Create a Secret
1. Start the lab in your terminal:
   ```bash
   tld start k8s-create-secret
   ```
2. Complete the task requirements: Secret 'db-secret' successfully verified.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Mount Secret as Volume
1. Start the lab in your terminal:
   ```bash
   tld start k8s-use-secret
   ```
2. Complete the task requirements: Secret volume mount verified successfully.
3. Verify the task:
   ```bash
   tld check
   ```
