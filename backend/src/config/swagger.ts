import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'chiot platform API',
      version: '1.0.0',
      description:
        'Backend IoT para gestión de dispositivos inteligentes. Sistema monorepo que incluye backend API REST, MQTT para dispositivos IoT, WebSocket para notificaciones en tiempo real, y BLE provisioning para configuración de dispositivos.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'http://backend:8080',
        description: 'Servidor Docker',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Autenticación de usuarios' },
      { name: 'Devices', description: 'Gestión general de dispositivos' },
      { name: 'LED Strips', description: 'Control de tiras LED' },
      { name: 'Thermostats', description: 'Control de termostatos' },
      { name: 'Smart Locks', description: 'Control de cerraduras inteligentes' },
      { name: 'Sensors', description: 'Gestión de sensores' },
      { name: 'Pairing', description: 'Emparejamiento de dispositivos via BLE' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email', description: 'Email del usuario' },
            password: {
              type: 'string',
              format: 'password',
              description: 'Contraseña (min 8 caracteres)',
            },
          },
          required: ['email', 'password'],
        },
        UserResponse: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID del usuario' },
            email: { type: 'string', format: 'email' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'Token JWT' },
            message: { type: 'string' },
            id: { type: 'string' },
          },
        },
        Device: {
          type: 'object',
          properties: {
            uuid: { type: 'string', format: 'uuid', description: 'UUID único del dispositivo' },
            name: { type: 'string', description: 'Nombre del dispositivo' },
            type: {
              type: 'string',
              enum: ['LED_STRIP', 'thermostat', 'sensor', 'smart_lock'],
              description: 'Tipo de dispositivo',
            },
            owner: { type: 'string', nullable: true, description: 'ID del propietario' },
            state: { type: 'object', description: 'Estado actual del dispositivo' },
            mqttUser: { type: 'string', description: 'Usuario MQTT' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DeviceCreateResponse: {
          type: 'object',
          properties: {
            uuid: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            mqttUser: { type: 'string' },
            mqttPass: { type: 'string' },
          },
        },
        LedStripState: {
          type: 'object',
          properties: {
            power: { type: 'boolean', description: 'Encendido/apagado' },
            brightness: { type: 'number', minimum: 0, maximum: 100, description: 'Brillo (0-100)' },
            color: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              description: 'Color en hexadecimal',
            },
            mode: {
              type: 'string',
              enum: ['static', 'rainbow', 'fire', 'wave', 'candle'],
              description: 'Modo de operación',
            },
            speed: {
              type: 'number',
              minimum: 1,
              maximum: 255,
              description: 'Velocidad de animación',
            },
          },
        },
        LedStripUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            brightness: { type: 'number', minimum: 0, maximum: 100 },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            mode: { type: 'string', enum: ['static', 'rainbow', 'fire', 'wave', 'candle'] },
            speed: { type: 'number', minimum: 1, maximum: 255 },
          },
        },
        ThermostatState: {
          type: 'object',
          properties: {
            temperature: {
              type: 'number',
              minimum: 0,
              maximum: 50,
              description: 'Temperatura objetivo',
            },
            mode: {
              type: 'string',
              enum: ['off', 'cool', 'heat'],
              description: 'Modo de operación',
            },
          },
        },
        ThermostatSetTemp: {
          type: 'object',
          properties: {
            temperature: {
              type: 'number',
              minimum: 0,
              maximum: 50,
              description: 'Temperatura objetivo',
            },
            mode: { type: 'string', enum: ['off', 'cool', 'heat'], description: 'Modo (opcional)' },
          },
          required: ['temperature'],
        },
        SmartLockState: {
          type: 'object',
          properties: {
            locked: { type: 'boolean', description: 'Estado de bloqueo' },
            battery: { type: 'number', description: 'Nivel de batería' },
          },
        },
        SensorState: {
          type: 'object',
          properties: {
            temperature: { type: 'number', description: 'Temperatura actual' },
            humidity: { type: 'number', description: 'Humedad relativa' },
            battery: { type: 'number', description: 'Nivel de batería' },
          },
        },
        PairingCode: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Código de emparejamiento de 6 caracteres' },
            expiresAt: { type: 'string', format: 'date-time', description: 'Fecha de expiración' },
          },
        },
        PairingRegister: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Código de emparejamiento' },
            uuid: { type: 'string', description: 'UUID del dispositivo' },
            name: { type: 'string', description: 'Nombre del dispositivo' },
            type: { type: 'string', enum: ['LED_STRIP', 'thermostat', 'sensor', 'smart_lock'] },
            mqttUser: { type: 'string', description: 'Usuario MQTT' },
            mqttPass: { type: 'string', description: 'Contraseña MQTT' },
          },
          required: ['code', 'uuid', 'name', 'type'],
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            errors: {
              type: 'array',
              items: { type: 'object' },
              description: 'Errores de validación Zod',
            },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          description: 'Verifica que el servidor esté funcionando',
          responses: {
            '200': {
              description: 'Servidor activo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
