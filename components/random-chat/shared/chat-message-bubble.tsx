import { Message } from "@/lib/random-chat/types";

interface ChatMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  partnerInitial?: string;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function ChatMessageBubble({
  message,
  isOwn,
  partnerInitial = "?",
}: ChatMessageBubbleProps) {
  if (isOwn) {
    return (
      <div className="flex items-end gap-2 justify-end">
        <div>
          <div className="rounded-lg px-3 py-2 text-sm bg-muted border max-w-[70%] text-right ml-auto">
            {message.text}
          </div>
          <p className="text-xs mt-0.5 text-right text-muted-foreground">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 w-6 h-6 bg-muted border">
        {partnerInitial}
      </div>
      <div>
        <div className="rounded-lg px-3 py-2 text-sm bg-background border max-w-[70%]">
          {message.text}
        </div>
        <p className="text-xs mt-0.5 text-muted-foreground">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator({ initial = "?" }: { initial?: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 w-6 h-6 bg-muted border">
        {initial}
      </div>
      <div className="rounded-lg px-3 py-2 text-sm bg-background border flex items-center gap-1">
        <span className="text-muted-foreground">입력 중...</span>
      </div>
    </div>
  );
}
