# Contributing to The Last Deploy

First off — thank you for taking the time to contribute! 🎉

TLD is built in public and every contribution matters, whether it's fixing a typo, improving a lab, writing a new validator, or helping someone on Discord.

This guide explains how to get involved.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Writing a Lab](#writing-a-lab)
- [Writing a Validator](#writing-a-validator)
- [Commit Convention](#commit-convention)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

This project follows our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards. Please report unacceptable behaviour to the maintainers.

---

## Ways to Contribute

You don't need to write code to contribute. Here's everything we welcome:

| Type | Examples |
|------|---------|
| 🐛 **Bug fixes** | Fix broken validators, CLI edge cases, UI bugs |
| 📖 **Labs** | New hands-on labs for existing or new tracks |
| ✅ **Validators** | Improve or add `validator.sh` scripts for labs |
| 📝 **Docs** | Improve README, contributing guide, lab `content.md` files |
| 🎨 **Design** | Landing page, web dashboard UI improvements |
| 💬 **Community** | Help others on Discord, triage issues |
| 🔍 **Testing** | Report bugs, test validators on different systems |

---

## Project Structure

```
/
├── agent/          # tld CLI (Go) — handles sync, start, check, auth
├── challenges/     # Lab content — each track is a directory
│   └── <track>/
│       └── sections/
│           └── <section>/
│               ├── content.md        # Teaching content
│               └── labs/
│                   └── <lab-id>/
│                       ├── README.md       # Lab instructions
│                       └── validator.sh    # Automated checker
├── web/
│   ├── backend/    # FastAPI REST API
│   └── frontend/   # Next.js dashboard
└── landing/        # Marketing site (Next.js)
```

---

## Development Setup

### Prerequisites

- Go 1.21+
- Node.js 18+
- Python 3.11+
- Docker 24+

### CLI (agent)

```bash
make build          # builds to ./bin/tld
make install        # builds + installs to /usr/local/bin
```

### Web backend

```bash
cd web/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Web frontend

```bash
cd web/frontend
npm install && npm run dev
```

### Landing page

```bash
cd landing
npm install && npm run dev    # http://localhost:3002
```

---

## Submitting a Pull Request

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/the-thing-you-fixed
   ```

2. **Make your changes.** Keep PRs focused — one concern per PR.

3. **Test your changes:**
   - For validators: run `tld check` against a passing and failing state
   - For the CLI: `make build && ./bin/tld <command>`
   - For the web: run the dev server and verify in browser
   - For the landing page: `npm run dev` in `/landing`

4. **Follow the [commit convention](#commit-convention).**

5. **Open a Pull Request** against `main` with:
   - A clear title (`feat: add nginx reverse proxy lab`)
   - What changed and why
   - Screenshots for UI changes
   - Steps to test (especially for validators)

6. A maintainer will review your PR. Please be responsive to feedback — PRs with no response for 14 days may be closed.

---

## Writing a Lab

Labs live in `challenges/<track>/sections/<section>/labs/<lab-id>/`.

### Lab directory structure

```
labs/
└── tld-<track>-short-name/       # e.g. dkr-fix-broken-container-network
    ├── README.md                  # Lab instructions shown to the learner
    └── validator.sh               # Automated checker
```

### README.md format

```markdown
# Lab Title

## Objective
One sentence describing the goal.

## Background
Brief context the learner needs.

## Your Task
Numbered steps or a clear problem statement.

## Hints
Optional — spoiler-tagged hints.

## Validation
Run `tld check` to verify your solution.
```

### Naming conventions

- Lab IDs use the track prefix: `lnx-` (Linux), `dkr-` (Docker), `git-` (Git), `k8s-` (Kubernetes)
- Use kebab-case: `dkr-fix-broken-dockerfile`
- Keep names short but descriptive

---

## Writing a Validator

Validators are `validator.sh` bash scripts that exit `0` on pass and non-zero on fail.

### Rules

- **Be specific** — test exactly what the lab asks for, not a workaround
- **Be fast** — validators should complete in < 5 seconds
- **Be informative** — print clear pass/fail messages with `echo`
- **Be portable** — assume a standard Linux environment (Ubuntu/Debian)
- **Do not install anything** — validators must not modify the system

### Template

```bash
#!/usr/bin/env bash
set -euo pipefail

PASS=0
FAIL=0

check() {
  local description="$1"
  local result="$2"   # 0 = pass, 1 = fail

  if [ "$result" -eq 0 ]; then
    echo "✓ $description"
    PASS=$((PASS + 1))
  else
    echo "✗ $description"
    FAIL=$((FAIL + 1))
  fi
}

# --- Your checks below ---

# Example: check nginx is running
nginx_running=0
systemctl is-active --quiet nginx 2>/dev/null || nginx_running=1
check "nginx service is running" "$nginx_running"

# --- Summary ---
echo ""
echo "Results: $PASS passed, $FAIL failed"

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
```

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

| Type | When to use |
|------|------------|
| `feat` | New lab, new feature, new validator |
| `fix` | Bug fix in validator, CLI, or UI |
| `docs` | Documentation only |
| `chore` | Build scripts, deps, CI |
| `refactor` | Code change with no behaviour change |
| `style` | Formatting, CSS, whitespace |
| `test` | Adding or improving tests |

**Examples:**
```
feat(challenges): add dkr-fix-broken-container-network lab
fix(validator): correct nginx port check in linux-networking
docs: update contributing guide with validator template
chore(deps): bump next to 16.2.6
```

---

## Reporting Bugs

Please open an issue using the **Bug Report** template. Include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Your OS, Docker version, and `tld --version` output
- Relevant log output

---

## Requesting Features

Open an issue using the **Feature Request** template. Please search existing issues first — your idea may already be tracked.

---

## Questions?

- **Discord**: [Join the server](https://discord.gg/tgShvdV8f)
- **GitHub Discussions**: For longer-form questions and ideas
- **Issues**: For bugs and concrete feature requests

Thank you for being part of The Last Deploy. 🚀
