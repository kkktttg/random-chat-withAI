"use client";

import { useEffect } from "react";
import { Loader, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/components/random-chat/app-provider";
import { usePolling } from "@/hooks/use-polling";
import { apiClient } from "@/lib/random-chat/api-client";
import { POLLING_INTERVAL_MS } from "@/lib/random-chat/constants";

export function MatchingScreen() {
  const { state, dispatch } = useApp();
  const isAiFind = state.mode === "ai-find";

  const pollMatch = async () => {
    if (!state.sessionId || !state.mode) return;
    try {
      const result = await apiClient.getMatchStatus(
        state.sessionId,
        state.mode
      );
      if (result.status === "matched" && result.matchId && result.partnerNickname) {
        dispatch({
          type: "MATCH_FOUND",
          matchId: result.matchId,
          partnerNickname: result.partnerNickname,
        });
      }
    } catch {
      // ignore errors, keep polling
    }
  };

  usePolling(pollMatch, POLLING_INTERVAL_MS, true);

  // Join the queue when mounting
  useEffect(() => {
    if (!state.sessionId || !state.myNickname || !state.mode) return;
    apiClient.joinMatch(state.sessionId, state.myNickname, state.mode).catch(() => {});
  }, [state.sessionId, state.myNickname, state.mode]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[240px]">
      <Loader className="w-8 h-8 text-muted-foreground animate-spin" />
      <p className="text-sm font-bold">상대를 찾고 있습니다...</p>
      <p className="text-xs text-center text-muted-foreground">
        {isAiFind
          ? "30초마다 대기자끼리 매칭됩니다\n짝이 없으면 AI와 연결됩니다"
          : "대기자가 있으면 바로 매칭됩니다\n없으면 잠시 후 AI와 연결됩니다"}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 gap-1"
        onClick={() => dispatch({ type: "GO_LOBBY" })}
        aria-label="돌아가기"
      >
        <ChevronLeft className="w-4 h-4" />
        돌아가기
      </Button>
    </div>
  );
}
