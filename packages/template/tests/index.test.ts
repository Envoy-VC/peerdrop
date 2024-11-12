import { hello } from "../src";
import { describe, expect, it } from 'vitest';


describe("hello", () => {
  it("should return hello", () => {
    expect(hello("world")).toBe("Hello world");
  });
});
