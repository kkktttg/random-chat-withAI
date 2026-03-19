import { renderHook, act } from "@testing-library/react";
import { useDarkMode } from "@/hooks/use-dark-mode";

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

describe("useDarkMode", () => {
  it("starts in light mode by default", () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);
  });

  it("toggling adds dark class to html element", () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggling twice removes dark class from html element", () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.toggle();
    });

    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("restores dark mode from localStorage on mount", () => {
    localStorage.setItem("darkMode", "true");
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useDarkMode());

    act(() => {}); // flush effects

    expect(result.current.isDark).toBe(true);
  });
});
