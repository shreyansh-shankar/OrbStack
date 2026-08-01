# Inspecting Pods

Once a Pod is running, you can inspect its IP address, query application logs, and execute commands inside its containers.

---

## 1. Finding Pod Details (IP & Node)

Using the `-o wide` flag, you can see the internal IP address assigned to the Pod and the worker node it has been scheduled to run on:
```bash
kubectl get pods -o wide
```

For more detailed low-level parameters, output the state in YAML:
```bash
kubectl get pod nginx-pod -o yaml
```

---

## 2. Querying Container Logs

If your application container outputs logs to standard output/error, you can retrieve them using:
```bash
kubectl logs nginx-pod
```

If the Pod runs multiple containers, you must specify the target container name using `-c`:
```bash
kubectl logs my-pod -c main-app
```

To stream the logs continuously:
```bash
kubectl logs -f nginx-pod
```

---

## 3. Executing Commands inside Containers

To troubleshoot an application or query local configs, you can run interactive bash sessions inside the container:
```bash
kubectl exec -it nginx-pod -- /bin/bash
```

Or execute a single command without opening an interactive shell:
```bash
kubectl exec nginx-pod -- ls -la /usr/share/nginx/html
```

---

## Lab Tasks

### Task 1: Exec Into Container
1. Start the lab in your terminal:
   ```bash
   tld start k8s-exec-into-pod
   ```
2. Complete the task requirements: Successfully validated container execution and hostname entry.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Inspect a Pod IP
1. Start the lab in your terminal:
   ```bash
   tld start k8s-inspect-pod
   ```
2. Navigate to `~/k8s-pods`.
3. Complete the task requirements: Pod IP successfully verified.
4. Verify the task:
   ```bash
   tld check
   ```

### Task 3: Inspect Pod Logs
1. Start the lab in your terminal:
   ```bash
   tld start k8s-view-pod-logs
   ```
2. Navigate to `~/k8s-pods`.
3. Complete the task requirements: Pod log message verified successfully.
4. Verify the task:
   ```bash
   tld check
   ```
