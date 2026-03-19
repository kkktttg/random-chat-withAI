/**
 * Spec tests: CHAT-016, CHAT-021
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

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

function renderApp() {
  return render(
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

describe("CHAT-016: 다크모드 전환 (라이트 → 다크)", () => {
  it("adds dark class to html element when toggle is clicked", async () => {
    const user = userEvent.setup();
    renderApp();

    const toggle = screen.getByRole("switch", { name: /다크모드 토글/ });
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    await user.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("CHAT-021: 라이트모드 전환 (다크 → 라이트)", () => {
  it("removes dark class from html element when toggle is clicked in dark mode", async () => {
    // Set dark mode initially
    document.documentElement.classList.add("dark");
    localStorage.setItem("darkMode", "true");

    const user = userEvent.setup();
    renderApp();

    const toggle = screen.getByRole("switch", { name: /다크모드 토글/ });
    await user.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
