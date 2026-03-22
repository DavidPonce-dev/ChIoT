#include "mqtt_actions.h"
#include <string.h>
#include <string.h>

const char* mqtt_action_id_to_string(mqtt_action_id_t action) {
    switch (action) {
        case MQTT_ACTION_ID_SET_COLOR: return MQTT_ACTION_SET_COLOR;
        case MQTT_ACTION_ID_SET_BRIGHTNESS: return MQTT_ACTION_SET_BRIGHTNESS;
        case MQTT_ACTION_ID_SET_MODE: return MQTT_ACTION_SET_MODE;
        case MQTT_ACTION_ID_SET_SPEED: return MQTT_ACTION_SET_SPEED;
        case MQTT_ACTION_ID_TURN_ON: return MQTT_ACTION_TURN_ON;
        case MQTT_ACTION_ID_TURN_OFF: return MQTT_ACTION_TURN_OFF;
        case MQTT_ACTION_ID_SET_TEMPERATURE: return MQTT_ACTION_SET_TEMPERATURE;
        case MQTT_ACTION_ID_REQUEST_READING: return MQTT_ACTION_REQUEST_READING;
        case MQTT_ACTION_ID_LOCK: return MQTT_ACTION_LOCK;
        case MQTT_ACTION_ID_UNLOCK: return MQTT_ACTION_UNLOCK;
        default: return "unknown";
    }
}

mqtt_action_id_t string_to_mqtt_action(const char* action_str) {
    if (strcmp(action_str, MQTT_ACTION_SET_COLOR) == 0) return MQTT_ACTION_ID_SET_COLOR;
    if (strcmp(action_str, MQTT_ACTION_SET_BRIGHTNESS) == 0) return MQTT_ACTION_ID_SET_BRIGHTNESS;
    if (strcmp(action_str, MQTT_ACTION_SET_MODE) == 0) return MQTT_ACTION_ID_SET_MODE;
    if (strcmp(action_str, MQTT_ACTION_SET_SPEED) == 0) return MQTT_ACTION_ID_SET_SPEED;
    if (strcmp(action_str, MQTT_ACTION_TURN_ON) == 0) return MQTT_ACTION_ID_TURN_ON;
    if (strcmp(action_str, MQTT_ACTION_TURN_OFF) == 0) return MQTT_ACTION_ID_TURN_OFF;
    if (strcmp(action_str, MQTT_ACTION_SET_TEMPERATURE) == 0) return MQTT_ACTION_ID_SET_TEMPERATURE;
    if (strcmp(action_str, MQTT_ACTION_REQUEST_READING) == 0) return MQTT_ACTION_ID_REQUEST_READING;
    if (strcmp(action_str, MQTT_ACTION_LOCK) == 0) return MQTT_ACTION_ID_LOCK;
    if (strcmp(action_str, MQTT_ACTION_UNLOCK) == 0) return MQTT_ACTION_ID_UNLOCK;
    return MQTT_ACTION_ID_UNKNOWN;
}
