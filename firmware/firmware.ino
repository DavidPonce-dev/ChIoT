#include <Arduino.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>

#include "Config.h"
#include "WiFiManager.h"
#include "LEDStrip.h"
#include "MQTTClient.h"
#include "BLEProvision.h"

WiFiManager wifiManager;
LEDStrip ledStrip;
MQTTClientHandler mqttClient;
BLEProvision bleProvision;

String deviceUUID;

unsigned long lastStatePublish = 0;
unsigned long lastOTACheck = 0;

void saveMQTTCredentials(const char* username, const char* password);
bool loadMQTTCredentials(char* username, size_t userLen, char* password, size_t passLen);
bool registerWithBackend(const char* code);
void handleCommand(const char* action, const char* payload);

void setup() {
    Serial.begin(115200);
    delay(100);
    Serial.println();
    Serial.println("=================================");
    Serial.println("  ChIoT Firmware v" FIRMWARE_VERSION);
    Serial.println("  Device Type: " DEVICE_TYPE);
    Serial.println("=================================");
    
    bool spiffsMounted = SPIFFS.begin(false) || SPIFFS.begin();
    if (!spiffsMounted) {
        Serial.println("[SPIFFS] FATAL: Mount failed!");
    } else {
        Serial.println("[SPIFFS] Ready");
    }
    
    if (!wifiManager.isProvisioned()) {
        Serial.println("\n[MAIN] Device not provisioned");
        Serial.println("[MAIN] Starting BLE Provisioning...");
        
        char bleDeviceName[32];
        snprintf(bleDeviceName, sizeof(bleDeviceName), "%s%s", DEVICE_NAME_PREFIX, DEVICE_TYPE);
        bleProvision.begin(bleDeviceName);
        bleProvision.onComplete([](BLEProvisionData* data) {
            Serial.printf("[MAIN] Provisioning complete! SSID: %s\n", data->ssid);
            
            bleProvision.updateStatus(BLE_STATUS_CONNECTING_WIFI, "Connecting to WiFi...");
            
            if (wifiManager.connect(data->ssid, data->password)) {
                Serial.println("[MAIN] WiFi connected!");
                bleProvision.updateStatus(BLE_STATUS_WIFI_CONNECTED, WiFi.localIP().toString().c_str());
                
                deviceUUID = bleProvision.getDeviceUUID();
                Serial.printf("[MAIN] Device UUID: %s\n", deviceUUID.c_str());
                
                saveDeviceUUID(deviceUUID.c_str());
                
                bleProvision.updateStatus(BLE_STATUS_REGISTERING, "Registering with server...");
                
                if (registerWithBackend(data->pairingCode)) {
                    Serial.println("[MAIN] Device registered successfully!");
                    bleProvision.updateStatus(BLE_STATUS_REGISTERED, "Device registered");
                    wifiManager.setProvisioned(true);
                    delay(500);
                    bleProvision.stop();
                    bleProvision.end();
                } else {
                    Serial.println("[MAIN] Backend registration failed");
                    bleProvision.updateStatus(BLE_STATUS_ERROR, "Backend registration failed");
                }
            } else {
                Serial.println("[MAIN] WiFi connection failed");
                bleProvision.updateStatus(BLE_STATUS_WIFI_FAILED, "WiFi connection failed");
            }
        });
        
        unsigned long startTime = millis();
        Serial.println("[MAIN] Waiting for BLE provisioning...");
        while (!wifiManager.isProvisioned() && millis() - startTime < 120000) {
            delay(100);
            if (bleProvision.hasCompleteData()) {
                Serial.println("[MAIN] BLE provisioning data received!");
                break;
            }
            if (millis() - startTime > 10000 && (millis() - startTime) % 10000 < 100) {
                Serial.printf("[MAIN] Still waiting... %ds elapsed\n", (millis() - startTime) / 1000);
            }
        }
        
        if (!wifiManager.isProvisioned()) {
            Serial.println("[MAIN] Provisioning timeout, resetting...");
            delay(1000);
            ESP.restart();
        }
    } else {
        Serial.println("[MAIN] Device already provisioned");
        Serial.println("[MAIN] Connecting to saved WiFi...");
        
        char uuidBuffer[64];
        if (loadDeviceUUID(uuidBuffer, sizeof(uuidBuffer))) {
            deviceUUID = String(uuidBuffer);
        }
        
        if (!wifiManager.connect()) {
            Serial.println("[MAIN] Failed to connect, clearing provisioning...");
            wifiManager.setProvisioned(false);
            ESP.restart();
        }
    }
    
    Serial.printf("[MAIN] WiFi connected! IP: %s\n", wifiManager.getIP().c_str());
    Serial.printf("[MAIN] MAC: %s\n", wifiManager.getMAC().c_str());
    
    char mqttUser[64] = {0};
    char mqttPass[64] = {0};
    if (loadMQTTCredentials(mqttUser, sizeof(mqttUser), mqttPass, sizeof(mqttPass))) {
        mqttClient.setDeviceUUID(deviceUUID.c_str());
        mqttClient.setServer(MQTT_BROKER_URL, 1883);
        mqttClient.setCredentials(mqttUser, mqttPass);
        mqttClient.setCommandCallback(handleCommand);
        
        if (mqttClient.connect()) {
            Serial.println("[MAIN] MQTT connected!");
        } else {
            Serial.println("[MAIN] MQTT connection failed");
        }
    } else {
        Serial.println("[MAIN] No MQTT credentials found");
    }
    
    ledStrip.init();
    
    Serial.println("\n=================================");
    Serial.println("  System Initialized");
    Serial.println("=================================\n");
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        mqttClient.loop();
    }
    
    ledStrip.update();
    
    if (mqttClient.isConnected() && millis() - lastStatePublish > 5000) {
        mqttClient.publishState(ledStrip.getStateJSON().c_str());
        lastStatePublish = millis();
    }
    
#if OTA_ENABLED
    if (OTA_ENABLED && WiFi.status() == WL_CONNECTED && millis() - lastOTACheck > OTA_CHECK_INTERVAL * 1000) {
        lastOTACheck = millis();
    }
#endif
    
    delay(10);
}

void handleCommand(const char* action, const char* payload) {
    ledStrip.handleCommand(action, payload);
}

bool registerWithBackend(const char* code) {
    WiFiClient client;
    
    String url = String(BACKEND_URL) + "/api/pairing/register-device";
    
    Serial.printf("[MAIN] Registering with backend: %s\n", url.c_str());
    
    if (!client.connect(BACKEND_URL + 7, 8080)) {
        Serial.println("[MAIN] Connection to backend failed");
        return false;
    }
    
    char mqttUser[64];
    char mqttPass[64];
    snprintf(mqttUser, sizeof(mqttUser), "dev_%s", deviceUUID.c_str());
    for (int i = 0; i < 16; i++) {
        mqttPass[i] = random(32, 127);
    }
    mqttPass[16] = '\0';
    
    saveMQTTCredentials(mqttUser, mqttPass);
    
    StaticJsonDocument<512> doc;
    doc["code"] = code;
    doc["uuid"] = deviceUUID;
    char deviceName[64];
    snprintf(deviceName, sizeof(deviceName), "%s%s", DEVICE_NAME_PREFIX, DEVICE_TYPE);
    doc["name"] = deviceName;
    doc["type"] = DEVICE_TYPE;
    doc["mqttUser"] = mqttUser;
    doc["mqttPass"] = mqttPass;
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    client.println("POST /api/pairing/register-device HTTP/1.1");
    client.println("Host: " BACKEND_URL + 7);
    client.println("Content-Type: application/json");
    client.println("Content-Length: " + String(jsonPayload.length()));
    client.println();
    client.println(jsonPayload);
    
    unsigned long timeout = millis();
    while (client.available() == 0) {
        if (millis() - timeout > 10000) {
            Serial.println("[MAIN] Backend request timeout");
            client.stop();
            return false;
        }
    }
    
    String response = "";
    while (client.available()) {
        response += client.readString();
    }
    client.stop();
    
    if (response.indexOf("200") > 0 || response.indexOf("201") > 0) {
        Serial.println("[MAIN] Backend registration successful!");
        return true;
    }
    
    Serial.println("[MAIN] Backend registration failed");
    return false;
}

void saveDeviceUUID(const char* uuid) {
    File file = SPIFFS.open("/device_uuid.txt", FILE_WRITE);
    if (file) {
        file.print(uuid);
        file.close();
        Serial.println("[MAIN] Device UUID saved");
    }
}

bool loadDeviceUUID(char* uuid, size_t len) {
    if (!SPIFFS.exists("/device_uuid.txt")) {
        return false;
    }
    File file = SPIFFS.open("/device_uuid.txt", FILE_READ);
    if (!file) return false;
    
    String content = file.readString();
    file.close();
    content.trim();
    
    if (content.length() == 0) return false;
    content.toCharArray(uuid, len);
    return true;
}

void saveMQTTCredentials(const char* username, const char* password) {
    File file = SPIFFS.open("/mqtt_creds.txt", FILE_WRITE);
    if (!file) {
        Serial.println("[MAIN] Failed to save MQTT credentials");
        return;
    }
    file.printf("username=%s\n", username);
    file.printf("password=%s\n", password);
    file.close();
    Serial.println("[MAIN] MQTT credentials saved");
}

bool loadMQTTCredentials(char* username, size_t userLen, char* password, size_t passLen) {
    if (!SPIFFS.exists("/mqtt_creds.txt")) {
        return false;
    }
    File file = SPIFFS.open("/mqtt_creds.txt", FILE_READ);
    if (!file) return false;
    
    String content = file.readString();
    file.close();
    
    int userStart = content.indexOf("username=") + 9;
    int userEnd = content.indexOf("\n", userStart);
    int passStart = content.indexOf("password=") + 9;
    
    if (userStart < 9 || passStart < 9) return false;
    
    String user = content.substring(userStart, userEnd);
    String pass = content.substring(passStart);
    
    user.trim();
    pass.trim();
    
    if (user.length() == 0) return false;
    
    user.toCharArray(username, userLen);
    pass.toCharArray(password, passLen);
    return true;
}
