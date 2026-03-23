import { memo, useState } from "react";
import type { LocationId, NpcId } from "../../types/game";
import type { DialogueTone } from "../../dialogue/types";

type Props = {
  locationId: LocationId;
  sceneBackgroundImage: string;
  shouldShowDialoguePopup: boolean;
  scenePopupPlacement: "upper" | "lower";
  scenePopupTextPosition: "above" | "below";
  popupCharacterImage: string;
  popupDisplaySpeaker: string;
  popupDialogueText: string;
  popupTyping: boolean;
  engagedNpc: NpcId | null;
  isAwaitingNpcReply: boolean;
  isResolved: boolean;
  replyPanelLabel: string;
  isQuestionMode: boolean;
  canSubmitReplies: boolean;
  interactionHint?: string;
  dialogueQuickReplies: Array<{ id: DialogueTone; tone: string; text: string }>;
  onSubmitQuickReply: (text: string, tone: DialogueTone) => Promise<void>;
};

function ScenePanelComponent(props: Props) {
  const {
    locationId,
    sceneBackgroundImage,
    shouldShowDialoguePopup,
    scenePopupPlacement,
    scenePopupTextPosition,
    popupCharacterImage,
    popupDisplaySpeaker,
    popupDialogueText,
    popupTyping,
    engagedNpc,
    isAwaitingNpcReply,
    isResolved,
    replyPanelLabel,
    isQuestionMode,
    canSubmitReplies,
    interactionHint,
    dialogueQuickReplies,
    onSubmitQuickReply
  } = props;
  const [toneSelection, setToneSelection] = useState<{ npcId: NpcId | null; tone: DialogueTone | null }>({
    npcId: null,
    tone: null
  });
  const selectedTone = engagedNpc && toneSelection.npcId === engagedNpc
    && dialogueQuickReplies.some((reply) => reply.id === toneSelection.tone)
    ? toneSelection.tone
    : null;

  return (
    <section className={`scene scene-${locationId}`}>
      <div
        className="scene-bg-image-layer scene-bg-image-active"
        style={{ backgroundImage: `url("${sceneBackgroundImage}")` }}
      />
      {shouldShowDialoguePopup && (
        <div className={`scene-character-stage scene-character-stage-${scenePopupPlacement}`} aria-live="polite">
          <div className="scene-character-stage-dim" />
          <article className={`scene-character-stage-card scene-character-stage-text-${scenePopupTextPosition}`}>
            <div className="scene-character-stage-portrait-wrap">
              {popupCharacterImage ? (
                <img
                  src={popupCharacterImage}
                  alt={`${popupDisplaySpeaker} portrait`}
                  className={`scene-character-stage-portrait ${engagedNpc === "thunderhead" ? "scene-character-stage-portrait-thunderhead" : ""}`}
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                />
              ) : (
                <div className="scene-character-stage-portrait scene-character-stage-portrait-fallback" aria-hidden="true">
                  <span>{popupDisplaySpeaker ? popupDisplaySpeaker.charAt(0).toUpperCase() : "?"}</span>
                </div>
              )}
            </div>
            <div className="scene-character-stage-text-wrap">
              <p className="bubble bubble-npc scene-character-stage-text">
                <strong>
                  {popupDisplaySpeaker}
                  {popupTyping && <span className="typing-wave" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>}
                </strong>
                {!popupTyping && popupDisplaySpeaker ? ":" : ""}{" "}
                {popupDialogueText}
              </p>
            </div>
          </article>
        </div>
      )}

      <div className="scene-footer">
        {engagedNpc && (
          <div className={`dialogue-choice-panel ${isQuestionMode ? "answer-mode" : ""}`}>
            <div className="dialogue-choice-header">
              <p className="dialogue-choice-label">{replyPanelLabel}</p>
              <p className={`dialogue-tone-current ${selectedTone ? "is-selected" : "is-empty"}`}>
                {isQuestionMode
                  ? (selectedTone ? "Current • Selected" : "Current • Unselected")
                  : (selectedTone
                    ? `Current • ${dialogueQuickReplies.find((reply) => reply.id === selectedTone)?.tone ?? "Selected"}`
                    : "Current • Unselected")}
              </p>
            </div>
            {dialogueQuickReplies.length > 0 && (
              <div className={`quick-reply-row ${isQuestionMode ? "quick-reply-row-answer" : ""}`} aria-label={isQuestionMode ? "Dialogue answer choices" : "Dialogue tone choices"}>
                {dialogueQuickReplies.map((reply) => (
                  <button
                    key={reply.id}
                    className={`quick-reply-btn quick-reply-btn-${reply.id} ${isQuestionMode ? "quick-reply-btn-answer" : ""} ${selectedTone === reply.id ? "quick-reply-btn-active" : ""}`}
                    title={reply.text}
                    aria-pressed={selectedTone === reply.id}
                    disabled={!canSubmitReplies || isAwaitingNpcReply || isResolved}
                    onClick={async () => {
                      setToneSelection({ npcId: engagedNpc, tone: reply.id });
                      await onSubmitQuickReply(reply.text, reply.id);
                    }}
                  >
                    {reply.tone}
                  </button>
                ))}
              </div>
            )}
            {interactionHint && (
              <p className="hint-inline">{interactionHint}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export const ScenePanel = memo(ScenePanelComponent);
