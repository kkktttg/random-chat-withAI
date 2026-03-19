import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { kvKeys } from "@/lib/random-chat/kv-schema";
import { Message } from "@/lib/random-chat/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");
  const sessionId = searchParams.get("sessionId");
  const after = Number(searchParams.get("after") ?? "0");

  if (!matchId || !sessionId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const rawItems = await kv.lrange(kvKeys.messages(matchId), 0, -1);
  const messages: Message[] = rawItems.map((item) =>
    typeof item === "string" ? JSON.parse(item) : item
  );

  const filtered = messages.filter((m) => m.timestamp > after);

  return NextResponse.json({ messages: filtered });
}
