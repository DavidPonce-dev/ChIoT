import mqtt, { MqttClient } from 'mqtt';
import dotenv from 'dotenv';
import { Device } from './models/Device';
import { logger } from './config/logger';
import { broadcastToUser } from './websocket';

dotenv.config();

let mqttClient: MqttClient;

export async function connectMQTT(): Promise<MqttClient> {
  return new Promise((resolve, reject) => {
    const options = {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
    };

    const client = mqtt.connect(process.env.MQTT_BROKER as string, options);

    client.on('connect', () => {
      logger.info('Conectado al broker MQTT');
      client.subscribe('devices/+/state');
      client.subscribe('devices/online');
      client.subscribe('devices/+/register');
      mqttClient = client;
      resolve(client);
    });

    client.on('message', async (topic, message) => {
      try {
        const parts = topic.split('/');
        
        if (parts[0] === 'devices' && parts[2] === 'state') {
          const uuid = parts[1];
          const payload = JSON.parse(message.toString());

          const device = await Device.findOne({ uuid });
          if (!device) {
            logger.warn({ uuid }, 'Mensaje de estado de dispositivo desconocido');
            return;
          }

          const updatedDevice = await Device.findOneAndUpdate({ uuid }, { state: payload }, { new: true });

          if (updatedDevice?.owner) {
            broadcastToUser(updatedDevice.owner.toString(), 'device_state_changed', {
              uuid,
              type: updatedDevice.type,
              state: payload,
            });
          }

          logger.info({ uuid, state: payload }, 'Estado actualizado');
        }
        else if (topic === 'devices/online') {
          const uuid = message.toString();
          const device = await Device.findOne({ uuid });
          
          if (device) {
            logger.info({ uuid }, 'Dispositivo conectado');
            if (device.owner) {
              broadcastToUser(device.owner.toString(), 'device_online', { uuid, online: true });
            }
          } else {
            logger.warn({ uuid }, 'Dispositivo no registrado se conectó');
          }
        }
        else if (parts[2] === 'register') {
          const uuid = parts[1];
          const payload = JSON.parse(message.toString());
          
          logger.info({ uuid, payload }, 'Solicitud de registro de dispositivo');
          
          const device = await Device.findOne({ uuid });
          if (device && device.owner) {
            broadcastToUser(device.owner.toString(), 'device_registered', { uuid, payload });
          }
        }
      } catch (err: unknown) {
        logger.error({ err, topic }, 'Error al procesar mensaje MQTT');
      }
    });

    client.on('error', (err) => {
      logger.error({ err }, 'Error MQTT');
      reject(err);
    });
  });
}

export { mqttClient };
