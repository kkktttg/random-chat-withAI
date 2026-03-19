"use client";

import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";
import { Judgment } from "@/lib/random-chat/types";

interface JudgeButtonsProps {
  onJudge: (judgment: Judgment) => void;
  forced?: boolean;
}

export function JudgeButtons({ onJudge, forced = false }: JudgeButtonsProps) {
  if (forced) {
    return (
      <div className="p-4 border-t-2">
        <p className="text-sm font-bold text-center mb-1">
          이 상대는 누구였을까요?
        </p>
        <p className="text-xs text-center mb-3 text-muted-foreground">
          5번의 대화가 끝났습니다. 판별해주세요!
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 flex-col h-auto py-3 gap-1"
            onClick={() => onJudge("ai")}
            aria-label="AI입니다"
          >
            <Bot className="w-5 h-5" />
            <span className="text-sm font-bold">AI입니다</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex-col h-auto py-3 gap-1"
            onClick={() => onJudge("human")}
            aria-label="사람입니다"
          >
            <User className="w-5 h-5" />
            <span className="text-sm font-bold">사람입니다</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t bg-muted/50">
      <p className="text-xs mb-2 text-muted-foreground">
        상대가 누구인지 판별하세요
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={() => onJudge("ai")}
          aria-label="AI입니다"
        >
          <Bot className="w-4 h-4" />
          AI입니다
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={() => onJudge("human")}
          aria-label="사람입니다"
        >
          <User className="w-4 h-4" />
          사람입니다
        </Button>
      </div>
    </div>
  );
}
