"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  Dispatch,
  ReactNode,
} from "react";
import { AppState, Action } from "@/lib/random-chat/types";
import { reducer, initialState } from "@/lib/random-chat/reducer";
import { generateNickname } from "@/lib/random-chat/nickname";

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
  initialStateOverride?: Partial<AppState>;
}

export function AppProvider({ children, initialStateOverride }: AppProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ...initialStateOverride,
  });

  useEffect(() => {
    if (state.sessionId) return;
    const sessionId = crypto.randomUUID();
    const nickname = generateNickname();
    dispatch({ type: "INIT_SESSION", sessionId, nickname });
  }, [state.sessionId]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
