export type Screen =
  | "lobby"
  | "matching"
  | "free-chat"
  | "ai-find-chat"
  | "ai-find-result";

export type ChatMode = "free" | "ai-find";
export type PartnerType = "human" | "ai";
export type Judgment = "ai" | "human";

export interface Message {
  id: string;
  senderId: string; // 'me' or partner's sessionId
  text: string;
  timestamp: number;
}

export interface JudgmentResult {
  judgment: Judgment;
  actualPartner: PartnerType;
  correct: boolean;
  resultMessage: string;
}

export interface AppState {
  screen: Screen;
  sessionId: string;
  myNickname: string;
  mode: ChatMode | null;
  matchId: string | null;
  partnerNickname: string | null;
  messages: Message[];
  remainingTurns: number;
  judgmentResult: JudgmentResult | null;
  isWaitingForAi: boolean;
}

export type Action =
  | { type: "INIT_SESSION"; sessionId: string; nickname: string }
  | { type: "START_MATCHING"; mode: ChatMode }
  | { type: "MATCH_FOUND"; matchId: string; partnerNickname: string }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "SET_MESSAGES"; messages: Message[] }
  | { type: "DECREMENT_TURNS" }
  | { type: "SET_WAITING_FOR_AI"; waiting: boolean }
  | { type: "SUBMIT_JUDGMENT"; judgment: Judgment; actualPartner: PartnerType }
  | { type: "LEAVE_CHAT" }
  | { type: "NEXT_PARTNER" }
  | { type: "RETRY_AI_FIND" }
  | { type: "GO_LOBBY" };

// API response types
export interface SessionResponse {
  sessionId: string;
  nickname: string;
}

export interface MatchJoinResponse {
  queued: boolean;
}

export interface MatchStatusResponse {
  status: "waiting" | "matched";
  matchId?: string;
  partnerNickname?: string;
}

export interface SendMessageResponse {
  messageId: string;
}

export interface MessagesResponse {
  messages: Message[];
}

export interface JudgeResponse {
  actualPartner: PartnerType;
  correct: boolean;
  resultMessage: string;
}
