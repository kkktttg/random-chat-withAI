import { describe, it, expect } from "vitest";
import { generateNickname } from "@/lib/random-chat/nickname";
import { ANIMALS } from "@/lib/random-chat/constants";

describe("generateNickname", () => {
  it("returns a string starting with 익명의", () => {
    const nickname = generateNickname();
    expect(nickname).toMatch(/^익명의/);
  });

  it("contains an animal name", () => {
    const nickname = generateNickname();
    const hasAnimal = ANIMALS.some((animal) => nickname.includes(animal));
    expect(hasAnimal).toBe(true);
  });

  it("ends with a number between 1 and 99", () => {
    const nickname = generateNickname();
    const match = nickname.match(/(\d+)$/);
    expect(match).not.toBeNull();
    const num = parseInt(match![1], 10);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(99);
  });

  it("generates different nicknames on multiple calls", () => {
    const nicknames = new Set(Array.from({ length: 20 }, () => generateNickname()));
    expect(nicknames.size).toBeGreaterThan(1);
  });
});
