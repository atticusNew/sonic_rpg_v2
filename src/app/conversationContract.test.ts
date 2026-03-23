import { describe, expect, it } from "vitest";
import { deriveConversationContract } from "./conversationContract";
import type { DialogueSessionState } from "../types/game";

function session(state: Partial<DialogueSessionState>): DialogueSessionState {
  return {
    npcId: null,
    status: "idle",
    mode: "tone_reply",
    questionChoices: [],
    questionAttemptCount: 0,
    maxQuestionAttempts: 2,
    ...state
  };
}

describe("deriveConversationContract", () => {
  it("keeps response controls visible when session is awaiting player for present NPC", () => {
    const contract = deriveConversationContract({
      presentNpcs: ["frat_boys"],
      activeNpc: null,
      session: session({ npcId: "frat_boys", status: "awaiting_player" })
    });
    expect(contract.conversationNpcId).toBe("frat_boys");
    expect(contract.shouldShowResponseControls).toBe(true);
  });

  it("switches to new lead NPC when old session NPC rotated out", () => {
    const contract = deriveConversationContract({
      presentNpcs: ["sorority_girls"],
      activeNpc: "frat_boys",
      session: session({ npcId: "frat_boys", status: "awaiting_player" })
    });
    expect(contract.sessionIsUsable).toBe(false);
    expect(contract.conversationNpcId).toBe("sorority_girls");
    expect(contract.shouldShowResponseControls).toBe(false);
  });

  it("prefers session NPC over stale active NPC during swap", () => {
    const contract = deriveConversationContract({
      presentNpcs: ["sonic"],
      activeNpc: "frat_boys",
      session: session({ npcId: "sonic", status: "awaiting_player" })
    });
    expect(contract.conversationNpcId).toBe("sonic");
    expect(contract.shouldShowResponseControls).toBe(true);
  });
});

