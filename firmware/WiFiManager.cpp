#include "WiFiManager.h"
#include "Config.h"

WiFiManager::WiFiManager() : lastAttempt(0), reconnectAttempts(0), spiffsInitialized(false) {}

bool WiFiManager::initSPIFFS() {
    if (spiffsInitialized) {
        return true;
    }
    if (SPIFFS.begin(true)) {
        spiffsInitialized = true;
        return true;
    }
    Serial.println("[SPIFFS] Mount failed, formatting...");
    if (SPIFFS.begin(false)) {
        spiffsInitialized = true;
        return true;
    }
    Serial.println("[SPIFFS] Mount failed after format!");
    return false;
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

bool WiFiManager::connect() {
    char ssid[32] = {0};
    char password[64] = {0};
    
    if (!loadCredentials(ssid, sizeof(ssid), password, sizeof(password))) {
        Serial.println("[WiFi] No saved credentials");
        return false;
    }
    
    return connect(ssid, password);
}

bool WiFiManager::connect(const char* ssid, const char* password) {
    if (strlen(ssid) == 0) {
        Serial.println("[WiFi] SSID is empty");
        return false;
    }
    
    Serial.printf("[WiFi] Connecting to: %s\n", ssid);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    
    unsigned long startTime = millis();
    while (!isConnected() && millis() - startTime < WIFI_CONNECT_TIMEOUT) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    
    if (isConnected()) {
        Serial.printf("[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
        reconnectAttempts = 0;
        saveCredentials(ssid, password);
        setProvisioned(true);
        return true;
    }
    
    Serial.println("[WiFi] Connection failed");
    reconnectAttempts++;
    return false;
}

void WiFiManager::disconnect() {
    WiFi.disconnect(true);
}

String WiFiManager::getIP() {
    return WiFi.localIP().toString();
}

String WiFiManager::getMAC() {
    return WiFi.macAddress();
}

String WiFiManager::getSSID() {
    return WiFi.SSID();
}

bool WiFiManager::isProvisioned() {
    if (!initSPIFFS()) return false;
    
    if (!SPIFFS.exists("/provisioned.txt")) {
        return false;
    }
    
    File file = SPIFFS.open("/provisioned.txt", FILE_READ);
    if (!file) return false;
    
    String content = file.readString();
    file.close();
    
    return content.indexOf("true") >= 0;
}

void WiFiManager::setProvisioned(bool value) {
    if (!initSPIFFS()) return;
    
    File file = SPIFFS.open("/provisioned.txt", FILE_WRITE);
    if (!file) {
        Serial.println("[SPIFFS] Failed to open provisioned.txt");
        return;
    }
    
    file.print(value ? "true" : "false");
    file.close();
    Serial.println("[SPIFFS] Provisioned status saved");
}

void WiFiManager::saveCredentials(const char* ssid, const char* password) {
    if (!initSPIFFS()) return;
    
    File file = SPIFFS.open("/wifi_creds.txt", FILE_WRITE);
    if (!file) {
        Serial.println("[SPIFFS] Failed to open wifi_creds.txt");
        return;
    }
    
    file.printf("ssid=%s\n", ssid);
    file.printf("password=%s\n", password);
    file.close();
    Serial.println("[SPIFFS] WiFi credentials saved");
}

bool WiFiManager::loadCredentials(char* ssid, size_t ssidLen, char* password, size_t passLen) {
    if (!initSPIFFS()) return false;
    
    if (!SPIFFS.exists("/wifi_creds.txt")) {
        return false;
    }
    
    File file = SPIFFS.open("/wifi_creds.txt", FILE_READ);
    if (!file) return false;
    
    String content = file.readString();
    file.close();
    
    int ssidStart = content.indexOf("ssid=") + 5;
    int ssidEnd = content.indexOf("\n", ssidStart);
    int passStart = content.indexOf("password=") + 9;
    int passEnd = content.length();
    
    if (ssidStart < 5 || passStart < 9) {
        return false;
    }
    
    String ssidStr = content.substring(ssidStart, ssidEnd);
    String passStr = content.substring(passStart, passEnd);
    
    ssidStr.trim();
    passStr.trim();
    
    if (ssidStr.length() == 0) {
        return false;
    }
    
    ssidStr.toCharArray(ssid, ssidLen);
    passStr.toCharArray(password, passLen);
    return true;
}
