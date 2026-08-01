# Securing Traffic with Network Policies

By default in Kubernetes, **all Pods can communicate with all other Pods** without restriction. In production environments, this "non-isolated" behavior is a security risk.

A **NetworkPolicy** allows you to restrict network traffic at the IP address or port level.

---

## Network Isolation

Pods become isolated when there is a NetworkPolicy that selects them. Once a Pod is selected by any NetworkPolicy:
- It will reject any connections that are not explicitly allowed by the policy (Default Deny).
- Non-selected Pods remain non-isolated and accept all traffic.

---

## Defining a NetworkPolicy

Below is an example of a NetworkPolicy that restricts access to db Pods:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow-db
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db               # Selects the target pods to isolate (target: DB)
  policyTypes:
  - Ingress                  # Policy applies to incoming traffic
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: api-server   # Allows ingress ONLY from pods with this label
    ports:
    - protocol: TCP
      port: 5432             # Restricted to PostgreSQL port
```

---

## CNI Requirement

NetworkPolicies are implemented by the CNI plugin. If you run a cluster without a CNI plugin that supports NetworkPolicies (like Flannel), applying a NetworkPolicy object will succeed, but it will have **no effect** (traffic will not be blocked). 
CNIs like **Calico**, **Cilium**, and **Kube-router** fully enforce NetworkPolicies.

---

## Lab Tasks

### Task 1: Restrict Traffic with NetworkPolicy
1. Start the lab in your terminal:
   ```bash
   tld start k8s-restrict-traffic
   ```
2. Complete the task requirements: NetworkPolicy 'db-policy' restricts traffic correctly.
3. Verify the task:
   ```bash
   tld check
   ```
