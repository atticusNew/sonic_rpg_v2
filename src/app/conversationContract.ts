import type { DialogueSessionState, NpcId } from "../types/game";

export function isGroupNpc(npcId: NpcId): boolean {
  return npcId === "frat_boys" || npcId === "sorority_girls";
}

export function npcBeVerb(npcId: NpcId): "is" | "are" {
  return isGroupNpc(npcId) ? "are" : "is";
}

type ConversationContractInput = {
  presentNpcs: NpcId[];
  activeNpc: NpcId | null;
  session?: DialogueSessionState;
};

export type ConversationContract = {
  leadNpcId: NpcId | null;
  sessionNpcId: NpcId | null;
  sessionIsUsable: boolean;
  conversationNpcId: NpcId | null;
  shouldShowResponseControls: boolean;
};

export function deriveConversationContract(input: ConversationContractInput): ConversationContract {
  const leadNpcId = input.presentNpcs[0] ?? null;
  const sessionNpcId = input.session?.npcId ?? null;
  const sessionStatus = input.session?.status ?? "idle";
  const sessionIsUsable = Boolean(
    sessionNpcId
    && sessionStatus !== "idle"
    && input.presentNpcs.includes(sessionNpcId)
  );
  const conversationNpcId = sessionIsUsable
    ? sessionNpcId
    : (input.activeNpc && input.presentNpcs.includes(input.activeNpc)
      ? input.activeNpc
      : leadNpcId);
  const shouldShowResponseControls = Boolean(
    sessionIsUsable
    && sessionStatus === "awaiting_player"
    && sessionNpcId
    && conversationNpcId === sessionNpcId
  );
  return {
    leadNpcId,
    sessionNpcId,
    sessionIsUsable,
    conversationNpcId,
    shouldShowResponseControls
  };
}

