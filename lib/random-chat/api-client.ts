import {
  SessionResponse,
  MatchJoinResponse,
  MatchStatusResponse,
  SendMessageResponse,
  MessagesResponse,
  JudgeResponse,
  ChatMode,
  Judgment,
} from "./types";

async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export const apiClient = {
  createSession(): Promise<SessionResponse> {
    return fetchJson("/api/session", { method: "POST" });
  },

  joinMatch(sessionId: string, nickname: string, mode: ChatMode): Promise<MatchJoinResponse> {
    return fetchJson("/api/match/join", {
      method: "POST",
      body: JSON.stringify({ sessionId, nickname, mode }),
    });
  },

  getMatchStatus(
    sessionId: string,
    mode: ChatMode
  ): Promise<MatchStatusResponse> {
    return fetchJson(
      `/api/match/status?sessionId=${sessionId}&mode=${mode}`
    );
  },

  sendMessage(
    matchId: string,
    sessionId: string,
    text: string
  ): Promise<SendMessageResponse> {
    return fetchJson("/api/chat/send", {
      method: "POST",
      body: JSON.stringify({ matchId, sessionId, text }),
    });
  },

  getMessages(
    matchId: string,
    sessionId: string,
    after?: number
  ): Promise<MessagesResponse> {
    const params = new URLSearchParams({
      matchId,
      sessionId,
      ...(after !== undefined ? { after: String(after) } : {}),
    });
    return fetchJson(`/api/chat/messages?${params}`);
  },

  endChat(matchId: string, sessionId: string): Promise<void> {
    return fetchJson("/api/chat/end", {
      method: "POST",
      body: JSON.stringify({ matchId, sessionId }),
    });
  },

  judge(
    matchId: string,
    sessionId: string,
    judgment: Judgment
  ): Promise<JudgeResponse> {
    return fetchJson("/api/ai-find/judge", {
      method: "POST",
      body: JSON.stringify({ matchId, sessionId, judgment }),
    });
  },
};
