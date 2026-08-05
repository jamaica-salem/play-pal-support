import { createFileRoute } from "@tanstack/react-router";
import { AgentDashboard } from "@/components/support/AgentDashboard";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Agent Dashboard — GameVault Support" },
      {
        name: "description",
        content:
          "Support console for escalated GameVault conversations, with AI summaries, live status and agent replies.",
      },
      { property: "og:title", content: "Agent Dashboard — GameVault Support" },
      {
        property: "og:description",
        content: "Manage escalated AI conversations with full customer context.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgentDashboard,
});
