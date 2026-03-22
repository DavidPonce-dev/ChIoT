import { mqttClient } from './mqttClient';
import { logger } from './config/logger';

interface DeviceCommand {
  uuid: string;
  action: string;
  payload?: Record<string, unknown>;
}

export function publishCommand(command: DeviceCommand): Promise<boolean> {
  return new Promise((resolve) => {
    if (!mqttClient?.connected) {
      logger.warn('MQTT no conectado, comando no enviado');
      resolve(false);
      return;
    }

    const topic = `devices/${command.uuid}/command`;
    const message = JSON.stringify({
      action: command.action,
      payload: command.payload || {},
      timestamp: new Date().toISOString(),
    });

    mqttClient.publish(topic, message, (err) => {
      if (err) {
        logger.error({ err, command }, 'Error publicando comando MQTT');
        resolve(false);
      } else {
        logger.info({ command }, 'Comando MQTT enviado');
        resolve(true);
      }
    });
  });
}

export const DeviceActions = {
  LED_STRIP: {
    SET_COLOR: 'set_color',
    SET_BRIGHTNESS: 'set_brightness',
    SET_MODE: 'set_mode',
    SET_SPEED: 'set_speed',
    TURN_ON: 'turn_on',
    TURN_OFF: 'turn_off',
  },
  THERMOSTAT: {
    SET_TEMPERATURE: 'set_temperature',
    SET_MODE: 'set_mode',
    TURN_ON: 'turn_on',
    TURN_OFF: 'turn_off',
  },
  SENSOR: {
    REQUEST_READING: 'request_reading',
  },
  SMART_LOCK: {
    LOCK: 'lock',
    UNLOCK: 'unlock',
  },
} as const;
