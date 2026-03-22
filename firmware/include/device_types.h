#ifndef DEVICE_TYPES_H
#define DEVICE_TYPES_H

#define DEVICE_TYPE_LED_STRIP "LED_STRIP"
#define DEVICE_TYPE_THERMOSTAT "thermostat"
#define DEVICE_TYPE_SMART_LOCK "smart_lock"
#define DEVICE_TYPE_SENSOR "sensor"

typedef enum {
    DEVICE_TYPE_ID_LED_STRIP,
    DEVICE_TYPE_ID_THERMOSTAT,
    DEVICE_TYPE_ID_SMART_LOCK,
    DEVICE_TYPE_ID_SENSOR
} device_type_id_t;

typedef enum {
    LED_MODE_STATIC,
    LED_MODE_RAINBOW,
    LED_MODE_FIRE,
    LED_MODE_WAVE,
    LED_MODE_CANDLE
} led_mode_t;

typedef enum {
    THERMOSTAT_MODE_OFF,
    THERMOSTAT_MODE_COOL,
    THERMOSTAT_MODE_HEAT
} thermostat_mode_t;

const char* device_type_id_to_string(device_type_id_t type);
const char* led_mode_to_string(led_mode_t mode);
const char* thermostat_mode_to_string(thermostat_mode_t mode);
device_type_id_t string_to_device_type(const char* type_str);
led_mode_t string_to_led_mode(const char* mode_str);
thermostat_mode_t string_to_thermostat_mode(const char* mode_str);

#endif
