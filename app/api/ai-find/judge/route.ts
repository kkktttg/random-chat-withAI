import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { kvKeys, MatchData } from "@/lib/random-chat/kv-schema";
import { Judgment, PartnerType } from "@/lib/random-chat/types";
import { getJudgmentResult } from "@/lib/random-chat/reducer";

export async function POST(request: NextRequest) {
  const { matchId, sessionId, judgment } = await request.json() as {
    matchId: string;
    sessionId: string;
    judgment: Judgment;
  };

  if (!matchId || !sessionId || !judgment) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const matchRaw = await kv.get<string>(kvKeys.match(matchId));
  if (!matchRaw) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const match: MatchData =
    typeof matchRaw === "string" ? JSON.parse(matchRaw) : matchRaw;

  const partner = match.participants.find((p) => p.sessionId !== sessionId);
  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const actualPartner: PartnerType = partner.isAi ? "ai" : "human";
  const result = getJudgmentResult(judgment, actualPartner);

  return NextResponse.json({
    actualPartner,
    correct: result.correct,
    resultMessage: result.resultMessage,
  });
}
