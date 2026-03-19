"use client";

import { useEffect, useRef, useCallback } from "react";

export function usePolling(
  callback: () => Promise<void> | void,
  intervalMs: number,
  enabled: boolean
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = useCallback(() => {
    timeoutRef.current = setTimeout(async () => {
      await callbackRef.current();
      if (enabled) schedule();
    }, intervalMs);
  }, [intervalMs, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    schedule();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, schedule]);
}
