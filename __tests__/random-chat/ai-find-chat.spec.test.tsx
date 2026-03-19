/**
 * Spec tests: CHAT-009, CHAT-010, CHAT-013, CHAT-020
 * Generated from spec.yaml — do not modify after creation
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "@/components/random-chat/app-provider";
import { AppShell } from "@/components/random-chat/app-shell";
import { Message } from "@/lib/random-chat/types";

vi.mock("@/hooks/use-polling", () => ({
  usePolling: vi.fn(),
}));

vi.mock("@/lib/random-chat/api-client", () => ({
  apiClient: {
    joinMatch: vi.fn().mockResolvedValue({ queued: true }),
    getMatchStatus: vi.fn().mockResolvedValue({ status: "waiting" }),
    sendMessage: vi.fn().mockResolvedValue({ messageId: "m1" }),
    getMessages: vi.fn().mockResolvedValue({ messages: [] }),
    judge: vi.fn().mockResolvedValue({
      actualPartner: "ai",
      correct: true,
      resultMessage: "정답! 상대는 AI였습니다",
    }),
  },
}));

const baseAiFindState = {
  screen: "ai-find-chat" as const,
  myNickname: "익명의고양이1",
  sessionId: "session1",
  partnerNickname: "익명의판다15",
  matchId: "match1",
  mode: "ai-find" as const,
  remainingTurns: 5,
  messages: [] as Message[],
  isWaitingForAi: false,
};

describe("CHAT-009: AI찾기 대화 카운터 감소", () => {
  it("shows decremented turn counter after turn exchange", () => {
    render(
      <AppProvider initialStateOverride={{ ...baseAiFindState, remainingTurns: 4 }}>
        <AppShell />
      </AppProvider>
    );

    expect(screen.getByText("남은 대화: 4회")).toBeInTheDocument();
  });
});

describe("CHAT-010: AI찾기 AI 응답 지연 (typing indicator)", () => {
  it("shows typing indicator when waiting for AI response", () => {
    render(
      <AppProvider
        initialStateOverride={{ ...baseAiFindState, isWaitingForAi: true }}
      >
        <AppShell />
      </AppProvider>
    );

    expect(screen.getByText(/입력 중\.\.\./)).toBeInTheDocument();
  });
});

describe("CHAT-013: AI찾기 5회 완료 시 강제 판별", () => {
  it("shows forced judgment prompt when remaining turns is 0", () => {
    render(
      <AppProvider
        initialStateOverride={{ ...baseAiFindState, remainingTurns: 0 }}
      >
        <AppShell />
      </AppProvider>
    );

    expect(screen.getByText(/이 상대는 누구였을까요\?/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /AI입니다/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /사람입니다/ })).toBeInTheDocument();
  });
});

describe("CHAT-020: AI찾기 판별 버튼 상시 표시", () => {
  it("shows AI and human judge buttons during chat", () => {
    render(
      <AppProvider initialStateOverride={{ ...baseAiFindState, remainingTurns: 3 }}>
        <AppShell />
      </AppProvider>
    );

    expect(screen.getAllByRole("button", { name: /AI입니다/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /사람입니다/ }).length).toBeGreaterThan(0);
  });
});
