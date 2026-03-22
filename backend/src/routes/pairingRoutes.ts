import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const pairingCodes = new Map<string, { userId: string; expiresAt: Date }>();

/**
 * @swagger
 * /api/pairing/generate-code:
 *   post:
 *     tags: [Pairing]
 *     summary: Generar código de emparejamiento
 *     description: Genera un código de 6 caracteres para emparejar un dispositivo via BLE. El código expira en 5 minutos.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Código generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PairingCode'
 *       401:
 *         description: Token requerido o inválido
 */
router.post("/generate-code", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    pairingCodes.set(code, { userId: decoded.id, expiresAt });

    res.json({ code, expiresAt: expiresAt.toISOString() });
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
});

/**
 * @swagger
 * /api/pairing/register-device:
 *   post:
 *     tags: [Pairing]
 *     summary: Registrar dispositivo
 *     description: Registra un dispositivo que se conectó via BLE usando el código de emparejamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PairingRegister'
 *     responses:
 *       200:
 *         description: Dispositivo registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 device: { type: object }
 *       400:
 *         description: Código inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register-device", async (req: Request, res: Response) => {
  const { code, uuid, name, type, mqttUser, mqttPass } = req.body;

  if (!code || !uuid || !name || !type) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const pairingData = pairingCodes.get((code as string).toUpperCase());
  if (!pairingData) {
    return res.status(400).json({ error: "Código de emparejamiento inválido" });
  }

  if (new Date() > pairingData.expiresAt) {
    pairingCodes.delete(code.toUpperCase());
    return res.status(400).json({ error: "Código expirado" });
  }

  try {
    const { Device } = require("../models/Device");
    const { User } = require("../models/User");

    const existingDevice = await Device.findOne({ uuid });
    if (existingDevice) {
      existingDevice.owner = pairingData.userId;
      existingDevice.mqttUser = mqttUser;
      existingDevice.mqttPass = mqttPass;
      await existingDevice.save();
    } else {
      await Device.create({
        uuid,
        name,
        type,
        mqttUser,
        mqttPass,
        owner: pairingData.userId,
      });
    }

    pairingCodes.delete(code.toUpperCase());

    res.json({
      success: true,
      message: "Dispositivo registrado exitosamente",
      device: { uuid, name, type },
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Error interno" });
  }
});

/**
 * @swagger
 * /api/pairing/verify-code/{code}:
 *   get:
 *     tags: [Pairing]
 *     summary: Verificar código
 *     description: Verifica si un código de emparejamiento es válido
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid: { type: boolean }
 *                 reason: { type: string, description: 'Razón si no es válido' }
 */
router.get("/verify-code/:code", (req: Request, res: Response) => {
  const code = req.params.code as string;
  const pairingData = pairingCodes.get(code.toUpperCase());

  if (!pairingData) {
    return res.json({ valid: false });
  }

  if (new Date() > pairingData.expiresAt) {
    pairingCodes.delete(code.toUpperCase());
    return res.json({ valid: false, reason: "expired" });
  }

  res.json({ valid: true });
});

export default router;
