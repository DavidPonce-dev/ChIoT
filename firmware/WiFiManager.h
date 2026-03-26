#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <SPIFFS.h>

class WiFiManager {
public:
    WiFiManager();
    
    bool isConnected();
    bool connect();
    bool connect(const char* ssid, const char* password);
    void disconnect();
    String getIP();
    String getMAC();
    String getSSID();
    bool isProvisioned();
    void setProvisioned(bool value);
    void saveCredentials(const char* ssid, const char* password);
    bool loadCredentials(char* ssid, size_t ssidLen, char* password, size_t passLen);

private:
    unsigned long lastAttempt;
    int reconnectAttempts;
    bool spiffsInitialized;
    bool initSPIFFS();
};

#endif
