import { AppState, Action, Judgment, PartnerType } from "./types";
import { AI_FIND_TOTAL_TURNS } from "./constants";

export const initialState: AppState = {
  screen: "lobby",
  sessionId: "",
  myNickname: "",
  mode: null,
  matchId: null,
  partnerNickname: null,
  messages: [],
  remainingTurns: AI_FIND_TOTAL_TURNS,
  judgmentResult: null,
  isWaitingForAi: false,
};

export function getJudgmentResult(
  judgment: Judgment,
  actualPartner: PartnerType
) {
  const correct = judgment === actualPartner;
  let resultMessage: string;

  if (judgment === "ai" && actualPartner === "ai") {
    resultMessage = "정답! 상대는 AI였습니다";
  } else if (judgment === "ai" && actualPartner === "human") {
    resultMessage = "오답! 상대는 사람이었습니다";
  } else if (judgment === "human" && actualPartner === "human") {
    resultMessage = "정답! 상대는 사람이었습니다";
  } else {
    resultMessage = "오답! 상대는 AI였습니다";
  }

  return { judgment, actualPartner, correct, resultMessage };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "INIT_SESSION":
      return {
        ...state,
        sessionId: action.sessionId,
        myNickname: action.nickname,
      };

    case "START_MATCHING":
      return {
        ...state,
        screen: "matching",
        mode: action.mode,
        matchId: null,
        partnerNickname: null,
        messages: [],
        remainingTurns: AI_FIND_TOTAL_TURNS,
        judgmentResult: null,
        isWaitingForAi: false,
      };

    case "MATCH_FOUND":
      return {
        ...state,
        screen: state.mode === "free" ? "free-chat" : "ai-find-chat",
        matchId: action.matchId,
        partnerNickname: action.partnerNickname,
        messages: [],
      };

    case "ADD_MESSAGE":
      if (state.messages.some((m) => m.id === action.message.id)) {
        return state;
      }
      return { ...state, messages: [...state.messages, action.message] };

    case "SET_MESSAGES":
      return { ...state, messages: action.messages };

    case "DECREMENT_TURNS":
      return { ...state, remainingTurns: Math.max(0, state.remainingTurns - 1) };

    case "SET_WAITING_FOR_AI":
      return { ...state, isWaitingForAi: action.waiting };

    case "SUBMIT_JUDGMENT":
      return {
        ...state,
        screen: "ai-find-result",
        judgmentResult: getJudgmentResult(action.judgment, action.actualPartner),
      };

    case "LEAVE_CHAT":
      return {
        ...state,
        screen: "lobby",
        matchId: null,
        partnerNickname: null,
        messages: [],
        isWaitingForAi: false,
      };

    case "NEXT_PARTNER":
      return {
        ...state,
        screen: "matching",
        matchId: null,
        partnerNickname: null,
        messages: [],
        remainingTurns: AI_FIND_TOTAL_TURNS,
        isWaitingForAi: false,
      };

    case "RETRY_AI_FIND":
      return {
        ...state,
        screen: "matching",
        mode: "ai-find",
        matchId: null,
        partnerNickname: null,
        messages: [],
        remainingTurns: AI_FIND_TOTAL_TURNS,
        judgmentResult: null,
        isWaitingForAi: false,
      };

    case "GO_LOBBY":
      return {
        ...state,
        screen: "lobby",
        mode: null,
        matchId: null,
        partnerNickname: null,
        messages: [],
        judgmentResult: null,
        isWaitingForAi: false,
      };

    default:
      return state;
  }
}
