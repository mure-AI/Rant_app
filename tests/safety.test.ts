import { describe, expect, it } from "vitest";
import { detectSafetyLevel } from "@/lib/safety";

describe("detectSafetyLevel", () => {
  it("flags urgent self-harm language", () => {
    expect(detectSafetyLevel("I want to die and I might hurt myself")).toBe("urgent");
  });

  it("flags support language", () => {
    expect(detectSafetyLevel("I feel hopeless and I can't cope today")).toBe("support");
  });

  it("keeps everyday stress normal", () => {
    expect(detectSafetyLevel("I have too much work and feel behind")).toBe("normal");
  });
});
