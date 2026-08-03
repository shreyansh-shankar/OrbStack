import type { DocPage } from "../types";

const page: DocPage = {
  title: "Quick Start",
  description: "Go from zero to solving your first lab in under 5 minutes.",
  section: "Getting Started",
  sectionId: "getting-started",
  toc: [
    { id: "install", text: "Install the CLI", level: 2 },
    { id: "login", text: "Sign in (optional)", level: 2 },
    { id: "start-lab", text: "Start a lab", level: 2 },
    { id: "solve-it", text: "Solve it", level: 2 },
    { id: "validate", text: "Validate", level: 2 },
  ],
  content: [
    {
      type: "callout",
      variant: "tip",
      title: "No account needed to start",
      text: "You can run your first lab without signing in. An account lets you track progress across machines and unlock the leaderboard.",
    },
    {
      type: "heading2",
      text: "Install the CLI",
      id: "install",
    },
    {
      type: "code",
      lang: "bash",
      code: "curl -fsSL https://install.thelastdeploy.com | sh",
    },
    {
      type: "heading2",
      text: "Sign in (optional)",
      id: "login",
    },
    {
      type: "code",
      lang: "bash",
      code: "tld login\n# Opening browser for authentication...\n# Logged in as shreyansh@thelastdeploy.com",
    },
    {
      type: "heading2",
      text: "Start a lab",
      id: "start-lab",
    },
    {
      type: "paragraph",
      text: "Pick any lab from the available tracks. For your first time, we recommend starting with Docker fundamentals.",
    },
    {
      type: "code",
      lang: "bash",
      code: "# List available labs\ntld lab list\n\n# Start a specific lab\ntld lab start docker-fundamentals\n\n# You'll see something like:\n# Pulling lab environment...\n# Starting containers...\n# Lab ready. Read the scenario in your terminal.\n# Run `tld check` when you think you've fixed it.",
    },
    {
      type: "heading2",
      text: "Solve it",
      id: "solve-it",
    },
    {
      type: "paragraph",
      text: "Read the scenario carefully. Use the tools available in your terminal — docker, bash, curl, whatever the lab requires. The README for each lab is inside the lab directory.",
    },
    {
      type: "code",
      lang: "bash",
      code: "# Read the lab README\ncat ~/.tld/labs/current/README.md\n\n# Investigate the problem\ndocker ps -a\ndocker logs <container-id>\n\n# Apply your fix\n# (this will be different for every lab)",
    },
    {
      type: "heading2",
      text: "Validate",
      id: "validate",
    },
    {
      type: "code",
      lang: "bash",
      code: "tld check\n\n# Results:\n# ✓ Container is running\n# ✓ Port 80 is accessible\n# ✓ Nginx returns HTTP 200\n# ✗ Response body does not match expected\n#\n# 3/4 checks passed. Fix the remaining issue and run `tld check` again.",
    },
    {
      type: "callout",
      variant: "info",
      title: "Partial results are normal",
      text: "Validators report each check individually. Fix the failing checks one by one and re-run `tld check` as many times as you need.",
    },
  ],
};

export default page;
