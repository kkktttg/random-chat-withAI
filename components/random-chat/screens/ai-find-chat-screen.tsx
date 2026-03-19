"use client";

import { useCallback, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/components/random-chat/app-provider";
import { usePolling } from "@/hooks/use-polling";
import { apiClient } from "@/lib/random-chat/api-client";
import { ChatMessageBubble, TypingIndicator } from "@/components/random-chat/shared/chat-message-bubble";
import { ChatInput } from "@/components/random-chat/shared/chat-input";
import { TurnCounter } from "@/components/random-chat/shared/turn-counter";
import { JudgeButtons } from "@/components/random-chat/shared/judge-buttons";
import { POLLING_INTERVAL_MS } from "@/lib/random-chat/constants";
import { Judgment, Message } from "@/lib/random-chat/types";

export function AiFindChatScreen() {
  const { state, dispatch } = useApp();
  const lastTimestampRef = useRef(0);
  const forcedJudgment = state.remainingTurns === 0;
  const inputDisabled = forcedJudgment || state.isWaitingForAi;

  const pollMessages = useCallback(async () => {
    if (!state.matchId || !state.sessionId) return;
    try {
      const res = await apiClient.getMessages(
        state.matchId,
        state.sessionId,
        lastTimestampRef.current
      );
      const newMessages = res.messages.filter(
        (m: Message) => m.senderId !== state.sessionId &&
          m.timestamp > lastTimestampRef.current
      );
      for (const msg of newMessages) {
        dispatch({ type: "ADD_MESSAGE", message: msg });
        if (msg.timestamp > lastTimestampRef.current) {
          lastTimestampRef.current = msg.timestamp;
        }
        dispatch({ type: "DECREMENT_TURNS" });
        dispatch({ type: "SET_WAITING_FOR_AI", waiting: false });
      }
    } catch {
      // ignore
    }
  }, [state.matchId, state.sessionId, dispatch]);

  usePolling(pollMessages, POLLING_INTERVAL_MS, !forcedJudgment);

  const handleSend = useCallback(
    async (text: string) => {
      if (!state.matchId || !state.sessionId || inputDisabled) return;
      const tempId = crypto.randomUUID();
      const tempMsg: Message = {
        id: tempId,
        senderId: state.sessionId,
        text,
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_MESSAGE", message: tempMsg });
      dispatch({ type: "SET_WAITING_FOR_AI", waiting: true });

      try {
        await apiClient.sendMessage(state.matchId, state.sessionId, text);
      } catch {
        // ignore
      }
    },
    [state.matchId, state.sessionId, inputDisabled, dispatch]
  );

  const handleJudge = useCallback(
    async (judgment: Judgment) => {
      if (!state.matchId || !state.sessionId) return;
      try {
        const result = await apiClient.judge(
          state.matchId,
          state.sessionId,
          judgment
        );
        dispatch({
          type: "SUBMIT_JUDGMENT",
          judgment,
          actualPartner: result.actualPartner,
        });
      } catch {
        dispatch({
          type: "SUBMIT_JUDGMENT",
          judgment,
          actualPartner: "ai",
        });
      }
    },
    [state.matchId, state.sessionId, dispatch]
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, state.isWaitingForAi]);

  return (
    <>
      <div className="px-4 py-2 flex items-center justify-between border-b bg-muted/50">
        <TurnCounter remaining={state.remainingTurns} />
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 flex flex-col gap-3 bg-muted/30 min-h-full">
          {state.messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === state.sessionId}
              partnerInitial="?"
            />
          ))}
          {state.isWaitingForAi && <TypingIndicator initial="?" />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {!forcedJudgment && (
        <JudgeButtons onJudge={handleJudge} />
      )}

      {forcedJudgment ? (
        <JudgeButtons onJudge={handleJudge} forced />
      ) : (
        <ChatInput
          onSend={handleSend}
          disabled={inputDisabled}
          placeholder="메시지 입력..."
        />
      )}
    </>
  );
}
