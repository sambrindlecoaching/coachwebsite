import { createFileRoute } from "@tanstack/react-router";
import { AdminApp } from "@/components/admin/AdminApp";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin | Sam Brindle Coaching" },
      { name: "description", content: "Private dashboard." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin | Sam Brindle Coaching" },
      { property: "og:description", content: "Private dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminApp,
});
