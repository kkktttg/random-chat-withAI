import { JudgmentResult } from "@/lib/random-chat/types";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultCardProps {
  result: JudgmentResult;
  onRetry: () => void;
  onGoLobby: () => void;
}

export function ResultCard({ result, onRetry, onGoLobby }: ResultCardProps) {
  const isCorrect = result.correct;

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <div className="rounded-full flex items-center justify-center w-14 h-14 bg-muted border-2">
        {isCorrect ? (
          <Check className="w-7 h-7" />
        ) : (
          <X className="w-7 h-7" />
        )}
      </div>

      <p className="text-lg font-bold text-center">{result.resultMessage}</p>

      <div className="border rounded p-3 w-full text-center bg-muted/50">
        <p className="text-xs text-muted-foreground">내 판별</p>
        <p className="text-sm font-bold">
          {result.judgment === "ai" ? "AI입니다" : "사람입니다"} → 실제:{" "}
          {result.actualPartner === "ai" ? "AI" : "사람"}
        </p>
      </div>

      <div className="flex gap-2 w-full">
        <Button variant="outline" className="flex-1" onClick={onGoLobby}>
          로비로
        </Button>
        <Button className="flex-1" onClick={onRetry}>
          다시 하기
        </Button>
      </div>
    </div>
  );
}
