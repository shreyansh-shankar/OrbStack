import type { DocPage } from "../types";
const page: DocPage = {
  title: "Discord",
  description: "Join the TLD community on Discord.",
  section: "Community", sectionId: "community",
  toc: [{ id: "join", text: "Join the server", level: 2 }, { id: "channels", text: "Channels", level: 2 }],
  content: [
    { type: "heading2", text: "Join the server", id: "join" },
    { type: "paragraph", text: "Discord is where the TLD community lives. Ask questions, share solutions, discuss labs, and get notified about new releases." },
    { type: "code", lang: "text", code: "discord.gg/tgShvdV8f" },
    { type: "heading2", text: "Channels", id: "channels" },
    { type: "table", headers: ["Channel", "Purpose"], rows: [
      ["#general", "General conversation and introductions"],
      ["#help", "Get help with labs and the CLI"],
      ["#labs", "Discuss specific labs (no spoilers without warnings)"],
      ["#contributing", "Coordinate contributions and PRs"],
      ["#announcements", "New labs, releases, and updates"],
      ["#showcase", "Share your solutions and setups"],
    ]},
    { type: "callout", variant: "info", title: "Community rule", text: "No spoilers without a warning. If you're sharing a solution, use ||spoiler tags|| or post in a thread." },
  ],
};
export default page;
