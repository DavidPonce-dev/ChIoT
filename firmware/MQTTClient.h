#ifndef MQTT_CLIENT_HANDLER_H
#define MQTT_CLIENT_HANDLER_H

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>

typedef std::function<void(const char* action, const char* payload)> CommandCallback;

class MQTTClientHandler {
public:
    MQTTClientHandler();
    
    void setServer(const char* broker, uint16_t port);
    void setCredentials(const char* username, const char* password);
    void setDeviceUUID(const char* uuid);
    void setCommandCallback(CommandCallback callback);
    
    bool connect();
    void disconnect();
    bool isConnected();
    void loop();
    bool publish(const char* topic, const char* payload);
    bool publishState(const char* stateJSON);
    
    const char* getCommandTopic();
    const char* getStateTopic();
    const char* getOnlineTopic();

private:
    WiFiClient espClient;
    PubSubClient client;
    
    char deviceUUID[37];
    char mqttUsername[64];
    char mqttPassword[64];
    char brokerURL[128];
    uint16_t brokerPort;
    
    CommandCallback commandCallback;
    
    void callback(char* topic, byte* payload, unsigned int length);
    static void callbackStatic(MQTTClientHandler* instance, char* topic, byte* payload, unsigned int length);
};

#endif
