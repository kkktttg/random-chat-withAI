"use client";

import { MessageCircle, Bot, ChevronRight } from "lucide-react";
import { useApp } from "@/components/random-chat/app-provider";

export function LobbyScreen() {
  const { state, dispatch } = useApp();
  const initial = state.myNickname.charAt(3) || "?";

  return (
    <div className="relative p-6 flex flex-col items-center gap-6">
      {/* Nickname */}
      <div className="flex flex-col items-center gap-1">
        <div className="rounded-full flex items-center justify-center text-sm font-bold w-14 h-14 bg-muted border-2">
          {initial}
        </div>
        <span className="text-sm font-bold" aria-label="내 닉네임">
          {state.myNickname}
        </span>
        <span className="text-xs text-muted-foreground">오늘 내 닉네임</span>
      </div>

      <hr className="w-full border-border" />

      {/* Mode Buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          className="border rounded-lg p-4 text-left bg-muted/50 hover:bg-muted transition-colors"
          onClick={() => dispatch({ type: "START_MATCHING", mode: "free" })}
          aria-label="자유 랜덤채팅"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">자유 랜덤채팅</p>
              <p className="text-xs text-muted-foreground">
                랜덤으로 매칭되어 자유롭게 대화
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>

        <button
          className="border-2 rounded-lg p-4 text-left bg-background hover:bg-muted/30 transition-colors"
          onClick={() => dispatch({ type: "START_MATCHING", mode: "ai-find" })}
          aria-label="AI 찾기"
        >
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">AI 찾기</p>
              <p className="text-xs text-muted-foreground">
                상대가 AI인지 사람인지 판별하기
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        대화가 끝나면 모든 채팅 기록은 삭제됩니다
      </p>

      <span className="absolute bottom-3 right-4 text-[10px] text-muted-foreground/50 font-mono select-none">
        {process.env.NEXT_PUBLIC_GIT_COMMIT}
      </span>
    </div>
  );
}
