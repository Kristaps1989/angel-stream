import { describe, expect, it } from "vitest";
import { normaliseApiBase } from "./config";

describe("normaliseApiBase", () => {
  it("uses the same origin when nothing is set", () => {
    expect(normaliseApiBase(null)).toBe("");
    expect(normaliseApiBase("  ")).toBe("");
  });

  it("strips trailing slashes", () => {
    expect(normaliseApiBase("https://api.example/")).toBe("https://api.example");
  });
});
