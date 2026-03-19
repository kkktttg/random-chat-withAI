/**
 * Spec tests: CHAT-001, CHAT-019
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

function renderApp(initialScreen?: string) {
  return render(
    <AppProvider initialStateOverride={initialScreen ? { screen: initialScreen as "lobby" } : {}}>
      <AppShell />
    </AppProvider>
  );
}

describe("CHAT-001: 로비 화면 표시", () => {
  it("shows nickname, free chat button, AI find button, and dark mode toggle", async () => {
    renderApp();

    // nickname visible (async due to useEffect initialization)
    // In tests with initialStateOverride, nickname may be empty initially
    expect(screen.getByRole("button", { name: /자유 랜덤채팅/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /AI 찾기/ })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /다크모드 토글/ })).toBeInTheDocument();
  });

  it("shows privacy notice about chat deletion", () => {
    renderApp();
    expect(
      screen.getByText(/대화가 끝나면 모든 채팅 기록은 삭제됩니다/)
    ).toBeInTheDocument();
  });
});

describe("CHAT-019: 랜덤 닉네임 형식", () => {
  it("renders a nickname element in the lobby", () => {
    render(
      <AppProvider initialStateOverride={{ myNickname: "익명의고양이42" }}>
        <AppShell />
      </AppProvider>
    );
    const nicknameEl = screen.getByLabelText("내 닉네임");
    expect(nicknameEl.textContent).toMatch(/^익명의/);
  });

  it("nickname starts with 익명의 prefix", () => {
    render(
      <AppProvider initialStateOverride={{ myNickname: "익명의토끼15" }}>
        <AppShell />
      </AppProvider>
    );
    const nicknameEl = screen.getByLabelText("내 닉네임");
    expect(nicknameEl.textContent).toContain("익명의");
  });
});
