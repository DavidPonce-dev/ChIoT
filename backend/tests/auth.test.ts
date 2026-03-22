import { registerSchema, loginSchema } from "../src/validators/auth";
import { describe, it, expect } from "vitest";

describe("Auth Validators", () => {
  describe("registerSchema", () => {
    it("should pass with valid email and password", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
      const result = registerSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with short password", () => {
      const result = registerSchema.safeParse({
        email: "test@example.com",
        password: "1234567",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing fields", () => {
      const result = registerSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should pass with valid credentials", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
