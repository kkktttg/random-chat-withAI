/**
 * Spec tests: CHAT-007, CHAT-008
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
    joinMatch: vi.fn().mockResolvedValue({ queued: true }),
    getMatchStatus: vi.fn().mockResolvedValue({ status: "waiting" }),
  },
}));

describe("CHAT-007: AI찾기 매칭 대기", () => {
  it("shows waiting screen with 30-second batch message when AI find button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AppProvider initialStateOverride={{ myNickname: "익명의고양이1" }}>
        <AppShell />
      </AppProvider>
    );

    const aiFindBtn = screen.getByRole("button", { name: /AI 찾기/ });
    await user.click(aiFindBtn);

    expect(screen.getByText("상대를 찾고 있습니다...")).toBeInTheDocument();
    expect(screen.getByText(/30초마다 대기자끼리 매칭됩니다/)).toBeInTheDocument();
  });
});

describe("CHAT-008: AI찾기 매칭 완료", () => {
  it("shows turn counter with 5 turns when matched in AI find mode", () => {
    render(
      <AppProvider
        initialStateOverride={{
          screen: "ai-find-chat",
          myNickname: "익명의고양이1",
          sessionId: "session1",
          partnerNickname: "익명의판다15",
          matchId: "match1",
          mode: "ai-find",
          remainingTurns: 5,
        }}
      >
        <AppShell />
      </AppProvider>
    );

    expect(screen.getByText("남은 대화: 5회")).toBeInTheDocument();
  });
});
