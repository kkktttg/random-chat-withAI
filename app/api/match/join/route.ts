import { NextRequest, NextResponse } from "next/server";
import { joinQueue } from "@/lib/random-chat/matching";
import { kv } from "@vercel/kv";
import { kvKeys } from "@/lib/random-chat/kv-schema";

export async function POST(request: NextRequest) {
  const { sessionId, mode } = await request.json();

  if (!sessionId || !mode) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Get nickname from session
  const sessionRaw = await kv.get<string>(kvKeys.session(sessionId));
  if (!sessionRaw) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const session =
    typeof sessionRaw === "string" ? JSON.parse(sessionRaw) : sessionRaw;

  // Check if already in queue (avoid duplicates)
  const queueKey = kvKeys.queue(mode);
  const existingItems = await kv.lrange(queueKey, 0, -1);
  const alreadyInQueue = existingItems.some((item) => {
    const entry = typeof item === "string" ? JSON.parse(item) : item;
    return entry.sessionId === sessionId;
  });

  if (!alreadyInQueue) {
    await joinQueue(sessionId, session.nickname, mode);
  }

  return NextResponse.json({ queued: true });
}
