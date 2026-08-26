export const LAUNCH_DATE = new Date("2026-08-08T00:00:00Z");

export const SITE_URL = "https://thelastdeploy.dev";

export const SOCIAL_LINKS = {
  github: "https://github.com/thelastdeploy/thelastdeploy",
  discord: "https://discord.gg/tgShvdV8f",
  linkedin: "https://www.linkedin.com/company/thelastdeploy/",
  blog: "https://thelastdeploy.hashnode.dev/",
} as const;

export const TRACKS: {
  name: string;
  description: string;
  color: string;
  status: "available" | "coming-soon";
}[] = [
    {
      name: "Linux",
      description: "Filesystem, processes, permissions, shell scripting, and system administration.",
      color: "orange",
      status: "available",
    },
    {
      name: "Git",
      description: "Branching, rebasing, merge conflicts, hooks, and collaborative workflows.",
      color: "red",
      status: "available",
    },
    {
      name: "Docker",
      description: "Containers, images, Dockerfiles, volumes, networking, and Compose.",
      color: "green",
      status: "available",
    },
    {
      name: "Kubernetes",
      description: "Pods, deployments, services, ingress, Helm, and cluster operations.",
      color: "purple",
      status: "available",
    },
    {
      name: "Terraform",
      description: "Infrastructure as code, state management, modules, and providers.",
      color: "cyan",
      status: "available",
    },
    {
      name: "Nginx",
      description: "Reverse proxy, load balancing, SSL termination, and performance tuning.",
      color: "green",
      status: "available",
    },
    {
      name: "Jenkins",
      description: "CI/CD pipelines, automation, and integration workflows.",
      color: "yellow",
      status: "coming-soon",
    },
    {
      name: "Prometheus",
      description: "Metrics collection, alerting rules, and monitoring infrastructure at scale.",
      color: "orange",
      status: "coming-soon",
    },
    {
      name: "Grafana",
      description: "Dashboards, data visualization, and observability across your entire stack.",
      color: "purple",
      status: "coming-soon",
    },
  ];

export const TRACK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  green: { bg: "bg-green-950/30", border: "border-green-900/50", text: "text-green-400" },
  purple: { bg: "bg-purple-950/30", border: "border-purple-900/50", text: "text-purple-400" },
  orange: { bg: "bg-orange-950/30", border: "border-orange-900/50", text: "text-orange-400" },
  red: { bg: "bg-red-950/30", border: "border-red-900/50", text: "text-red-400" },
  cyan: { bg: "bg-cyan-950/30", border: "border-cyan-900/50", text: "text-cyan-400" },
};
