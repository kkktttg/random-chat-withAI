import { Badge } from "@/components/ui/badge";

interface TurnCounterProps {
  remaining: number;
}

export function TurnCounter({ remaining }: TurnCounterProps) {
  return (
    <Badge variant="outline" className="text-xs font-bold">
      남은 대화: {remaining}회
    </Badge>
  );
}
