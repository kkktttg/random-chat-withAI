"use client";

import { useApp } from "@/components/random-chat/app-provider";
import { Header } from "@/components/random-chat/shared/header";
import { LobbyScreen } from "@/components/random-chat/screens/lobby-screen";
import { MatchingScreen } from "@/components/random-chat/screens/matching-screen";
import { FreeChatScreen } from "@/components/random-chat/screens/free-chat-screen";
import { AiFindChatScreen } from "@/components/random-chat/screens/ai-find-chat-screen";
import { AiFindResultScreen } from "@/components/random-chat/screens/ai-find-result-screen";

export function AppShell() {
  const { state } = useApp();

  const getHeaderProps = () => {
    switch (state.screen) {
      case "free-chat":
        return {
          partnerNickname: state.partnerNickname,
          partnerMode: "자유 랜덤채팅",
        };
      case "ai-find-chat":
        return {
          partnerNickname: state.partnerNickname,
          partnerMode: "AI찾기",
        };
      case "matching":
        return {
          title:
            state.mode === "free" ? "자유 랜덤채팅" : "AI 찾기",
        };
      default:
        return {};
    }
  };

  const renderScreen = () => {
    switch (state.screen) {
      case "lobby":
        return <LobbyScreen />;
      case "matching":
        return <MatchingScreen />;
      case "free-chat":
        return <FreeChatScreen />;
      case "ai-find-chat":
        return <AiFindChatScreen />;
      case "ai-find-result":
        return <AiFindResultScreen />;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden flex flex-col max-w-sm mx-auto min-h-[600px]">
      <Header {...getHeaderProps()} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
}
