#include "device_types.h"
#include <string.h>
#include <string.h>

const char* device_type_id_to_string(device_type_id_t type) {
    switch (type) {
        case DEVICE_TYPE_ID_LED_STRIP: return DEVICE_TYPE_LED_STRIP;
        case DEVICE_TYPE_ID_THERMOSTAT: return DEVICE_TYPE_THERMOSTAT;
        case DEVICE_TYPE_ID_SMART_LOCK: return DEVICE_TYPE_SMART_LOCK;
        case DEVICE_TYPE_ID_SENSOR: return DEVICE_TYPE_SENSOR;
        default: return "unknown";
    }
}

const char* led_mode_to_string(led_mode_t mode) {
    switch (mode) {
        case LED_MODE_STATIC: return "static";
        case LED_MODE_RAINBOW: return "rainbow";
        case LED_MODE_FIRE: return "fire";
        case LED_MODE_WAVE: return "wave";
        case LED_MODE_CANDLE: return "candle";
        default: return "static";
    }
}

const char* thermostat_mode_to_string(thermostat_mode_t mode) {
    switch (mode) {
        case THERMOSTAT_MODE_OFF: return "off";
        case THERMOSTAT_MODE_COOL: return "cool";
        case THERMOSTAT_MODE_HEAT: return "heat";
        default: return "off";
    }
}

device_type_id_t string_to_device_type(const char* type_str) {
    if (strcmp(type_str, DEVICE_TYPE_LED_STRIP) == 0) return DEVICE_TYPE_ID_LED_STRIP;
    if (strcmp(type_str, DEVICE_TYPE_THERMOSTAT) == 0) return DEVICE_TYPE_ID_THERMOSTAT;
    if (strcmp(type_str, DEVICE_TYPE_SMART_LOCK) == 0) return DEVICE_TYPE_ID_SMART_LOCK;
    if (strcmp(type_str, DEVICE_TYPE_SENSOR) == 0) return DEVICE_TYPE_ID_SENSOR;
    return DEVICE_TYPE_ID_LED_STRIP;
}

led_mode_t string_to_led_mode(const char* mode_str) {
    if (strcmp(mode_str, "static") == 0) return LED_MODE_STATIC;
    if (strcmp(mode_str, "rainbow") == 0) return LED_MODE_RAINBOW;
    if (strcmp(mode_str, "fire") == 0) return LED_MODE_FIRE;
    if (strcmp(mode_str, "wave") == 0) return LED_MODE_WAVE;
    if (strcmp(mode_str, "candle") == 0) return LED_MODE_CANDLE;
    return LED_MODE_STATIC;
}

thermostat_mode_t string_to_thermostat_mode(const char* mode_str) {
    if (strcmp(mode_str, "off") == 0) return THERMOSTAT_MODE_OFF;
    if (strcmp(mode_str, "cool") == 0) return THERMOSTAT_MODE_COOL;
    if (strcmp(mode_str, "heat") == 0) return THERMOSTAT_MODE_HEAT;
    return THERMOSTAT_MODE_OFF;
}
