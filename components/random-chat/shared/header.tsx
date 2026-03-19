"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDarkMode } from "@/hooks/use-dark-mode";

interface HeaderProps {
  title?: string;
  partnerNickname?: string | null;
  partnerMode?: string | null;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function Header({
  title = "랜덤채팅 + AI",
  partnerNickname,
  partnerMode,
  leftSlot,
  rightSlot,
}: HeaderProps) {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
      {leftSlot ? (
        leftSlot
      ) : partnerNickname ? (
        <div className="flex items-center gap-2">
          <div className="rounded-full flex items-center justify-center text-xs font-bold w-7 h-7 bg-muted border">
            {partnerNickname.charAt(3) || "?"}
          </div>
          <div>
            <p className="text-xs font-bold">{partnerNickname}</p>
            {partnerMode && (
              <p className="text-xs text-muted-foreground">{partnerMode}</p>
            )}
          </div>
        </div>
      ) : (
        <span className="text-sm font-bold">{title}</span>
      )}

      {rightSlot ? (
        rightSlot
      ) : (
        <div className="flex items-center gap-2">
          <Label htmlFor="dark-mode-switch" className="text-xs text-muted-foreground cursor-pointer">
            다크
          </Label>
          <Switch
            id="dark-mode-switch"
            checked={isDark}
            onCheckedChange={toggle}
            aria-label="다크모드 토글"
          />
        </div>
      )}
    </div>
  );
}
