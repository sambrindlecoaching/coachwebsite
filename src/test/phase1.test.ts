import { describe, expect, it } from "vitest";
import { PHASE2 } from "@/config/features";
import { site } from "@/config/site";
import { openDoors } from "@/content/doors";

describe("Phase 1 cut-down", () => {
  it("keeps the phase 2 flag off by default", () => expect(PHASE2).toBe(false));
  it("prices the programme at €400/month, €2,400 total", () => {
    expect(site.programme.pricePerMonth).toBe(400);
    expect(site.programme.totalPrice).toBe(2400);
  });
  it("prices the Wake Up Call at €129 for one 90-minute session", () => {
    expect(site.resetSession.price).toBe("€129");
    expect(site.resetSession.minutes).toBe(90);
  });
  it("only shows the divorce door", () => expect(openDoors.map((d) => d.key)).toEqual(["divorce"]));
});
