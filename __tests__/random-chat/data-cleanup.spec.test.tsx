/**
 * Spec tests: CHAT-017, CHAT-022, CHAT-023
 * Generated from spec.yaml — do not modify after creation
 */
import { render, screen, waitFor } from "@testing-library/react";
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
    endChat: vi.fn().mockResolvedValue({}),
    sendMessage: vi.fn().mockResolvedValue({ messageId: "m1" }),
    getMessages: vi.fn().mockResolvedValue({ messages: [] }),
  },
}));

const previousMessages: Message[] = [
  {
    id: "old-msg-1",
    senderId: "session1",
    text: "이전 대화 내용",
    timestamp: Date.now() - 60000,
  },
];

describe("CHAT-017: 대화 종료 시 데이터 삭제 (나가기)", () => {
  it("previous messages are not shown after leaving", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider
        initialStateOverride={{
          screen: "free-chat",
          myNickname: "익명의고양이1",
          sessionId: "session1",
          partnerNickname: "익명의토끼77",
          matchId: "match1",
          mode: "free",
          messages: previousMessages,
        }}
      >
        <AppShell />
      </AppProvider>
    );

    expect(screen.getByText("이전 대화 내용")).toBeInTheDocument();

    const leaveBtn = screen.getByRole("button", { name: /나가기/ });
    await user.click(leaveBtn);

    await waitFor(() => {
      expect(screen.queryByText("이전 대화 내용")).not.toBeInTheDocument();
    });
  });
});

describe("CHAT-022: 다음 상대 후 데이터 삭제", () => {
  it("previous messages are not shown after clicking next partner", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider
        initialStateOverride={{
          screen: "free-chat",
          myNickname: "익명의고양이1",
          sessionId: "session1",
          partnerNickname: "익명의토끼77",
          matchId: "match1",
          mode: "free",
          messages: previousMessages,
        }}
      >
        <AppShell />
      </AppProvider>
    );

    const nextBtn = screen.getByRole("button", { name: /다음 상대/ });
    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.queryByText("이전 대화 내용")).not.toBeInTheDocument();
    });
  });
});

describe("CHAT-023: 판별 완료 후 데이터 삭제", () => {
  it("previous messages not shown after retry from result screen", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider
        initialStateOverride={{
          screen: "ai-find-result",
          myNickname: "익명의고양이1",
          sessionId: "session1",
          matchId: "match1",
          mode: "ai-find",
          messages: previousMessages,
          judgmentResult: {
            judgment: "ai",
            actualPartner: "ai",
            correct: true,
            resultMessage: "정답! 상대는 AI였습니다",
          },
        }}
      >
        <AppShell />
      </AppProvider>
    );

    const retryBtn = screen.getByRole("button", { name: /다시 하기/ });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByText("이전 대화 내용")).not.toBeInTheDocument();
    });
  });
});
