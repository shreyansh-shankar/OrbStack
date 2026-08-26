<p align="center">
  <img src="https://img.shields.io/badge/license-Apache%202.0-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/version-v1.1.0-blue?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/built%20in-public-blueviolet?style=flat-square" alt="Built in Public" />
  <img src="https://img.shields.io/github/stars/thelastdeploy/thelastdeploy?style=flat-square" alt="Stars" />
</p>

<h1 align="center">The Last Deploy</h1>

<p align="center">
  <strong>Learn DevOps by fixing real systems — on your own machine.</strong><br/>
  No cloud fees. No fake terminals. No passive videos.
</p>

---

## What is TLD?

**The Last Deploy (TLD)** is an open-source DevOps learning platform built around one core principle: you only truly learn when something is broken and you have to fix it.

Instead of watching videos or copying commands from tutorials, you:

1. **Spin up a local lab** on your actual machine with a single CLI command (`tld start <lab-id>`)
2. **Encounter a deliberately broken system** — a misconfigured Nginx proxy, a crashed container, a corrupted state file, or broken git history
3. **Troubleshoot and fix it** using real terminal tools
4. **Validate your fix** with `tld check` — an automated validator script that verifies exact state requirements
5. **Earn XP and progress** across 6 comprehensive tracks at your own pace

Everything runs locally. No account required to start. No cloud costs. Forever free.

---

## Monorepo Structure

```
/
├── agent/          # tld CLI (v1.1.0) — written in Go
│   ├── cmd/        # Command implementations (start, check, stop, status, sync, doctor, publish, etc.)
│   └── internal/   # Core internal logic (cache, local server, validator engine)
├── challenges/     # 37 lab modules across 6 DevOps tracks
│   ├── linux-*     # Fundamentals, Users & Permissions, Processes & Services, Networking
│   ├── git-*       # Fundamentals, Branching, Remotes, History & Recovery, Troubleshooting
│   ├── docker-*    # Fundamentals, Containers, Images, Networking, Storage, Compose, Troubleshooting
│   ├── k8s-*       # Fundamentals, Pods, Workloads, Services & Networking, Config & Storage, Troubleshooting
│   ├── terraform-* # Fundamentals, HCL, Resources, Expressions & Variables, State, Modules, Troubleshooting
│   └── nginx-*     # Fundamentals, Serving Content, Configuration, Routing, Reverse Proxy, Security & Performance, Troubleshooting
├── web/
│   ├── backend/    # Platform REST API — Python / FastAPI + Alembic
│   └── frontend/   # Web dashboard — Next.js 15 / React / Tailwind CSS
├── landing/        # Marketing landing page & docs platform — Next.js 15
├── bin/            # Compiled local CLI binaries (gitignored)
├── Makefile        # Developer build system & shortcuts
└── LICENSE         # Apache 2.0
```

---

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Go   | 1.21+   | Required for CLI build |
| Node | 18+     | Required for web dashboard & landing |
| Python | 3.11+ | Required for backend API |
| Docker | 24+    | Required for running containerized labs |

---

### 1 — Build & Install the CLI (`v1.1.0`)

```bash
# Build and install tld binary to /usr/local/bin
make install

# Or build to ./bin/tld locally
make build
```

### 2 — Authenticate (optional for local self-hosted use)

```bash
tld login
```

### 3 — Sync Challenges

```bash
tld sync --all
```

### 4 — Start a Lab

```bash
tld start docker-fundamentals
```

### 5 — Validate Your Fix

```bash
tld check
```

### 6 — Additional CLI Commands

```bash
tld status      # View active lab status and progress
tld stop        # Stop active lab environment
tld doctor      # Run local environment diagnostics
tld publish     # Package and publish custom challenge modules
tld version     # Display CLI version info
```

---

## Running the Web Application (Local Development)

### Backend API (FastAPI)

```bash
cd web/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Web Dashboard (Next.js)

```bash
cd web/frontend
npm install
npm run dev   # runs on http://localhost:3000
```

### Landing Page & Docs (Next.js)

```bash
cd landing
npm install
npm run dev   # runs on http://localhost:3002
```

---

## Available Tracks & Content Status

| Track | Sub-Modules | Status |
|-------|-------------|--------|
| **Linux** | Fundamentals, Users & Permissions, Processes & Services, Networking, Broken Permissions | ✅ Available (5 modules) |
| **Git** | Fundamentals, Branching, Remotes & Collaboration, History & Recovery, Troubleshooting | ✅ Available (5 modules) |
| **Docker** | Fundamentals, Containers, Images, Networking, Storage, Compose, Troubleshooting | ✅ Available (7 modules) |
| **Kubernetes** | Fundamentals, Pods, Workloads, Services & Networking, Config & Storage, Troubleshooting | ✅ Available (6 modules) |
| **Terraform** | Fundamentals, HCL, Resources, Expressions & Variables, State, Modules, Troubleshooting | ✅ Available (7 modules) |
| **Nginx** | Fundamentals, Serving Content, Configuration, Routing, Reverse Proxy, Security & Performance, Troubleshooting | ✅ Available (7 modules) |
| **Jenkins** | CI/CD Pipelines & Automation | 🔜 Coming Soon |
| **Monitoring** | Prometheus & Grafana Observability | 🔜 Coming Soon |

---

## Contributing

We welcome contributions of all kinds — new lab challenges, bug fixes, validator enhancements, and documentation.

See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.

---

## Community

- 💬 **Discord** — [Join our Discord community](https://discord.gg/tgShvdV8f)
- ⭐ **GitHub** — Star the repo on [GitHub](https://github.com/thelastdeploy/thelastdeploy) to follow progress
- 🔧 **Issues** — [Open an issue](https://github.com/thelastdeploy/thelastdeploy/issues) for bug reports or feature requests

---

## License

Licensed under the **Apache License 2.0**. See [LICENSE](./LICENSE) for details.

Copyright 2026 Shreyansh Shankar
