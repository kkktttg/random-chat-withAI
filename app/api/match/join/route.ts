import { NextRequest, NextResponse } from "next/server";
import { joinQueue } from "@/lib/random-chat/matching";
import { kv } from "@vercel/kv";
import { kvKeys } from "@/lib/random-chat/kv-schema";
import { KV_TTL_SECONDS } from "@/lib/random-chat/constants";

export async function POST(request: NextRequest) {
  const { sessionId, nickname, mode } = await request.json();

  if (!sessionId || !nickname || !mode) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Upsert session in KV (client generates sessionId locally)
  await kv.set(
    kvKeys.session(sessionId),
    JSON.stringify({ sessionId, nickname, createdAt: Date.now() }),
    { ex: KV_TTL_SECONDS }
  );

  // Check if already in queue (avoid duplicates)
  const queueKey = kvKeys.queue(mode);
  const existingItems = await kv.lrange(queueKey, 0, -1);
  const alreadyInQueue = existingItems.some((item) => {
    const entry = typeof item === "string" ? JSON.parse(item) : item;
    return entry.sessionId === sessionId;
  });

  if (!alreadyInQueue) {
    await joinQueue(sessionId, nickname, mode);
  }

  return NextResponse.json({ queued: true });
}
