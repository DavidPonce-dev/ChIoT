# ChIoT Firmware for Arduino IDE

Firmware para dispositivos ESP32 compatible con la plataforma ChIoT IoT.

## Requisitos

- **Arduino IDE** 1.8.x o superior
- **Arduino ESP32 Core** 2.0.x o superior
- **Placa:** ESP32 Dev Module

## Instalacion

### 1. Instalar Arduino ESP32 Core

1. En Arduino IDE, ir a `Archivo > Preferencias`
2. En "URLs Adicionales de Gestor de Tarjetas", agregar:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Ir a `Herramientas > Placa > Gestor de Tarjetas`
4. Buscar "ESP32" e instalar "esp32 by Espressif Systems"

### 2. Instalar Librerias Necesarias

En `Sketch > Incluir Libreria > Gestionar Librerias`, instalar:

- **PubSubClient** by Nick O'Leary
- **ArduinoJson** by Benoit Blanchon
- **NimBLE-Arduino** (para BLE, incluido en ESP32 core)

### 3. Configurar la Placa

1. Ir a `Herramientas > Placa > ESP32 Arduino`
2. Seleccionar **ESP32 Dev Module**

Configuracion recomendada:
- **Upload Speed:** 921600
- **CPU Frequency:** 240MHz
- **Flash Size:** 4MB (o 8MB si disponible)
- **Partition Scheme:** Default with spiffs (o "No OTA (2MB APP/2MB SPIFFS)")

### 4. Configurar WiFi y MQTT

Crear un archivo `secrets.h` en la carpeta del sketch:

```cpp
#ifndef SECRETS_H
#define SECRETS_H

#define WIFI_SSID "tu_wifi_ssid"
#define WIFI_PASSWORD "tu_wifi_password"

#define MQTT_BROKER_URL "mqtt://192.168.1.100:1883"
#define MQTT_USERNAME "tu_mqtt_usuario"
#define MQTT_PASSWORD "tu_mqtt_password"

#define BACKEND_URL "http://192.168.1.100:8080"

#endif
```

O configurarlos directamente en `Config.h`:

```cpp
#define WIFI_SSID "tu_wifi_ssid"
#define WIFI_PASSWORD "tu_wifi_password"
#define MQTT_BROKER_URL "mqtt://192.168.1.100:1883"
#define MQTT_USERNAME "tu_mqtt_usuario"
#define MQTT_PASSWORD "tu_mqtt_password"
#define BACKEND_URL "http://192.168.1.100:8080"
```

## Carga del Firmware

1. Conectar el ESP32 al computador
2. Seleccionar el puerto COM correcto en `Herramientas > Puerto`
3. Hacer clic en "Subir" (Ctrl+U)

## Estructura del Proyecto

```
firmware/
├── ChIoT_Firmware.ino    # Sketch principal
├── Config.h              # Configuracion general
├── Config.cpp
├── WiFiManager.h         # Gestion de WiFi
├── WiFiManager.cpp
├── LEDStrip.h            # Control de tira LED RGB
├── LEDStrip.cpp
├── MQTTClient.h          # Cliente MQTT
├── MQTTClient.cpp
├── BLEProvision.h        # Aprovisionamiento BLE
├── BLEProvision.cpp
└── README.md
```

## Funcionalidades

### Aprovisionamiento BLE
- El dispositivo genera automaticamente un codigo de emparejamiento
- La app movil se conecta via BLE para configurar WiFi y registrar el dispositivo
- Una vez aprovisionado, guarda las credenciales en memoria no volatil
- **Encriptacion BLE habilitada** para seguridad de credenciales
- **Notificaciones de estado en tiempo real** para feedback al usuario

### Estados de Aprovisionamiento (via BLE Notifications)
| Estado | Valor | Descripcion |
|--------|-------|-------------|
| IDLE | 0 | Esperando datos |
| CONNECTING_WIFI | 1 | Conectando a WiFi |
| WIFI_CONNECTED | 2 | WiFi conectado exitosamente |
| WIFI_FAILED | 3 | Error al conectar WiFi |
| REGISTERING | 4 | Registrando en el servidor |
| REGISTERED | 5 | Dispositivo registrado |
| ERROR | 99 | Error general |

### Control LED
- **set_color:** Cambiar color (ej: `{"color":"#FF0000"}`)
- **set_brightness:** Ajustar brillo (ej: `{"brightness":50}`)
- **set_mode:** Cambiar modo (static, rainbow, fire, wave, candle)
- **turn_on/turn_off:** Encender/apagar
- **toggle:** Alternar estado

### MQTT
- Suscribe a `devices/{uuid}/command` para recibir comandos
- Publica estado en `devices/{uuid}/state`
- Publica "online" en `devices/online` al conectar

## Protocolo de Comandos

### LED Strip Commands

```json
// Encender
{"action": "turn_on"}

// Apagar
{"action": "turn_off"}

// Cambiar color
{"action": "set_color", "payload": {"color": "#FF5500"}}

// Ajustar brillo (0-100)
{"action": "set_brightness", "payload": {"brightness": 75}}

// Cambiar modo
{"action": "set_mode", "payload": {"mode": "rainbow"}}

// Modos disponibles: static, rainbow, fire, wave, candle
```

### Respuesta de Estado

```json
{
  "power": true,
  "brightness": 100,
  "color": "#FF5500",
  "mode": "static",
  "speed": 128
}
```

## Solucion de Problemas

### Error "Failed to connect"
- Verificar que el cable USB soporte datos
- Mantener presionado el boton BOOT mientras se sube el sketch
- Reducir la velocidad de upload a 115200

### BLE no funciona
- Verificar que el dispositivo tenga Bluetooth
- Cercania: mantener el telefono cerca del ESP32
- Reiniciar el dispositivo

### MQTT no conecta
- Verificar credenciales en Config.h
- Verificar que el broker MQTT este corriendo
- Verificar que la IP/hostname sea accesible desde el ESP32

## Licencia

MIT
