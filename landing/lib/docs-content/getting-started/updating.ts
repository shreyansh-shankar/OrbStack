import type { DocPage } from "../types";

const page: DocPage = {
  title: "Updating",
  description: "Keep the TLD CLI up to date.",
  section: "Getting Started",
  sectionId: "getting-started",
  toc: [
    { id: "check-version", text: "Check your version", level: 2 },
    { id: "update", text: "Update the CLI", level: 2 },
    { id: "manual", text: "Manual update", level: 2 },
  ],
  content: [
    {
      type: "heading2",
      text: "Check your version",
      id: "check-version",
    },
    {
      type: "code",
      lang: "bash",
      code: "tld version\n# tld v0.1.0 (linux/amd64)\n# Latest: v0.1.2 — run `tld update` to upgrade",
    },
    {
      type: "heading2",
      text: "Update the CLI",
      id: "update",
    },
    {
      type: "code",
      lang: "bash",
      code: "tld update\n\n# Checking for updates...\n# Current: v0.1.0\n# Latest:  v0.1.2\n# Downloading update...\n# Installing...\n# Updated to v0.1.2",
    },
    {
      type: "callout",
      variant: "info",
      title: "Re-run installer script",
      text: "You can also upgrade to the latest version anytime by re-running: `curl -fsSL https://install.thelastdeploy.com | sh`",
    },
    {
      type: "heading2",
      text: "Manual update",
      id: "manual",
    },
    {
      type: "paragraph",
      text: "If you installed from source, pull the latest changes and rebuild.",
    },
    {
      type: "code",
      lang: "bash",
      code: "cd /path/to/thelastdeploy\ngit pull origin main\nmake install",
    },
  ],
};

export default page;
