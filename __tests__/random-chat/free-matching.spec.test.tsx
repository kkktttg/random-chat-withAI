/**
 * Spec tests: CHAT-002, CHAT-003
 * Generated from spec.yaml — do not modify after creation
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "@/components/random-chat/app-provider";
import { AppShell } from "@/components/random-chat/app-shell";

vi.mock("@/hooks/use-polling", () => ({
  usePolling: vi.fn(),
}));

vi.mock("@/lib/random-chat/api-client", () => ({
  apiClient: {
    createSession: vi.fn().mockResolvedValue({ sessionId: "s1", nickname: "익명의고양이1" }),
    joinMatch: vi.fn().mockResolvedValue({ queued: true }),
    getMatchStatus: vi.fn().mockResolvedValue({ status: "waiting" }),
    sendMessage: vi.fn().mockResolvedValue({ messageId: "m1" }),
    getMessages: vi.fn().mockResolvedValue({ messages: [] }),
    endChat: vi.fn().mockResolvedValue({}),
    judge: vi.fn().mockResolvedValue({ actualPartner: "ai", correct: true, resultMessage: "정답! 상대는 AI였습니다" }),
  },
}));

describe("CHAT-002: 자유 랜덤채팅 매칭 대기", () => {
  it("shows waiting screen with correct message when free chat button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider initialStateOverride={{ myNickname: "익명의고양이1" }}>
        <AppShell />
      </AppProvider>
    );

    const freeChatBtn = screen.getByRole("button", { name: /자유 랜덤채팅/ });
    await user.click(freeChatBtn);

    expect(screen.getByText("상대를 찾고 있습니다...")).toBeInTheDocument();
    expect(screen.getByText(/대기자가 있으면 바로 매칭됩니다/)).toBeInTheDocument();
  });
});

describe("CHAT-003: 자유 랜덤채팅 매칭 완료", () => {
  it("transitions to chat screen showing partner nickname when match is found", () => {
    render(
      <AppProvider
        initialStateOverride={{
          screen: "free-chat",
          myNickname: "익명의고양이1",
          partnerNickname: "익명의토끼77",
          matchId: "match1",
          mode: "free",
        }}
      >
        <AppShell />
      </AppProvider>
    );

    expect(screen.getByText("익명의토끼77")).toBeInTheDocument();
  });
});
