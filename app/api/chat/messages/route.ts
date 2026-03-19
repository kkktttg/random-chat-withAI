import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { kvKeys, MatchData } from "@/lib/random-chat/kv-schema";
import { Message } from "@/lib/random-chat/types";
import { INACTIVITY_TIMEOUT_MS, KV_TTL_SECONDS } from "@/lib/random-chat/constants";

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

  // Check if inactive partner should be switched to AI
  const matchRaw = await kv.get<string>(kvKeys.match(matchId));
  if (matchRaw) {
    const match: MatchData =
      typeof matchRaw === "string" ? JSON.parse(matchRaw) : matchRaw;
    const partner = match.participants.find((p) => p.sessionId !== sessionId);

    if (
      partner &&
      !partner.isAi &&
      !match.partnerSwitchedAt &&
      Date.now() - match.createdAt >= INACTIVITY_TIMEOUT_MS
    ) {
      const partnerHasSent = messages.some((m) => m.senderId === partner.sessionId);
      if (!partnerHasSent) {
        // Switch partner to AI
        partner.isAi = true;
        partner.sessionId = "ai";
        match.partnerSwitchedAt = Date.now();
        await kv.set(kvKeys.match(matchId), JSON.stringify(match), {
          ex: KV_TTL_SECONDS,
        });

        // Silent switch — no notice message
      }
    }
  }

  const filtered = messages.filter((m) => m.timestamp > after);

  return NextResponse.json({ messages: filtered });
}
