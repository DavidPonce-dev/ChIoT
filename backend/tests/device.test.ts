import {
  createDeviceSchema,
  updateDeviceSchema,
  uuidParamSchema,
} from "../src/validators/device";
import { describe, it, expect } from "vitest";

describe("Device Validators", () => {
  describe("createDeviceSchema", () => {
    it("should pass with valid LED_STRIP type", () => {
      const result = createDeviceSchema.safeParse({
        name: "My LED Strip",
        type: "LED_STRIP",
      });
      expect(result.success).toBe(true);
    });

    it("should pass with valid thermostat type", () => {
      const result = createDeviceSchema.safeParse({
        name: "Living Room Thermostat",
        type: "thermostat",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid type", () => {
      const result = createDeviceSchema.safeParse({
        name: "My Device",
        type: "invalid_type",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with empty name", () => {
      const result = createDeviceSchema.safeParse({
        name: "",
        type: "LED_STRIP",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing fields", () => {
      const result = createDeviceSchema.safeParse({ name: "Only Name" });
      expect(result.success).toBe(false);
    });
  });

  describe("updateDeviceSchema", () => {
    it("should pass with name update", () => {
      const result = updateDeviceSchema.safeParse({ name: "New Name" });
      expect(result.success).toBe(true);
    });

    it("should pass with type update", () => {
      const result = updateDeviceSchema.safeParse({ type: "thermostat" });
      expect(result.success).toBe(true);
    });

    it("should pass with both fields", () => {
      const result = updateDeviceSchema.safeParse({
        name: "New Name",
        type: "thermostat",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with empty object", () => {
      const result = updateDeviceSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("uuidParamSchema", () => {
    it("should pass with valid UUID", () => {
      const result = uuidParamSchema.safeParse({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid UUID", () => {
      const result = uuidParamSchema.safeParse({ uuid: "not-a-uuid" });
      expect(result.success).toBe(false);
    });
  });
});
