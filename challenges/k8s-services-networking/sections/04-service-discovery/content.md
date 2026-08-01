# Service Discovery & CoreDNS

Hardcoding IP addresses is bad practice in dynamic environments. In Kubernetes, services are discovered using automatically configured DNS names.

---

## CoreDNS in Kubernetes

Kubernetes runs a DNS service (usually **CoreDNS**) as a set of system Pods in the `kube-system` namespace. 
The CNI/kubelet automatically configures the `/etc/resolv.conf` inside every container to point to this DNS Service IP.

---

## DNS Name Format for Services

Every Service defined in the cluster is assigned a DNS name. The fully qualified domain name (FQDN) format is:

```
<service-name>.<namespace>.svc.cluster.local
```

### Examples:
- If a Service named `db-service` is in the `default` namespace, its FQDN is:
  `db-service.default.svc.cluster.local`
- If you are accessing it from within the **same namespace** (e.g. `default`), you can simply use the short name:
  `db-service`
- If you are accessing it from a **different namespace** (e.g. `dev`), you can use:
  `db-service.default`

---

## Testing DNS Resolution

You can verify that DNS resolution is working by running `nslookup` or `dig` inside a Pod:

```bash
kubectl exec client-pod -- nslookup backend-service
```

This will output the Service's ClusterIP and confirm CoreDNS is successfully resolving the hostname.

> [!TIP]
> Sometimes, `nslookup` inside certain containers (like Busybox) will print search path domain lookup errors and exit with status `1` even though it successfully resolves the service IP. You can safely ignore these warnings or append `|| true` if your shell scripts require an exit code of `0`.

---

## Lab Tasks

### Task 1: Resolve Service DNS
1. Start the lab in your terminal:
   ```bash
   tld start k8s-service-dns
   ```
2. Navigate to `~/k8s-services-networking`.
3. Complete the task requirements: Service DNS successfully resolved and verified.
4. Verify the task:
   ```bash
   tld check
   ```
