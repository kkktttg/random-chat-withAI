import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { generateNickname } from "@/lib/random-chat/nickname";
import { kvKeys } from "@/lib/random-chat/kv-schema";
import { KV_TTL_SECONDS } from "@/lib/random-chat/constants";

export async function POST() {
  const sessionId = crypto.randomUUID();
  const nickname = generateNickname();

  await kv.set(
    kvKeys.session(sessionId),
    JSON.stringify({ sessionId, nickname, createdAt: Date.now() }),
    { ex: KV_TTL_SECONDS }
  );

  return NextResponse.json({ sessionId, nickname });
}
