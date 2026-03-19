/**
 * Spec tests: CHAT-011, CHAT-012, CHAT-014, CHAT-015
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
    endChat: vi.fn().mockResolvedValue({}),
    judge: vi.fn().mockResolvedValue({
      actualPartner: "ai",
      correct: true,
      resultMessage: "정답! 상대는 AI였습니다",
    }),
    joinMatch: vi.fn().mockResolvedValue({ queued: true }),
    getMatchStatus: vi.fn().mockResolvedValue({ status: "waiting" }),
  },
}));

function renderResult(judgment: "ai" | "human", actualPartner: "ai" | "human") {
  const resultMessages: Record<string, string> = {
    "ai-ai": "정답! 상대는 AI였습니다",
    "ai-human": "오답! 상대는 사람이었습니다",
    "human-human": "정답! 상대는 사람이었습니다",
    "human-ai": "오답! 상대는 AI였습니다",
  };

  const key = `${judgment}-${actualPartner}`;
  const correct = judgment === actualPartner;

  return render(
    <AppProvider
      initialStateOverride={{
        screen: "ai-find-result",
        matchId: "match1",
        sessionId: "session1",
        judgmentResult: {
          judgment,
          actualPartner,
          correct,
          resultMessage: resultMessages[key],
        },
      }}
    >
      <AppShell />
    </AppProvider>
  );
}

describe("CHAT-011: AI찾기 조기 판별 — AI를 AI로", () => {
  it("shows correct result message when AI is judged as AI", () => {
    renderResult("ai", "ai");
    expect(screen.getByText("정답! 상대는 AI였습니다")).toBeInTheDocument();
  });

  it("shows wrong result when human is judged as AI", () => {
    renderResult("ai", "human");
    expect(screen.getByText("오답! 상대는 사람이었습니다")).toBeInTheDocument();
  });
});

describe("CHAT-012: AI찾기 사람 판별", () => {
  it("shows wrong result when AI is judged as human", () => {
    renderResult("human", "ai");
    expect(screen.getByText("오답! 상대는 AI였습니다")).toBeInTheDocument();
  });

  it("shows correct result when human is judged as human", () => {
    renderResult("human", "human");
    expect(screen.getByText("정답! 상대는 사람이었습니다")).toBeInTheDocument();
  });
});

describe("CHAT-014: AI찾기 결과에서 다시 하기", () => {
  it("shows matching screen when retry button is clicked", async () => {
    const user = userEvent.setup();
    renderResult("ai", "ai");

    const retryBtn = screen.getByRole("button", { name: /다시 하기/ });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("상대를 찾고 있습니다...")).toBeInTheDocument();
    });
  });
});

describe("CHAT-015: AI찾기 결과에서 로비로", () => {
  it("shows lobby when go to lobby button is clicked", async () => {
    const user = userEvent.setup();
    renderResult("ai", "ai");

    const lobbyBtn = screen.getByRole("button", { name: /로비로/ });
    await user.click(lobbyBtn);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /자유 랜덤채팅/ })).toBeInTheDocument();
    });
  });
});
