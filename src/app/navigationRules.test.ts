import { describe, expect, it } from "vitest";
import { createInitialState } from "../core/state/initialState";
import { blockedLocationMessage, isLocationBlocked } from "./navigationRules";

describe("navigation rules", () => {
  it("blocks frat move when frat ban is active", () => {
    const state = createInitialState("nav-rules-banned-seed");
    state.world.restrictions.fratBanned = true;
    expect(isLocationBlocked(state, "frat")).toBe(true);
    expect(isLocationBlocked(state, "quad")).toBe(false);
  });

  it("returns contextual block message for frat", () => {
    expect(blockedLocationMessage("frat")).toContain("banned");
  });
});
