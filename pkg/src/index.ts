import { type User } from "./types.ts";

const testUser: User = {
  name: "drew",
  age: 22,
};

console.log("hello world");

export function greet(user: User) {
  return `Hello ${user.name}!`;
}
