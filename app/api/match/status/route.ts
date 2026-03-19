import { NextRequest, NextResponse } from "next/server";
import { checkMatchStatus } from "@/lib/random-chat/matching";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const mode = searchParams.get("mode") as "free" | "ai-find" | null;

  if (!sessionId || !mode) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const match = await checkMatchStatus(sessionId, mode);

  if (match) {
    return NextResponse.json({
      status: "matched",
      matchId: match.matchId,
      partnerNickname: match.partnerNickname,
    });
  }

  return NextResponse.json({ status: "waiting" });
}
