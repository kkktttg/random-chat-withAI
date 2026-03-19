export const kvKeys = {
  session: (sessionId: string) => `session:${sessionId}`,
  queue: (mode: string) => `queue:${mode}`,
  match: (matchId: string) => `match:${matchId}`,
  sessionMatch: (sessionId: string) => `session-match:${sessionId}`,
  messages: (matchId: string) => `messages:${matchId}`,
  aiFindState: (matchId: string, sessionId: string) =>
    `ai-find:${matchId}:${sessionId}`,
} as const;

export interface SessionData {
  sessionId: string;
  nickname: string;
  createdAt: number;
}

export interface QueueEntry {
  sessionId: string;
  nickname: string;
  joinedAt: number;
}

export interface MatchData {
  matchId: string;
  mode: "free" | "ai-find";
  participants: Array<{
    sessionId: string;
    nickname: string;
    isAi: boolean;
  }>;
  createdAt: number;
  partnerSwitchedAt?: number;
}

export interface AiFindState {
  partnerIsAi: boolean;
  turnsLeft: number;
}
