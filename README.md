# chiot platform - Sistema IoT Completo

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)

Sistema IoT completo y moderno para el hogar inteligente. Controla dispositivos ESP32/ESP8266 desde una interfaz web, app móvil, o directamente via MQTT.

---

## Puntos Fuertes

### 1. Arquitectura en Tiempo Real
- **MQTT** para comunicación bidireccional con dispositivos IoT
- **WebSocket** para actualizaciones instantáneas en el dashboard
- **Bridge MQTT-HTTP** que conecta dispositivos con clientes web

### 2. Aprovisionamiento BLE Simplificado
- Configuración de dispositivos via **Bluetooth Low Energy**
- Código PIN de 6 dígitos para seguridad
- Flujo automático: BLE → WiFi → MQTT sin intervención manual

### 3. Multi-Plataforma
- **Dashboard Web**: Next.js 15 con Tailwind CSS 4, diseño responsive y Material Design
- **App Móvil**: React Native para iOS y Android
- **Firmware**: PlatformIO compatible con ESP32 y ESP8266

### 4. Seguridad Robusta
- Autenticación con **JWT en cookies HTTP-only**
- Contraseñas encriptadas con **bcrypt**
- Rate limiting para prevenir ataques
- Validación de datos con **Zod**

### 5. APIs Documentadas
- **Swagger UI** integrado para probar endpoints
- Validación de esquemas en todas las rutas
- Tipos TypeScript compartidos entre frontend y backend

---

## Arquitectura

```
┌─────────────┐     HTTP/WebSocket     ┌─────────────┐     MQTT      ┌────────────┐
│   Browser   │◄──────────────────────►│   Backend   │◄────────────►│  Mosquitto │
│  (Frontend) │                        │  (Express)  │              │   Broker   │
└─────────────┘                        └──────┬──────┘              └─────┬──────┘
                                               │                            │
                                               │ MongoDB                     │ MQTT
                                               ▼                            ▼
                                        ┌─────────────┐              ┌────────────┐
                                        │   MongoDB   │              │ ESP32/8266 │
                                        └─────────────┘              │ (Firmware) │
                                                                       └────────────┘

┌──────────┐      HTTP       ┌─────────────┐
│  Mobile  │◄───────────────►│   Backend   │
│   App    │                 │  (Express)  │
└──────────┘                 └─────────────┘
```

---

## Tecnologías

| Componente | Stack |
|------------|-------|
| **Backend** | Express.js 5, TypeScript, MongoDB, MQTT, WebSocket |
| **Frontend Web** | Next.js 15, React 19, Tailwind CSS 4, Zustand |
| **App Móvil** | React Native 0.74, React Navigation, BLE |
| **Firmware** | ESP-IDF, PlatformIO, MQTT, BLE 5.0 |
| **Infraestructura** | Docker, Mosquitto |

---

## Dispositivos Soportados

### Tiras LED (`LED_STRIP`)
- Control de color, brillo y velocidad
- 5 modos de efectos: Static, Rainbow, Fire, Wave, Candle
- Encendido/apagado instantáneo

### Termostatos (`thermostat`)
- Control de temperatura (16°C - 30°C)
- 3 modos: Off, Cool, Heat
- Visualización en tiempo real

### Cerraduras Inteligentes (`smart_lock`)
- Bloqueo/desbloqueo remoto
- Estado en tiempo real
- Historial de actividad

### Sensores (`sensor`)
- Temperatura y humedad
- Actualizaciones periódicas
- Alertas configurables

---

## Inicio Rápido

### Requisitos
- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- PlatformIO (para compilar firmware)

### 1. Clonar y Ejecutar

```bash
git clone <repo-url>
cd chiot-platform

# Iniciar todos los servicios con Docker
npm run up

# O ejecutar localmente
npm run dev          # Backend en http://localhost:8080
npm run dev:frontend # Frontend en http://localhost:3000
```

### 2. Acceder

- **Dashboard Web**: http://localhost:3000
- **API Docs**: http://localhost:8080/api/docs
- **Health Check**: http://localhost:8080/health

### 3. Credenciales de Prueba

```
Email: admin@test.com
Password: test1234
```

---

## API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión (retorna cookie HTTP-only) |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Usuario actual |

### Dispositivos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/leds` | Listar tiras LED |
| PUT | `/api/leds/:uuid` | Actualizar LED |
| POST | `/api/thermostats/:uuid/setTemp` | Ajustar temperatura |
| POST | `/api/locks/:uuid/lock` | Bloquear cerradura |
| POST | `/api/locks/:uuid/unlock` | Desbloquear cerradura |

### Aprovisionamiento
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/pairing/generate-code` | Generar código de emparejamiento |
| POST | `/api/pairing/register-device` | Registrar dispositivo via BLE |

---

## MQTT Topics

```
devices/{uuid}/command   # Comandos del servidor al dispositivo
devices/{uuid}/state     # Estados del dispositivo (publicado por dispositivo)
devices/{uuid}/register  # Registro de dispositivo
devices/online           # Dispositivos en línea
```

---

## Estructura del Proyecto

```
chiot-platform/
├── backend/              # API REST + WebSocket + MQTT
│   └── src/
│       ├── routes/       # Endpoints de la API
│       ├── models/       # Modelos Mongoose
│       ├── middleware/    # Auth, rate limiting
│       └── mqttClient.ts # Cliente MQTT
├── frontend/             # Dashboard web (Next.js)
│   └── src/
│       ├── app/          # App Router
│       ├── components/   # Componentes UI
│       └── store/        # Zustand stores
├── app/                  # App móvil (React Native)
│   └── src/
│       ├── screens/      # Pantallas
│       └── services/     # BLE, API
├── firmware/             # Firmware ESP32 (PlatformIO)
│   └── lib/
│       ├── ble_provisioning/
│       └── mqtt_client/
├── shared/               # Tipos TypeScript compartidos
├── docker-compose.yml     # Orquestación
└── README.md
```

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Backend con hot-reload
npm run dev:frontend     # Frontend con Turbopack
npm run dev:app          # App móvil con Metro

# Build
npm run build            # Compilar backend
npm run build:frontend   # Compilar frontend
npm run build:firmware   # Compilar firmware (requiere ESP-IDF)

# Docker
npm run up               # Iniciar todos los servicios
npm run down             # Detener servicios
npm run logs             # Ver logs
npm run reset:frontend   # Reiniciar contenedor frontend

# Calidad
npm run lint             # ESLint
npm run typecheck        # TypeScript
npm run test             # Tests (Vitest)
```

---

## Provisionamiento BLE

El firmware soporta configuración via Bluetooth:

1. **Dispositivo** genera PIN de 6 dígitos
2. **App móvil** escanea dispositivos BLE cercanos
3. **Usuario** selecciona dispositivo e ingresa PIN
4. **App** envía: SSID, password WiFi, código de emparejamiento
5. **Dispositivo** valida y conecta a WiFi
6. **Dispositivo** se registra en el backend
7. **Dispositivo** inicia cliente MQTT

### UUIDs GATT
| UUID | Función |
|------|---------|
| `0xFF01` | SSID WiFi |
| `0xFF02` | Password WiFi |
| `0xFF03` | Código de emparejamiento |
| `0xFF05` | PIN |

---

## Variables de Entorno

### Backend (`backend/.env`)
```bash
PORT=8080
MONGO_URI=mongodb://localhost:27017/iot_db
JWT_SECRET=your-secret-key
MQTT_BROKER=mqtt://localhost:1883
```

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

## Contributing

1. Fork el repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcion`)
3. Commit los cambios (`git commit -m 'Agregar nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abrir un Pull Request
