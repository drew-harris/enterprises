import type { User } from "./types.ts";

console.log("hello world");

export function greet(user: User) {
  return `Hello ${user.name}!`;
}
