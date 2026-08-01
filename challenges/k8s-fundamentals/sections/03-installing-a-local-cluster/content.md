# Installing a Local Cluster

To learn and develop applications on Kubernetes, you don't need a multi-node cloud cluster. Several tools allow you to spin up a fully-functional Kubernetes cluster on your local machine.

## Common Local Kubernetes Tools

1. **Minikube**: Spins up a single-node Kubernetes cluster inside a local virtual machine (VM) or container. Highly configurable and feature-rich.
2. **k3s / k3d**: A lightweight Kubernetes distribution packaged as a single binary, optimized for IoT and Edge computing. `k3d` runs `k3s` inside Docker.
3. **Kind (Kubernetes in Docker)**: A tool for running local Kubernetes clusters using Docker container "nodes". It was primarily designed for testing Kubernetes itself, but is widely used for local development due to its speed and simplicity.

---

## Getting Started with Kind

`kind` uses container nodes to simulate a Kubernetes cluster. A control plane node and worker nodes are represented by Docker containers running systemd and the kubelet.

### Kind Prerequisites
Before using `kind`, you must have:
- **Docker** installed and running on your host machine.
- **kind** command-line tool.
- **kubectl** command-line tool (to communicate with the cluster).

### Creating a Cluster
To spin up a default cluster:
```bash
kind create cluster --name my-cluster
```

To list running clusters:
```bash
kind get clusters
```

To delete a cluster:
```bash
kind delete cluster --name my-cluster
```

---

## Lab Tasks

### Task 1: Install Kind and Kubectl
1. Start the lab in your terminal:
   ```bash
   tld start k8s-install-kind
   ```
2. Complete the task requirements: Kind and Kubectl are successfully installed.
3. Verify the task:
   ```bash
   tld check
   ```

### Task 2: Verify Cluster Access
1. Start the lab in your terminal:
   ```bash
   tld start k8s-verify-cluster
   ```
2. Navigate to `~/k8s-fundamentals`.
3. Complete the task requirements: Successfully verified cluster access and retrieved the control-plane node name.
4. Verify the task:
   ```bash
   tld check
   ```
