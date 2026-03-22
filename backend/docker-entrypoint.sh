#!/bin/sh
set -e

if [ -n "$MQTT_USER" ] && [ -n "$MQTT_PASS" ]; then
    echo "Configurando usuario MQTT..."
    echo "${MQTT_USER}:${MQTT_PASS}" > /mosquitto/config/passwd
    chmod 600 /mosquitto/config/passwd
fi

exec "$@"
