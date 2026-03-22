import { setTemperatureSchema } from "../src/validators/thermostat";
import { describe, it, expect } from "vitest";

describe("Thermostat Validators", () => {
  describe("setTemperatureSchema", () => {
    it("should pass with valid temperature and mode", () => {
      const result = setTemperatureSchema.safeParse({
        temperature: 22,
        mode: "cool",
      });
      expect(result.success).toBe(true);
    });

    it("should accept heat mode", () => {
      const result = setTemperatureSchema.safeParse({
        temperature: 25,
        mode: "heat",
      });
      expect(result.success).toBe(true);
    });

    it("should accept off mode", () => {
      const result = setTemperatureSchema.safeParse({
        temperature: 20,
        mode: "off",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with temperature below 0", () => {
      const result = setTemperatureSchema.safeParse({
        temperature: -5,
        mode: "cool",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with temperature above 50", () => {
      const result = setTemperatureSchema.safeParse({
        temperature: 55,
        mode: "cool",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with invalid mode", () => {
      const result = setTemperatureSchema.safeParse({
        temperature: 22,
        mode: "freeze",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing fields", () => {
      const result = setTemperatureSchema.safeParse({ temperature: 22 });
      expect(result.success).toBe(false);
    });
  });
});
