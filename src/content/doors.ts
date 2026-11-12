import { PHASE2 } from "@/config/features";
/**
 * The "doors": life events the LOVE method is applied to.
 * Add a new door here (and a route) when Sam opens one. Copy marked
 * [to approve] or in [square brackets] is unconfirmed.
 */
export type DoorKey = "divorce" | "reinvention" | "abroad" | "midlife";

export type Situation = {
  id: string;
  label: string;
  reassurance: string;
  /** Voice note stages to prefer, in order. */
  stages: string[];
  articleSlug: string;
  next: { label: string; to: "/voice-notes" | "/book" | "/work-with-me" };
};

export type Door = {
  key: DoorKey;
  name: string;
  path?: "/divorce" | "/reinvention";
  status: "open" | "soon";
  card: string;
  situations: Situation[];
};

export const doors: Record<DoorKey, Door> = {
  divorce: {
    key: "divorce",
    name: "Divorce and separation",
    path: "/divorce",
    status: "open",
    card: "For parents leaving, being left, or somewhere in the messy middle.",
    situations: [
      {
        id: "thinking",
        label: "Thinking of leaving",
        reassurance:
          "Thinking about it isn't the same as doing it, and you don't have to decide tonight. What helps now is getting clear on what's actually true, so the decision is yours and not your fear's.",
        stages: ["L", "O"],
        articleSlug: "fact-or-story-divorce",
        next: { label: "Book a free call", to: "/book" },
      },
      {
        id: "middle",
        label: "In the middle of it",
        reassurance:
          "This is the loud bit. Handovers, messages, lawyers, the kids asking questions you can't answer yet. You don't need to be calm all the time. You need a few minutes of calm, more often.",
        stages: ["E", "O"],
        articleSlug: "the-sunday-the-kids-go-back",
        next: { label: "Listen to a voice note", to: "/voice-notes" },
      },
      {
        id: "done",
        label: "It's done. Now what?",
        reassurance:
          "The paperwork is finished and, oddly, that's when it often hits. The quiet is louder than the arguing was. This is where you get to decide what your life looks like now, on purpose.",
        stages: ["V", "E"],
        articleSlug: "the-sunday-the-kids-go-back",
        next: { label: "See LOVE RE-Coded", to: "/work-with-me" },
      },
    ],
  },
  reinvention: {
    key: "reinvention",
    name: "Job loss and starting again",
    path: "/reinvention",
    status: "open",
    card: "For when the job went, the title went with it, and Monday has nowhere to be.",
    situations: [
      {
        id: "just-happened",
        label: "It's just happened",
        reassurance:
          "You've had a shock, even if you saw it coming. Your brain will try to solve everything by Friday. It doesn't need to. This week, you just need to sleep, eat and not make any big decisions.",
        stages: ["L", "E"],
        articleSlug: "the-monday-with-nowhere-to-be",
        next: { label: "Listen to a voice note", to: "/voice-notes" },
      },
      {
        id: "limbo",
        label: "I'm in limbo",
        reassurance:
          "Applications out, nothing back, every day a bit longer than the last. Limbo is tiring because there's nothing to push against. The work here is separating what's happening from what you're telling yourself it means.",
        stages: ["O", "L"],
        articleSlug: "the-monday-with-nowhere-to-be",
        next: { label: "Book a free call", to: "/book" },
      },
      {
        id: "ready",
        label: "Ready to build",
        reassurance:
          "Good. Now the useful question isn't \"what job can I get?\" but \"what do I actually want my weeks to look like?\" Start there and the job question gets easier.",
        stages: ["V", "E"],
        articleSlug: "the-monday-with-nowhere-to-be",
        next: { label: "See how coaching works", to: "/work-with-me" },
      },
    ],
  },
  abroad: {
    key: "abroad",
    name: "Life abroad",
    status: "soon",
    card: "For the ones who moved for love, work or sunshine, and now feel a long way from home.",
    situations: [],
  },
  midlife: {
    key: "midlife",
    name: "Midlife",
    status: "soon",
    card: "For when nothing's technically wrong, and yet. [to approve]",
    situations: [],
  },
};

export const doorList = Object.values(doors);
export const openDoors = doorList.filter((d) => d.status === "open" && (PHASE2 || d.key === "divorce"));
