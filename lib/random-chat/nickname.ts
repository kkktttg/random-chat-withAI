import { ANIMALS } from "./constants";

export function generateNickname(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  return `익명의${animal}${number}`;
}
