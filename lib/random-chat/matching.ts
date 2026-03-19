import { kv } from "@vercel/kv";
import { kvKeys, QueueEntry, MatchData } from "./kv-schema";
import {
  FREE_MATCH_TIMEOUT_MS,
  BATCH_MATCH_INTERVAL_MS,
  AI_FIND_AI_PROBABILITY,
  KV_TTL_SECONDS,
} from "./constants";
import { generateNickname } from "./nickname";

function randomAiNickname() {
  return generateNickname();
}

function parseEntry(item: unknown): QueueEntry {
  if (typeof item === "string") return JSON.parse(item);
  return item as QueueEntry;
}

export async function joinQueue(
  sessionId: string,
  nickname: string,
  mode: "free" | "ai-find"
): Promise<void> {
  const entry: QueueEntry = { sessionId, nickname, joinedAt: Date.now() };
  await kv.rpush(kvKeys.queue(mode), JSON.stringify(entry));
}

async function createMatch(
  matchData: MatchData,
  userSessionIds: string[]
): Promise<void> {
  await kv.set(kvKeys.match(matchData.matchId), JSON.stringify(matchData), {
    ex: KV_TTL_SECONDS,
  });
  for (const sessionId of userSessionIds) {
    await kv.set(kvKeys.sessionMatch(sessionId), matchData.matchId, {
      ex: KV_TTL_SECONDS,
    });
  }
}

export async function checkMatchStatus(
  sessionId: string,
  mode: "free" | "ai-find"
): Promise<{ matchId: string; partnerNickname: string } | null> {
  // Check if already matched
  const existingMatchId = await kv.get<string>(kvKeys.sessionMatch(sessionId));
  if (existingMatchId) {
    const matchRaw = await kv.get<string>(kvKeys.match(existingMatchId));
    if (matchRaw) {
      const match: MatchData =
        typeof matchRaw === "string" ? JSON.parse(matchRaw) : matchRaw;
      const partner = match.participants.find(
        (p) => p.sessionId !== sessionId
      );
      if (partner) {
        return { matchId: existingMatchId, partnerNickname: partner.nickname };
      }
    }
  }

  if (mode === "free") {
    return tryFreeMatch(sessionId);
  } else {
    return tryAiFindBatchMatch(sessionId);
  }
}

async function tryFreeMatch(
  sessionId: string
): Promise<{ matchId: string; partnerNickname: string } | null> {
  const queueKey = kvKeys.queue("free");
  const rawItems = await kv.lrange(queueKey, 0, -1);
  const queue = rawItems.map(parseEntry);

  const myIndex = queue.findIndex((e) => e.sessionId === sessionId);
  if (myIndex === -1) return null;

  const me = queue[myIndex];
  const other = queue.find((e) => e.sessionId !== sessionId);

  if (other) {
    const matchId = crypto.randomUUID();
    const matchData: MatchData = {
      matchId,
      mode: "free",
      participants: [
        { sessionId: me.sessionId, nickname: me.nickname, isAi: false },
        { sessionId: other.sessionId, nickname: other.nickname, isAi: false },
      ],
      createdAt: Date.now(),
    };

    await createMatch(matchData, [me.sessionId, other.sessionId]);
    await kv.lrem(queueKey, 0, JSON.stringify(me));
    await kv.lrem(queueKey, 0, JSON.stringify(other));

    return { matchId, partnerNickname: other.nickname };
  }

  // Check for timeout → AI match
  const elapsed = Date.now() - me.joinedAt;
  if (elapsed >= FREE_MATCH_TIMEOUT_MS) {
    const matchId = crypto.randomUUID();
    const aiNickname = randomAiNickname();

    const matchData: MatchData = {
      matchId,
      mode: "free",
      participants: [
        { sessionId: me.sessionId, nickname: me.nickname, isAi: false },
        { sessionId: "ai", nickname: aiNickname, isAi: true },
      ],
      createdAt: Date.now(),
    };

    await createMatch(matchData, [me.sessionId]);
    await kv.lrem(queueKey, 0, JSON.stringify(me));

    return { matchId, partnerNickname: aiNickname };
  }

  return null;
}

async function tryAiFindBatchMatch(
  sessionId: string
): Promise<{ matchId: string; partnerNickname: string } | null> {
  const queueKey = kvKeys.queue("ai-find");
  const rawItems = await kv.lrange(queueKey, 0, -1);
  const queue = rawItems.map(parseEntry);

  const me = queue.find((e) => e.sessionId === sessionId);
  if (!me) return null;

  const elapsed = Date.now() - me.joinedAt;
  if (elapsed < BATCH_MATCH_INTERVAL_MS) return null;

  // Find other users in queue (partner doesn't need to have waited 30s)
  const eligible = queue.filter((e) => e.sessionId !== sessionId);

  const useAi =
    eligible.length === 0 || Math.random() < AI_FIND_AI_PROBABILITY;

  const matchId = crypto.randomUUID();

  if (useAi || eligible.length === 0) {
    const aiNickname = randomAiNickname();
    const matchData: MatchData = {
      matchId,
      mode: "ai-find",
      participants: [
        { sessionId: me.sessionId, nickname: me.nickname, isAi: false },
        { sessionId: "ai", nickname: aiNickname, isAi: true },
      ],
      createdAt: Date.now(),
    };

    await createMatch(matchData, [me.sessionId]);
    await kv.lrem(queueKey, 0, JSON.stringify(me));

    return { matchId, partnerNickname: aiNickname };
  }

  const other = eligible[0];
  const matchData: MatchData = {
    matchId,
    mode: "ai-find",
    participants: [
      { sessionId: me.sessionId, nickname: me.nickname, isAi: false },
      { sessionId: other.sessionId, nickname: other.nickname, isAi: false },
    ],
    createdAt: Date.now(),
  };

  await createMatch(matchData, [me.sessionId, other.sessionId]);
  await kv.lrem(queueKey, 0, JSON.stringify(me));
  await kv.lrem(queueKey, 0, JSON.stringify(other));

  return { matchId, partnerNickname: other.nickname };
}

export async function getMatchData(matchId: string): Promise<MatchData | null> {
  const raw = await kv.get<string>(kvKeys.match(matchId));
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function deleteMatchData(
  matchId: string,
  sessionIds: string[]
): Promise<void> {
  await kv.del(kvKeys.match(matchId));
  await kv.del(kvKeys.messages(matchId));
  for (const sessionId of sessionIds) {
    await kv.del(kvKeys.sessionMatch(sessionId));
    await kv.del(kvKeys.aiFindState(matchId, sessionId));
  }
}
