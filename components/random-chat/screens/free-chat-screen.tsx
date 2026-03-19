"use client";

import { useCallback, useRef, useEffect } from "react";
import { RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/components/random-chat/app-provider";
import { usePolling } from "@/hooks/use-polling";
import { apiClient } from "@/lib/random-chat/api-client";
import { ChatMessageBubble } from "@/components/random-chat/shared/chat-message-bubble";
import { ChatInput } from "@/components/random-chat/shared/chat-input";
import { POLLING_INTERVAL_MS } from "@/lib/random-chat/constants";
import { Message } from "@/lib/random-chat/types";

export function FreeChatScreen() {
  const { state, dispatch } = useApp();
  const lastTimestampRef = useRef(0);
  const partnerInitial = state.partnerNickname?.charAt(3) || "?";

  const pollMessages = useCallback(async () => {
    if (!state.matchId || !state.sessionId) return;
    try {
      const res = await apiClient.getMessages(
        state.matchId,
        state.sessionId,
        lastTimestampRef.current
      );
      if (res.messages.length > 0) {
        const newMessages = res.messages.filter(
          (m: Message) => m.senderId !== state.sessionId
        );
        for (const msg of newMessages) {
          dispatch({ type: "ADD_MESSAGE", message: msg });
          if (msg.timestamp > lastTimestampRef.current) {
            lastTimestampRef.current = msg.timestamp;
          }
        }
      }
    } catch {
      // ignore
    }
  }, [state.matchId, state.sessionId, dispatch]);

  usePolling(pollMessages, POLLING_INTERVAL_MS, true);

  const handleSend = useCallback(
    async (text: string) => {
      if (!state.matchId || !state.sessionId) return;
      const tempId = crypto.randomUUID();
      const tempMsg: Message = {
        id: tempId,
        senderId: state.sessionId,
        text,
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_MESSAGE", message: tempMsg });

      try {
        await apiClient.sendMessage(state.matchId, state.sessionId, text);
      } catch {
        // message may still be stored
      }
    },
    [state.matchId, state.sessionId, dispatch]
  );

  const handleLeave = async () => {
    if (state.matchId && state.sessionId) {
      await apiClient.endChat(state.matchId, state.sessionId).catch(() => {});
    }
    dispatch({ type: "LEAVE_CHAT" });
  };

  const handleNext = async () => {
    if (state.matchId && state.sessionId) {
      await apiClient.endChat(state.matchId, state.sessionId).catch(() => {});
    }
    dispatch({ type: "NEXT_PARTNER" });
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  return (
    <>
      <div className="flex items-center gap-1 p-1">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs"
          onClick={handleNext}
          aria-label="다음 상대"
        >
          <RefreshCw className="w-3 h-3" />
          다음 상대
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-xs"
          onClick={handleLeave}
          aria-label="나가기"
        >
          <LogOut className="w-3 h-3" />
          나가기
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 flex flex-col gap-3 bg-muted/30 min-h-full">
          {state.messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === state.sessionId}
              partnerInitial={partnerInitial}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <ChatInput onSend={handleSend} />
    </>
  );
}
