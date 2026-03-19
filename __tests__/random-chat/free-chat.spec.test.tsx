/**
 * Spec tests: CHAT-004, CHAT-005, CHAT-006, CHAT-018
 * Generated from spec.yaml — do not modify after creation
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppProvider } from "@/components/random-chat/app-provider";
import { AppShell } from "@/components/random-chat/app-shell";

vi.mock("@/hooks/use-polling", () => ({
  usePolling: vi.fn(),
}));

vi.mock("@/lib/random-chat/api-client", () => ({
  apiClient: {
    joinMatch: vi.fn().mockResolvedValue({ queued: true }),
    getMatchStatus: vi.fn().mockResolvedValue({ status: "waiting" }),
    sendMessage: vi.fn().mockResolvedValue({ messageId: "m1" }),
    getMessages: vi.fn().mockResolvedValue({ messages: [] }),
    endChat: vi.fn().mockResolvedValue({}),
  },
}));

const freeChatState = {
  screen: "free-chat" as const,
  myNickname: "익명의고양이1",
  sessionId: "session1",
  partnerNickname: "익명의토끼77",
  matchId: "match1",
  mode: "free" as const,
  messages: [],
};

function renderFreeChat(overrides = {}) {
  return render(
    <AppProvider initialStateOverride={{ ...freeChatState, ...overrides }}>
      <AppShell />
    </AppProvider>
  );
}

describe("CHAT-004: 자유 랜덤채팅 메시지 전송", () => {
  it("displays sent message as own bubble", async () => {
    const user = userEvent.setup();
    renderFreeChat();

    const input = screen.getByLabelText("메시지 입력");
    const sendBtn = screen.getByLabelText("전송");

    await user.type(input, "안녕하세요");
    await user.click(sendBtn);

    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
  });
});

describe("CHAT-005: 자유 랜덤채팅 나가기", () => {
  it("returns to lobby when leave button is clicked", async () => {
    const user = userEvent.setup();
    renderFreeChat();

    const leaveBtn = screen.getByRole("button", { name: /나가기/ });
    await user.click(leaveBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /자유 랜덤채팅/ })).toBeInTheDocument();
    });
  });
});

describe("CHAT-006: 자유 랜덤채팅 다음 상대", () => {
  it("shows matching screen when next partner button is clicked", async () => {
    const user = userEvent.setup();
    renderFreeChat();

    const nextBtn = screen.getByRole("button", { name: /다음 상대/ });
    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText("상대를 찾고 있습니다...")).toBeInTheDocument();
    });
  });
});

describe("CHAT-018: 자유 랜덤채팅 상대방 메시지 수신", () => {
  it("displays partner message received via polling", () => {
    const partnerMessage = {
      id: "msg1",
      senderId: "partner1",
      text: "반갑습니다",
      timestamp: Date.now(),
    };

    renderFreeChat({ messages: [partnerMessage] });

    expect(screen.getByText("반갑습니다")).toBeInTheDocument();
  });
});
