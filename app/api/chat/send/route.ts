import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { kvKeys, MatchData } from "@/lib/random-chat/kv-schema";
import { KV_TTL_SECONDS } from "@/lib/random-chat/constants";
import { Message } from "@/lib/random-chat/types";
import { streamAiResponse } from "@/lib/random-chat/glm";
import { GlmMessage } from "@/lib/random-chat/glm";

export async function POST(request: NextRequest) {
  const { matchId, sessionId, text } = await request.json();

  if (!matchId || !sessionId || !text) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const matchRaw = await kv.get<string>(kvKeys.match(matchId));
  if (!matchRaw) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const match: MatchData =
    typeof matchRaw === "string" ? JSON.parse(matchRaw) : matchRaw;

  const me = match.participants.find((p) => p.sessionId === sessionId);
  if (!me) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  const partner = match.participants.find((p) => p.sessionId !== sessionId);

  const messageId = crypto.randomUUID();
  const message: Message = {
    id: messageId,
    senderId: sessionId,
    text,
    timestamp: Date.now(),
  };

  // Store user message
  await kv.rpush(kvKeys.messages(matchId), JSON.stringify(message));
  await kv.expire(kvKeys.messages(matchId), KV_TTL_SECONDS);

  // If partner is AI, generate AI response asynchronously
  if (partner?.isAi) {
    const isAiFind = match.mode === "ai-find";
    generateAiReply(matchId, sessionId, text, isAiFind);
  }

  return NextResponse.json({ messageId });
}

async function generateAiReply(
  matchId: string,
  userSessionId: string,
  userText: string,
  isAiFind: boolean
) {
  try {
    // Get conversation history for context
    const messagesRaw = await kv.lrange(kvKeys.messages(matchId), -20, -1);
    const messages = messagesRaw.map((item) => {
      const m: Message =
        typeof item === "string" ? JSON.parse(item) : item;
      return m;
    });

    const glmMessages: GlmMessage[] = messages.map((m) => ({
      role: m.senderId === userSessionId ? "user" : "assistant",
      content: m.text,
    }));

    const aiText = await streamAiResponse(glmMessages, isAiFind);

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      senderId: "ai",
      text: aiText,
      timestamp: Date.now(),
    };

    await kv.rpush(kvKeys.messages(matchId), JSON.stringify(aiMessage));
    await kv.expire(kvKeys.messages(matchId), KV_TTL_SECONDS);
  } catch {
    // Store a fallback message
    const fallback: Message = {
      id: crypto.randomUUID(),
      senderId: "ai",
      text: "...",
      timestamp: Date.now(),
    };
    await kv.rpush(kvKeys.messages(matchId), JSON.stringify(fallback));
    await kv.expire(kvKeys.messages(matchId), KV_TTL_SECONDS);
  }
}
