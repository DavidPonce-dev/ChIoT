#ifndef BLE_PROVISIONING_H
#define BLE_PROVISIONING_H

#include <stdint.h>
#include <stdbool.h>
#include <esp_err.h>

#ifdef __cplusplus
extern "C" {
#endif

#define BLE_PIN_LENGTH 6
#define PAIRING_CODE_LENGTH 6

typedef enum {
    BLE_STATE_IDLE,
    BLE_STATE_WAITING_CREDENTIALS,
    BLE_STATE_CONNECTING,
    BLE_STATE_PROVISIONED,
    BLE_STATE_ERROR
} ble_state_t;

typedef enum {
    BLE_PROV_SUCCESS,
    BLE_PROV_INVALID_SSID,
    BLE_PROV_INVALID_PASSWORD,
    BLE_PROV_INVALID_CODE,
    BLE_PROV_WIFI_CONNECT_FAILED,
    BLE_PROV_TIMEOUT,
    BLE_PROV_CANCELLED,
    BLE_PROV_REGISTRATION_FAILED
} ble_prov_result_t;

typedef struct {
    char ssid[33];
    char password[65];
} ble_wifi_credentials_t;

typedef struct {
    char ssid[33];
    char password[65];
    char pairing_code[PAIRING_CODE_LENGTH + 1];
    char device_uuid[37];
    char device_name[64];
    char device_type[32];
} ble_complete_config_t;

typedef void (*ble_prov_callback_t)(ble_prov_result_t result, void *user_data);
typedef void (*ble_state_callback_t)(ble_state_t state, void *user_data);

esp_err_t ble_prov_init(void);
esp_err_t ble_prov_deinit(void);
esp_err_t ble_prov_start(void);
esp_err_t ble_prov_stop(void);
bool ble_prov_is_running(void);

void ble_prov_set_pin(const char *pin);
const char* ble_prov_get_pin(void);
void ble_prov_generate_pin(void);

void ble_prov_set_pairing_code(const char *code);
const char* ble_prov_get_pairing_code(void);

void ble_prov_set_device_info(const char *name, const char *type, const char *uuid);
bool ble_prov_has_complete_config(void);
const ble_complete_config_t* ble_prov_get_complete_config(void);
void ble_prov_clear_config(void);

void ble_prov_register_result_callback(ble_prov_callback_t callback, void *user_data);
void ble_prov_register_state_callback(ble_state_callback_t callback, void *user_data);

const char* ble_state_to_string(ble_state_t state);
const char* ble_result_to_string(ble_prov_result_t result);

#ifdef __cplusplus
}
#endif

#endif
