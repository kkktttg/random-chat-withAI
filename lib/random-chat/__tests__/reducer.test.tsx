import { describe, it, expect } from "vitest";
import { reducer, initialState, getJudgmentResult } from "@/lib/random-chat/reducer";
import { AI_FIND_TOTAL_TURNS } from "@/lib/random-chat/constants";

describe("reducer: INIT_SESSION", () => {
  it("sets sessionId and nickname", () => {
    const state = reducer(initialState, {
      type: "INIT_SESSION",
      sessionId: "s1",
      nickname: "익명의고양이1",
    });
    expect(state.sessionId).toBe("s1");
    expect(state.myNickname).toBe("익명의고양이1");
  });
});

describe("reducer: START_MATCHING", () => {
  it("transitions to matching screen with free mode", () => {
    const state = reducer(initialState, { type: "START_MATCHING", mode: "free" });
    expect(state.screen).toBe("matching");
    expect(state.mode).toBe("free");
    expect(state.messages).toEqual([]);
  });

  it("transitions to matching screen with ai-find mode", () => {
    const state = reducer(initialState, { type: "START_MATCHING", mode: "ai-find" });
    expect(state.screen).toBe("matching");
    expect(state.mode).toBe("ai-find");
  });

  it("clears messages on start", () => {
    const stateWithMessages = {
      ...initialState,
      messages: [{ id: "m1", senderId: "s1", text: "hi", timestamp: 1 }],
    };
    const state = reducer(stateWithMessages, { type: "START_MATCHING", mode: "free" });
    expect(state.messages).toEqual([]);
  });
});

describe("reducer: MATCH_FOUND", () => {
  it("transitions to free-chat when mode is free", () => {
    const matching = { ...initialState, screen: "matching" as const, mode: "free" as const };
    const state = reducer(matching, {
      type: "MATCH_FOUND",
      matchId: "match1",
      partnerNickname: "익명의토끼77",
    });
    expect(state.screen).toBe("free-chat");
    expect(state.matchId).toBe("match1");
    expect(state.partnerNickname).toBe("익명의토끼77");
  });

  it("transitions to ai-find-chat when mode is ai-find", () => {
    const matching = { ...initialState, screen: "matching" as const, mode: "ai-find" as const };
    const state = reducer(matching, {
      type: "MATCH_FOUND",
      matchId: "match1",
      partnerNickname: "익명의판다15",
    });
    expect(state.screen).toBe("ai-find-chat");
  });

  it("clears messages on match found", () => {
    const stateWithMessages = {
      ...initialState,
      screen: "matching" as const,
      mode: "free" as const,
      messages: [{ id: "m1", senderId: "s1", text: "hi", timestamp: 1 }],
    };
    const state = reducer(stateWithMessages, {
      type: "MATCH_FOUND",
      matchId: "match1",
      partnerNickname: "partner",
    });
    expect(state.messages).toEqual([]);
  });
});

describe("reducer: ADD_MESSAGE", () => {
  it("adds a new message", () => {
    const msg = { id: "m1", senderId: "s1", text: "hello", timestamp: 1 };
    const state = reducer(initialState, { type: "ADD_MESSAGE", message: msg });
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]).toEqual(msg);
  });

  it("ignores duplicate message IDs", () => {
    const msg = { id: "m1", senderId: "s1", text: "hello", timestamp: 1 };
    const stateWithMsg = { ...initialState, messages: [msg] };
    const state = reducer(stateWithMsg, { type: "ADD_MESSAGE", message: msg });
    expect(state.messages).toHaveLength(1);
  });
});

describe("reducer: DECREMENT_TURNS", () => {
  it("decrements remainingTurns by 1", () => {
    const state = { ...initialState, remainingTurns: 5 };
    const next = reducer(state, { type: "DECREMENT_TURNS" });
    expect(next.remainingTurns).toBe(4);
  });

  it("does not go below 0", () => {
    const state = { ...initialState, remainingTurns: 0 };
    const next = reducer(state, { type: "DECREMENT_TURNS" });
    expect(next.remainingTurns).toBe(0);
  });
});

describe("reducer: SUBMIT_JUDGMENT", () => {
  it("transitions to ai-find-result", () => {
    const state = reducer(initialState, {
      type: "SUBMIT_JUDGMENT",
      judgment: "ai",
      actualPartner: "ai",
    });
    expect(state.screen).toBe("ai-find-result");
    expect(state.judgmentResult?.resultMessage).toBe("정답! 상대는 AI였습니다");
  });
});

describe("reducer: LEAVE_CHAT", () => {
  it("transitions to lobby and clears chat state", () => {
    const chatState = {
      ...initialState,
      screen: "free-chat" as const,
      matchId: "match1",
      partnerNickname: "partner",
      messages: [{ id: "m1", senderId: "s1", text: "hi", timestamp: 1 }],
    };
    const state = reducer(chatState, { type: "LEAVE_CHAT" });
    expect(state.screen).toBe("lobby");
    expect(state.matchId).toBeNull();
    expect(state.partnerNickname).toBeNull();
    expect(state.messages).toEqual([]);
  });
});

describe("reducer: NEXT_PARTNER", () => {
  it("transitions to matching and clears messages", () => {
    const chatState = {
      ...initialState,
      screen: "free-chat" as const,
      messages: [{ id: "m1", senderId: "s1", text: "hi", timestamp: 1 }],
    };
    const state = reducer(chatState, { type: "NEXT_PARTNER" });
    expect(state.screen).toBe("matching");
    expect(state.messages).toEqual([]);
  });
});

describe("reducer: RETRY_AI_FIND", () => {
  it("transitions to matching with ai-find mode", () => {
    const resultState = {
      ...initialState,
      screen: "ai-find-result" as const,
      mode: "ai-find" as const,
    };
    const state = reducer(resultState, { type: "RETRY_AI_FIND" });
    expect(state.screen).toBe("matching");
    expect(state.mode).toBe("ai-find");
    expect(state.judgmentResult).toBeNull();
  });
});

describe("reducer: GO_LOBBY", () => {
  it("transitions to lobby and clears all state", () => {
    const resultState = {
      ...initialState,
      screen: "ai-find-result" as const,
      mode: "ai-find" as const,
      matchId: "match1",
    };
    const state = reducer(resultState, { type: "GO_LOBBY" });
    expect(state.screen).toBe("lobby");
    expect(state.mode).toBeNull();
    expect(state.matchId).toBeNull();
  });
});

describe("getJudgmentResult", () => {
  it("returns correct result for ai→ai", () => {
    const r = getJudgmentResult("ai", "ai");
    expect(r.correct).toBe(true);
    expect(r.resultMessage).toBe("정답! 상대는 AI였습니다");
  });

  it("returns wrong result for ai→human", () => {
    const r = getJudgmentResult("ai", "human");
    expect(r.correct).toBe(false);
    expect(r.resultMessage).toBe("오답! 상대는 사람이었습니다");
  });

  it("returns correct result for human→human", () => {
    const r = getJudgmentResult("human", "human");
    expect(r.correct).toBe(true);
    expect(r.resultMessage).toBe("정답! 상대는 사람이었습니다");
  });

  it("returns wrong result for human→ai", () => {
    const r = getJudgmentResult("human", "ai");
    expect(r.correct).toBe(false);
    expect(r.resultMessage).toBe("오답! 상대는 AI였습니다");
  });
});
