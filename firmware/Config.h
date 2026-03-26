#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

#define DEVICE_TYPE "led_strip"
#define FIRMWARE_VERSION "1.0.1"
#define DEVICE_NAME_PREFIX "ChiotPlatform_"

#define LED_PIN_R  25
#define LED_PIN_G  26
#define LED_PIN_B  27

#define MQTT_RECONNECT_INTERVAL 5000
#define WIFI_CONNECT_TIMEOUT 30000

#ifndef WIFI_SSID
#define WIFI_SSID ""
#endif

#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD ""
#endif

#ifndef MQTT_BROKER_URL
#define MQTT_BROKER_URL "mqtt://192.168.1.100:1883"
#endif

#ifndef MQTT_USERNAME
#define MQTT_USERNAME ""
#endif

#ifndef MQTT_PASSWORD
#define MQTT_PASSWORD ""
#endif

#ifndef MQTT_TOPIC_PREFIX
#define MQTT_TOPIC_PREFIX "devices"
#endif

#ifndef BACKEND_URL
#define BACKEND_URL "http://192.168.1.100:8080"
#endif

#define OTA_ENABLED 1
#define OTA_CHECK_INTERVAL 3600
#define OTA_SERVER_URL "http://192.168.1.100:8080"

#endif
