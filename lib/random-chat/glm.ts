import {
  AI_RESPONSE_MIN_DELAY_MS,
  AI_RESPONSE_MAX_DELAY_MS,
} from "./constants";

const GLM_API_URL =
  "https://api.z.ai/api/coding/paas/v4/chat/completions";

const SYSTEM_PROMPT = `당신은 랜덤채팅에서 대화하는 한국인입니다.
규칙:
- 반드시 한국어로 대화하세요
- 캐주얼하고 자연스럽게 대화하세요 (존댓말/반말 혼용 가능)
- 절대 AI라는 것을 밝히지 마세요
- 사람처럼 짧고 자연스러운 응답을 하세요 (1~3문장)
- 이모지를 적당히 사용해도 됩니다
- 상대방의 말에 공감하고 반응하세요`;

export interface GlmMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getAiResponse(
  messages: GlmMessage[],
  applyDelay = true
): Promise<string> {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) {
    throw new Error("GLM_API_KEY is not set");
  }

  if (applyDelay) {
    const delay =
      AI_RESPONSE_MIN_DELAY_MS +
      Math.random() * (AI_RESPONSE_MAX_DELAY_MS - AI_RESPONSE_MIN_DELAY_MS);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const response = await fetch(GLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "glm-4.6",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1500,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GLM API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content ?? "...";
}

export async function streamAiResponse(
  messages: GlmMessage[],
  applyDelay = true
): Promise<string> {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) {
    throw new Error("GLM_API_KEY is not set");
  }

  if (applyDelay) {
    const delay =
      AI_RESPONSE_MIN_DELAY_MS +
      Math.random() * (AI_RESPONSE_MAX_DELAY_MS - AI_RESPONSE_MIN_DELAY_MS);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const response = await fetch(GLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "glm-4.6",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1500,
      temperature: 0.9,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GLM API error: ${response.status} ${errText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) fullText += delta;
      } catch {
        // ignore parse errors
      }
    }
  }

  return fullText || "...";
}
