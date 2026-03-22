#include <Arduino.h>
#include "nvs_config.h"
#include "mqtt_client.h"
#include "wifi_provisioning.h"
#include "ble_provisioning.h"
#include "wifi_utils.h"
#include "led_strip/led_strip_device.h"
#include <esp_event.h>
#include <esp_netif.h>

#if CONFIG_OTA_ENABLED
#include <esp_https_ota.h>
#include <esp_ota_ops.h>
#endif

static const char *TAG = "main";

extern "C" void app_main(void)
{
    Serial.begin(115200);
    delay(100);
    Serial.println();
    Serial.println("=== ChIoT Firmware Starting ===");
    Serial.printf("Device Type: %s\n", CONFIG_DEVICE_TYPE);
    Serial.printf("Firmware Version: %s\n", CONFIG_FIRMWARE_VERSION);

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    esp_err_t ret = nvs_config_init();
    if (ret != ESP_OK) {
        Serial.println("Failed to init NVS config, restarting...");
        delay(1000);
        ESP.restart();
    }

    bool is_provisioned = nvs_config_is_provisioned();
    
    if (!is_provisioned) {
        Serial.println("Device not provisioned");
        Serial.println("Starting BLE provisioning mode...");
        
        ret = ble_prov_init();
        if (ret == ESP_OK) {
            char uuid_str[37];
            snprintf(uuid_str, sizeof(uuid_str), "%08x-%04x-%04x-%04x-%012llx",
                     (unsigned int)esp_random(),
                     (unsigned int)(esp_random() & 0xFFFF),
                     (unsigned int)((esp_random() & 0xFFFF) | 0x4000),
                     (unsigned int)((esp_random() & 0x3FFF) | 0x8000),
                     (unsigned long long)esp_random() << 32 | esp_random());
            
            ble_prov_set_device_info(CONFIG_DEVICE_NAME, CONFIG_DEVICE_TYPE, uuid_str);
            
            Serial.printf("BLE PIN: %s\n", ble_prov_get_pin());
            Serial.printf("Device UUID: %s\n", uuid_str);
            
            ble_prov_start();
            
            while (!ble_prov_has_complete_config()) {
                delay(100);
                if (!ble_prov_is_running()) {
                    Serial.println("BLE provisioning stopped");
                    break;
                }
            }
            
            if (ble_prov_has_complete_config()) {
                Serial.println("Config received via BLE");
                
                const ble_complete_config_t* config = ble_prov_get_complete_config();
                Serial.printf("SSID: %s\n", config->ssid);
                Serial.printf("Pairing Code: %s\n", config->pairing_code);
                
                Serial.println("Connecting to WiFi...");
                ret = wifi_connect(config->ssid, config->password);
                
                if (ret == ESP_OK) {
                    Serial.println("WiFi connected!");
                    
                    int retries = 0;
                    while (!wifi_is_connected() && retries < 30) {
                        delay(1000);
                        retries++;
                        Serial.printf("Waiting for IP... (%d)\n", retries);
                    }
                    
                    if (wifi_is_connected()) {
                        Serial.println("Got IP! Registering with backend...");
                        
                        ret = ble_prov_register_with_backend();
                        if (ret == ESP_OK) {
                            Serial.println("Device registered successfully!");
                            nvs_config_save_wifi();
                            nvs_config_set_provisioned(true);
                        } else {
                            Serial.println("Backend registration failed");
                        }
                    } else {
                        Serial.println("Failed to get IP");
                    }
                } else {
                    Serial.println("WiFi connection failed");
                }
            }
            
            ble_prov_deinit();
        } else {
            Serial.println("BLE init failed, falling back to WiFi AP mode");
            wifi_provisioning_start();
        }
    } else {
        Serial.println("Device already provisioned");
        Serial.println("Connecting to saved WiFi...");
        
        ret = wifi_connect_provisioned();
        if (ret != ESP_OK) {
            Serial.println("Failed to connect, starting AP mode...");
            wifi_provisioning_start();
        }
    }

    ret = mqtt_app_start();
    if (ret != ESP_OK) {
        Serial.println("Failed to start MQTT client");
    }

    led_strip_init();

#if CONFIG_OTA_ENABLED
    Serial.println("OTA updates enabled");
#endif

    Serial.println("=== Initialization Complete ===");
}

void setup() {
    app_main();
}

void loop() {
    delay(10);
}
