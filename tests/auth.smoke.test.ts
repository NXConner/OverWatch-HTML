import { describe, expect, it } from "vitest";
import { parseBody, signupSchema } from "../lib/validators";

describe("auth schema smoke", () => {
  it("accepts valid signup payload", () => {
    const result = parseBody(signupSchema, {
      email: "admin@example.com",
      password: "VeryStrongPass123!",
      name: "Ops Admin",
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak signup payload", () => {
    const result = parseBody(signupSchema, {
      email: "invalid-email",
      password: "123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Valid email required");
    }
  });
});
