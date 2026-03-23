import { describe, expect, it } from "vitest";
import { createInitialState } from "../core/state/initialState";
import { NPCPresenceSystem } from "./NPCPresenceSystem";

describe("NPC presence pacing", () => {
  it("keeps Dean anchored during onboarding intake", () => {
    const state = createInitialState("presence-onboarding-seed");
    const system = new NPCPresenceSystem();
    for (let remainingSec = 900; remainingSec >= 300; remainingSec -= 30) {
      state.timer.remainingSec = remainingSec;
      const presence = system.resolve(state);
      expect(presence.dean_office.includes("dean_cain")).toBe(true);
    }
  });

  it("opens search windows after mission starts", () => {
    const state = createInitialState("presence-hunt-seed");
    const system = new NPCPresenceSystem();
    state.dialogue.deanStage = "mission_given";
    state.phase = "hunt";
    state.player.inventory.push("Student ID");

    let deanOfficeClearCount = 0;
    let sororityClearCount = 0;
    let fratClearCount = 0;
    for (let remainingSec = 900; remainingSec >= 240; remainingSec -= 20) {
      state.timer.remainingSec = remainingSec;
      const presence = system.resolve(state);
      if (!presence.dean_office.includes("dean_cain")) deanOfficeClearCount += 1;
      if (!presence.sorority.includes("sorority_girls")) sororityClearCount += 1;
      if (!presence.frat.includes("frat_boys")) fratClearCount += 1;
    }

    expect(deanOfficeClearCount).toBeGreaterThan(0);
    expect(sororityClearCount).toBeGreaterThan(0);
    expect(fratClearCount).toBeGreaterThan(0);
  });

  it("enforces one NPC per location when one-scene mode is enabled", () => {
    const state = createInitialState("presence-one-npc-seed");
    const system = new NPCPresenceSystem();
    state.dialogue.deanStage = "mission_given";
    state.phase = "hunt";
    state.player.inventory.push("Student ID");
    state.world.settings.oneNpcPerScene = true;
    state.timer.remainingSec = 540;

    const presence = system.resolve(state);
    const occupancy = Object.values(presence);
    expect(occupancy.every((slot) => slot.length <= 1)).toBe(true);
  });

  it("does not force-following Sonic to occupy every location", () => {
    const state = createInitialState("presence-following-sonic-seed");
    const system = new NPCPresenceSystem();
    state.dialogue.deanStage = "mission_given";
    state.phase = "escort";
    state.player.inventory.push("Student ID");
    state.player.location = "dorms";
    state.sonic.following = true;
    state.sonic.location = "dorms";
    state.world.settings.oneNpcPerScene = true;
    state.timer.remainingSec = 420;

    const presence = system.resolve(state);
    expect(presence.dorms.includes("sonic")).toBe(false);
    expect(presence.stadium.includes("sonic")).toBe(false);
  });
});
