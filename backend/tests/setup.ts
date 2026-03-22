import { vi } from "vitest";

vi.mock("../src/config/db", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/mqttClient", () => ({
  connectMQTT: vi.fn().mockResolvedValue({}),
  mqttClient: { publish: vi.fn() },
}));

process.env.JWT_SECRET = "test-secret-key";
process.env.MONGO_URI = "mongodb://localhost:27017/test";
process.env.MQTT_BROKER = "mqtt://localhost:1883";
process.env.MQTT_USER = "test";
process.env.MQTT_PASS = "test";
process.env.PORT = "3001";
