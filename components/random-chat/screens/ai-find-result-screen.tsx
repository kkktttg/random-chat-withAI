"use client";

import { useApp } from "@/components/random-chat/app-provider";
import { ResultCard } from "@/components/random-chat/shared/result-card";
import { apiClient } from "@/lib/random-chat/api-client";

export function AiFindResultScreen() {
  const { state, dispatch } = useApp();

  if (!state.judgmentResult) return null;

  const handleRetry = async () => {
    if (state.matchId && state.sessionId) {
      await apiClient.endChat(state.matchId, state.sessionId).catch(() => {});
    }
    dispatch({ type: "RETRY_AI_FIND" });
  };

  const handleGoLobby = async () => {
    if (state.matchId && state.sessionId) {
      await apiClient.endChat(state.matchId, state.sessionId).catch(() => {});
    }
    dispatch({ type: "GO_LOBBY" });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="px-4 py-3 border-b bg-muted/50">
        <span className="text-sm font-bold">AI찾기 결과</span>
      </div>
      <ResultCard
        result={state.judgmentResult}
        onRetry={handleRetry}
        onGoLobby={handleGoLobby}
      />
    </div>
  );
}
