#ifndef MQTT_ACTIONS_H
#define MQTT_ACTIONS_H

#define MQTT_ACTION_SET_COLOR "set_color"
#define MQTT_ACTION_SET_BRIGHTNESS "set_brightness"
#define MQTT_ACTION_SET_MODE "set_mode"
#define MQTT_ACTION_SET_SPEED "set_speed"
#define MQTT_ACTION_TURN_ON "turn_on"
#define MQTT_ACTION_TURN_OFF "turn_off"
#define MQTT_ACTION_SET_TEMPERATURE "set_temperature"
#define MQTT_ACTION_REQUEST_READING "request_reading"
#define MQTT_ACTION_LOCK "lock"
#define MQTT_ACTION_UNLOCK "unlock"

typedef enum {
    MQTT_ACTION_ID_SET_COLOR,
    MQTT_ACTION_ID_SET_BRIGHTNESS,
    MQTT_ACTION_ID_SET_MODE,
    MQTT_ACTION_ID_SET_SPEED,
    MQTT_ACTION_ID_TURN_ON,
    MQTT_ACTION_ID_TURN_OFF,
    MQTT_ACTION_ID_SET_TEMPERATURE,
    MQTT_ACTION_ID_REQUEST_READING,
    MQTT_ACTION_ID_LOCK,
    MQTT_ACTION_ID_UNLOCK,
    MQTT_ACTION_ID_UNKNOWN
} mqtt_action_id_t;

const char* mqtt_action_id_to_string(mqtt_action_id_t action);
mqtt_action_id_t string_to_mqtt_action(const char* action_str);

#endif
