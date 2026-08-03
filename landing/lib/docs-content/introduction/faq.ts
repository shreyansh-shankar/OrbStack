import type { DocPage } from "../types";

const page: DocPage = {
  title: "FAQ",
  description: "Answers to the most common questions about The Last Deploy.",
  section: "Introduction",
  sectionId: "introduction",
  toc: [
    { id: "general", text: "General", level: 2 },
    { id: "technical", text: "Technical", level: 2 },
    { id: "contributing", text: "Contributing", level: 2 },
  ],
  content: [
    {
      type: "heading2",
      text: "General",
      id: "general",
    },
    {
      type: "collapsible",
      trigger: "Is TLD free?",
      content: "Yes. TLD is completely free — no subscription, no credit card, no account required to run labs. The CLI, all labs, and all validators are open source under the Apache 2.0 license.",
    },
    {
      type: "collapsible",
      trigger: "Do I need a cloud account?",
      content: "No. All labs run locally using Docker. You don't need an AWS, GCP, or Azure account. Everything runs on your machine.",
    },
    {
      type: "collapsible",
      trigger: "Does TLD work on Windows?",
      content: "Yes, via WSL2 (Windows Subsystem for Linux). You'll need Docker Desktop with WSL2 integration enabled. We recommend Ubuntu 22.04 as your WSL distro. Native Windows support without WSL is not planned.",
    },
    {
      type: "collapsible",
      trigger: "Does TLD work on macOS?",
      content: "Yes. Install Docker Desktop for Mac and the TLD CLI. Both Intel and Apple Silicon (M1/M2/M3) Macs are supported.",
    },
    {
      type: "collapsible",
      trigger: "Is progress tracked across machines?",
      content: "If you're signed in with a TLD account, your progress syncs automatically. If you run labs offline or without an account, progress is stored locally only.",
    },
    {
      type: "collapsible",
      trigger: "How is TLD different from KodeKloud or Katacoda?",
      content: "TLD runs entirely on your own machine with real Docker containers — not simulated browser environments. This means real debugging, real tools, and real networking. Katacoda was shut down. KodeKloud uses simulated environments and requires a paid subscription for most content.",
    },
    {
      type: "heading2",
      text: "Technical",
      id: "technical",
    },
    {
      type: "collapsible",
      trigger: "What are the system requirements?",
      content: "You need: Docker 24+, 4GB RAM minimum (8GB recommended), and 10GB free disk space for Docker images. Linux, macOS, and Windows (WSL2) are all supported.",
    },
    {
      type: "collapsible",
      trigger: "How does the validator work?",
      content: "Each lab includes a validator.sh — a bash script that checks whether your solution meets the lab's requirements. The script exits 0 on success and non-zero on failure. Running `tld check` executes this script inside the lab environment and reports results to you.",
    },
    {
      type: "collapsible",
      trigger: "Can I peek at the validator to cheat?",
      content: "Yes. The validator source is visible — all labs are open source. But if you just engineer around the validator without understanding why your fix works, you're only cheating yourself. The validator checks outcomes, not methods.",
    },
    {
      type: "collapsible",
      trigger: "Why is the CLI written in Go?",
      content: "Go produces small, fast, statically-linked binaries with no runtime dependencies. This makes distribution simple — a single binary works on Linux, macOS, and Windows without needing Node.js, Python, or any runtime installed. It also gives us strong cross-platform support with minimal complexity.",
    },
    {
      type: "collapsible",
      trigger: "What does `tld doctor` do?",
      content: "tld doctor checks your local environment for common issues: Docker running status, Docker version compatibility, network connectivity, available disk space, and CLI version. It's the first command to run when something isn't working.",
    },
    {
      type: "heading2",
      text: "Contributing",
      id: "contributing",
    },
    {
      type: "collapsible",
      trigger: "Can I write my own lab?",
      content: "Absolutely. Labs are just a README.md (instructions) and a validator.sh (checker) inside the challenges/ directory. See the Contributing section for the lab format and naming conventions.",
    },
    {
      type: "collapsible",
      trigger: "Do I need to be an expert to contribute?",
      content: "No. Some of the best labs come from people who just learned a topic and documented their struggle. If you found something confusing and figured it out, write a lab about it.",
    },
    {
      type: "collapsible",
      trigger: "How do I report a broken validator?",
      content: "Open a GitHub issue with the lab ID, your OS, Docker version, and the exact output you received. Include what you expected to happen and what happened instead.",
    },
  ],
};

export default page;
