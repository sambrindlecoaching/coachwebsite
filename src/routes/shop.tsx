import { createFileRoute, redirect } from "@tanstack/react-router";

/** The shop now lives on Work with me, in the "On your own" block. */
export const Route = createFileRoute("/shop")({
  beforeLoad: () => {
    throw redirect({ to: "/work-with-me", hash: "on-your-own", statusCode: 301 });
  },
});
