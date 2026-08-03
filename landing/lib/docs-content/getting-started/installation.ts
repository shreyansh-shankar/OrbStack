import type { DocPage } from "../types";

const page: DocPage = {
  title: "Installation",
  description: "Install the TLD CLI on Linux, macOS, or Windows (WSL2).",
  section: "Getting Started",
  sectionId: "getting-started",
  toc: [
    { id: "prerequisites", text: "Prerequisites", level: 2 },
    { id: "quick-install", text: "Quick Install (curl)", level: 2 },
    { id: "npm", text: "Install via npm", level: 2 },
    { id: "brew", text: "Install via Homebrew", level: 2 },
    { id: "source", text: "Build from source", level: 2 },
    { id: "verify", text: "Verify installation", level: 2 },
  ],
  content: [
    {
      type: "heading2",
      text: "Prerequisites",
      id: "prerequisites",
    },
    {
      type: "table",
      headers: ["Tool", "Minimum Version", "Notes"],
      rows: [
        ["Docker", "24.0+", "Required to run labs"],
        ["Node.js", "18+", "Required for npm install method only"],
        ["Go", "1.21+", "Required for build-from-source only"],
        ["macOS / Linux", "any", "Windows requires WSL2"],
      ],
    },
    {
      type: "callout",
      variant: "warning",
      title: "Docker is required",
      text: "TLD labs run inside Docker containers. Make sure Docker is installed and the daemon is running before you start a lab. Run `docker info` to verify.",
    },
    {
      type: "heading2",
      text: "Quick Install (curl)",
      id: "quick-install",
    },
    {
      type: "paragraph",
      text: "The fastest way to install the TLD CLI on Linux or macOS is via our install script:",
    },
    {
      type: "code",
      lang: "bash",
      code: "curl -fsSL https://install.thelastdeploy.com | sh",
    },
    {
      type: "heading2",
      text: "Install via npm",
      id: "npm",
    },
    {
      type: "paragraph",
      text: "The easiest way to install TLD is via npm. This works on Linux, macOS, and Windows (WSL2).",
    },
    {
      type: "code",
      lang: "bash",
      code: "npm install -g @tld/cli",
    },
    {
      type: "heading2",
      text: "Install via Homebrew",
      id: "brew",
    },
    {
      type: "paragraph",
      text: "macOS and Linux users can install via Homebrew.",
    },
    {
      type: "code",
      lang: "bash",
      code: "brew tap thelastdeploy/tap\nbrew install tld",
    },
    {
      type: "heading2",
      text: "Build from source",
      id: "source",
    },
    {
      type: "paragraph",
      text: "Clone the repository and build the CLI from source. This requires Go 1.21+.",
    },
    {
      type: "code",
      lang: "bash",
      code: "git clone https://github.com/thelastdeploy/thelastdeploy.git\ncd thelastdeploy\n\n# Build and install to /usr/local/bin\nmake install\n\n# Or build to ./bin/tld without installing\nmake build",
    },
    {
      type: "heading2",
      text: "Verify installation",
      id: "verify",
    },
    {
      type: "code",
      lang: "bash",
      code: "tld version\n# tld v0.1.0 (linux/amd64)\n\ntld doctor\n# Checking environment...\n# ✓ Docker is running (24.0.5)\n# ✓ Docker socket accessible\n# ✓ Disk space OK (45GB free)\n# ✓ Network connectivity OK\n# All checks passed.",
    },
    {
      type: "callout",
      variant: "info",
      title: "Something not working?",
      text: "Check the Troubleshooting page for common installation issues — Docker not running, permission denied, or port conflicts.",
    },
  ],
};

export default page;
