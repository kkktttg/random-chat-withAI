import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { kvKeys, MatchData } from "@/lib/random-chat/kv-schema";
import { deleteMatchData } from "@/lib/random-chat/matching";

export async function POST(request: NextRequest) {
  const { matchId, sessionId } = await request.json();

  if (!matchId || !sessionId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const matchRaw = await kv.get<string>(kvKeys.match(matchId));
  if (!matchRaw) {
    return NextResponse.json({ ok: true }); // Already deleted
  }

  const match: MatchData =
    typeof matchRaw === "string" ? JSON.parse(matchRaw) : matchRaw;

  const sessionIds = match.participants
    .filter((p) => !p.isAi)
    .map((p) => p.sessionId);

  await deleteMatchData(matchId, sessionIds);

  return NextResponse.json({ ok: true });
}
