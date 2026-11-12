import type { DoorKey } from "./doors";

/** Journal pieces. All three are demo drafts for Sam to rewrite or approve. */
export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "quote"; text: string }
  | { t: "margin"; text: string; p: string }
  | { t: "try"; questions: [string, string, string] }
  | { t: "listen" };

export type Article = {
  slug: string;
  door: DoorKey;
  title: string;
  standfirst: string;
  minutes: number;
  issue: string;
  draft: boolean;
  /** Voice note title to embed in "Listen to Sam read this". */
  listenTitle?: string;
  body: Block[];
};

export const articles: Article[] = [
  {
    slug: "the-sunday-the-kids-go-back",
    door: "divorce",
    title: "The Sunday the kids go back",
    standfirst: "Six o'clock, the car pulls away, and the house goes very quiet. A few honest thoughts on the worst hour of the week, and what to do with it.",
    minutes: 6,
    issue: "Issue 01",
    draft: true,
    listenTitle: "The kids just left for the weekend",
    body: [
      { t: "p", text: "The first time it happened, I cleaned the oven. Not because it needed it, though it did. Because the alternative was sitting in a kitchen that still had four small coats on the hooks and nobody to wear them." },
      { t: "p", text: "If you share care, you'll know the hour I mean. The bags are packed, someone has lost a shoe, there's a hug at the door that goes on slightly too long, and then the car is gone. The silence that follows has a weight to it." },
      { t: "margin", text: "Busy is a very respectable way of not feeling things.", p: "Most of us fill that hour. We tidy, scroll, open the wine a bit early, make plans we don't want. It works, sort of. Until it doesn't." },
      { t: "quote", text: "The quiet isn't the problem. The story you tell in it is." },
      { t: "h", text: "What's actually happening" },
      { t: "p", text: "Fact: the children are with their other parent for two nights. Story: they don't need me, I've failed them, this is what the rest of my life looks like. Notice how quickly one turns into the other. That's not you being dramatic. That's a tired brain trying to make sense of a loss." },
      { t: "p", text: "You don't have to argue with the story. You just have to spot it. \"There's the one about failing them again.\" Naming it takes some of the air out of it." },
      { t: "try", questions: ["What do you usually do in the first hour after they leave?", "What's the story that turns up in that hour?", "What would a kind, ordinary Sunday evening look like for you?"] },
      { t: "h", text: "Something small to try" },
      { t: "p", text: "Plan the first hour, not the whole weekend. A walk you like. A phone call to someone who doesn't need the update. Something to eat that isn't the children's leftovers. Small, specific, yours." },
      { t: "listen" },
      { t: "p", text: "It won't fix it. It will make it an hour you chose, instead of one that happened to you. Do that for a few Sundays and the quiet starts to feel less like an empty house and more like your house." },
    ],
  },
  {
    slug: "fact-or-story-divorce",
    door: "divorce",
    title: "Fact or story: the two sentences that run your divorce",
    standfirst: "There's what happened, and there's what you've decided it means. Learning to tell them apart is the most useful thing I know.",
    minutes: 7,
    issue: "Issue 01",
    draft: true,
    listenTitle: "A message from your ex just landed",
    body: [
      { t: "p", text: "Here are two sentences. \"The marriage ended.\" \"I've ruined my children's lives.\" One is a fact. The other feels exactly like one, especially at 2am, and isn't." },
      { t: "p", text: "Most of the pain in a separation doesn't come from the facts. The facts are usually hard but survivable. It comes from the second sentence, the one we say so often it starts to sound like the news." },
      { t: "quote", text: "The fact is usually survivable. The story usually isn't." },
      { t: "margin", text: "This is the O in LOVE: Own your reality.", p: "Owning your reality isn't the same as liking it. It means you stop spending energy fighting what's already happened, and keep that energy for what happens next." },
      { t: "h", text: "How to tell the difference" },
      { t: "p", text: "A fact would stand up in court. Someone else could see it, film it, write it down. A story has adjectives and forecasts in it: always, never, ruined, everyone, forever. If it predicts the future, it's almost certainly a story." },
      { t: "try", questions: ["Write down the sentence that's been loudest this week.", "Which part of it would a stranger agree is simply true?", "What's the story bolted on to that fact?"] },
      { t: "p", text: "You don't need to replace the story with a cheerful one. \"Everything happens for a reason\" is also a story, and a fairly annoying one. Just put the fact back on its own. See how it sits." },
      { t: "listen" },
      { t: "p", text: "Then ask a better question: given the fact, what's one thing I can do this week? That's where the work is. Not in the story. In the Tuesday." },
    ],
  },
  {
    slug: "the-monday-with-nowhere-to-be",
    door: "reinvention",
    title: "The Monday with nowhere to be",
    standfirst: "You wake at the usual time, out of habit. Then you remember. Notes on the first weekday after the job ends.",
    minutes: 6,
    issue: "Issue 01",
    draft: true,
    listenTitle: "The Monday with nowhere to be",
    body: [
      { t: "p", text: "The alarm goes off because you forgot to turn it off. Or it doesn't, and you wake anyway, at 6.45, ready to go somewhere you no longer go. That moment, half awake, before you remember, is a strange little gift. Then you remember." },
      { t: "p", text: "Losing a job is a loss, even when it was a rubbish job. It takes your routine, your colleagues, a large slice of your identity and, quite often, your sense that you know what you're doing. That's a lot for a Monday." },
      { t: "quote", text: "You lost a job. You didn't lose the person who was good at it." },
      { t: "margin", text: "Shame loves a quiet house.", p: "The hardest bit for many people isn't the money. It's telling people. Saying it out loud at the school gate. Watching someone's face do the sympathetic thing." },
      { t: "h", text: "Fact, then story" },
      { t: "p", text: "Fact: the role ended on a Friday. Story: I'm unemployable, nobody hires at my age, I should have seen it coming. Same trick as always. Spot the story. Put the fact back on its own." },
      { t: "try", questions: ["What did the job give you, apart from money?", "Which of those can you get somewhere else this week?", "What would a good, ordinary Monday look like for now?"] },
      { t: "listen" },
      { t: "p", text: "Give the first few Mondays a shape. Get up, get dressed, get outside before ten. One useful task, one kind one. You're not on holiday and you're not in crisis. You're in between. That's allowed." },
    ],
  },
];

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);
