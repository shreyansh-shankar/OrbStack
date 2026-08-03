import type { DocPage } from "../types";

const page: DocPage = {
  title: "Welcome to The Last Deploy",
  description: "An open-source DevOps learning platform where you learn by doing — not watching.",
  section: "Introduction",
  sectionId: "introduction",
  toc: [
    { id: "what-is-tld", text: "What is TLD?", level: 2 },
    { id: "how-it-works", text: "How it works", level: 2 },
    { id: "no-cloud-fees", text: "No cloud fees. Ever.", level: 2 },
    { id: "get-started", text: "Get started", level: 2 },
  ],
  content: [
    {
      type: "paragraph",
      text: "The Last Deploy is an open-source platform for learning DevOps by solving real-world infrastructure labs.",
    },
    {
      type: "paragraph",
      text: "Instead of watching videos, you deploy. Instead of memorizing commands, you break production. Instead of tutorials, you solve incidents.",
    },
    {
      type: "heading2",
      text: "What is TLD?",
      id: "what-is-tld",
    },
    {
      type: "paragraph",
      text: "TLD gives you deliberately broken systems — misconfigured nginx servers, crashed containers, corrupted git histories, broken CI pipelines — and asks you to fix them. Every lab runs entirely on your own machine using Docker. No cloud account needed.",
    },
    {
      type: "callout",
      variant: "info",
      title: "Open source and free",
      text: "TLD is Apache 2.0 licensed. Every lab, every validator, every line of code is public. No paywalls, no subscriptions, no vendor lock-in.",
    },
    {
      type: "heading2",
      text: "How it works",
      id: "how-it-works",
    },
    {
      type: "steps",
      steps: [
        {
          title: "Install the CLI",
          description: "One command to install the tld agent on your machine.",
          code: "curl -fsSL https://install.thelastdeploy.com | sh",
        },
        {
          title: "Start a lab",
          description: "Pick a track and spin up your first broken environment.",
          code: "tld lab start docker-fundamentals",
        },
        {
          title: "Fix the system",
          description: "Read the scenario, investigate, and repair the broken infrastructure using real tools in a real terminal.",
        },
        {
          title: "Validate your solution",
          description: "Run the automated checker. It tells you exactly what passed and what didn't.",
          code: "tld check",
        },
        {
          title: "Earn XP and progress",
          description: "Track your progress across labs and unlock harder challenges.",
        },
      ],
    },
    {
      type: "heading2",
      text: "No cloud fees. Ever.",
      id: "no-cloud-fees",
    },
    {
      type: "paragraph",
      text: "Every TLD lab runs inside Docker containers on your own machine. There are no AWS credits to burn, no Kubernetes cluster to provision, and no surprise bills. If you have Docker installed, you have everything you need.",
    },
    {
      type: "heading2",
      text: "Get started",
      id: "get-started",
    },
    {
      type: "paragraph",
      text: "The fastest path to your first lab is the Quick Start guide. You'll go from zero to solving an incident in under 5 minutes.",
    },
    {
      type: "bullet-list",
      items: [
        "**Installation** — Install the TLD CLI",
        "**Quick Start** — Zero to first lab in 5 minutes",
        "**Your First Lab** — Full step-by-step walkthrough",
      ],
    },
  ],
};

export default page;
