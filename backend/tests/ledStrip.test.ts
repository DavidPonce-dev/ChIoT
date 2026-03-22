import {
  createLedStripSchema,
  updateLedStripSchema,
  ledStripModes,
} from "../src/validators/ledStrip";
import { describe, it, expect } from "vitest";

describe("LedStrip Validators", () => {
  describe("createLedStripSchema", () => {
    it("should pass with required fields", () => {
      const result = createLedStripSchema.safeParse({ name: "My LED Strip" });
      expect(result.success).toBe(true);
    });

    it("should pass with all optional fields", () => {
      const result = createLedStripSchema.safeParse({
        name: "My LED Strip",
        brightness: 80,
        color: "#FF5500",
        mode: "rainbow",
        speed: 150,
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid color format", () => {
      const result = createLedStripSchema.safeParse({
        name: "My LED Strip",
        color: "red",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with brightness out of range", () => {
      const result = createLedStripSchema.safeParse({
        name: "My LED Strip",
        brightness: 150,
      });
      expect(result.success).toBe(false);
    });

    it("should fail with invalid mode", () => {
      const result = createLedStripSchema.safeParse({
        name: "My LED Strip",
        mode: "invalid_mode",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateLedStripSchema", () => {
    it("should pass with single field update", () => {
      const result = updateLedStripSchema.safeParse({ brightness: 50 });
      expect(result.success).toBe(true);
    });

    it("should fail with empty update", () => {
      const result = updateLedStripSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept all valid modes", () => {
      for (const mode of ledStripModes) {
        const result = updateLedStripSchema.safeParse({ mode });
        expect(result.success).toBe(true);
      }
    });
  });
});
