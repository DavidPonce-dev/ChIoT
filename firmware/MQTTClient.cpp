#include "MQTTClient.h"
#include "Config.h"
#include <ArduinoJson.h>

MQTTClientHandler::MQTTClientHandler() : client(espClient) {
    deviceUUID[0] = '\0';
    mqttUsername[0] = '\0';
    mqttPassword[0] = '\0';
    brokerPort = 1883;
}

void MQTTClientHandler::setServer(const char* broker, uint16_t port) {
    strncpy(brokerURL, broker, sizeof(brokerURL) - 1);
    brokerPort = port;
    client.setServer(broker, port);
}

void MQTTClientHandler::setCredentials(const char* username, const char* password) {
    if (username) strncpy(mqttUsername, username, sizeof(mqttUsername) - 1);
    if (password) strncpy(mqttPassword, password, sizeof(mqttPassword) - 1);
}

void MQTTClientHandler::setDeviceUUID(const char* uuid) {
    if (uuid) {
        strncpy(deviceUUID, uuid, sizeof(deviceUUID) - 1);
    }
}

void MQTTClientHandler::setCommandCallback(CommandCallback callback) {
    commandCallback = callback;
}

bool MQTTClientHandler::connect() {
    if (strlen(deviceUUID) == 0) {
        Serial.println("[MQTT] UUID not set");
        return false;
    }
    
    if (strlen(mqttUsername) == 0 || strlen(mqttPassword) == 0) {
        Serial.println("[MQTT] Credentials not set");
        return false;
    }
    
    char clientID[64];
    snprintf(clientID, sizeof(clientID), "chiot_%s", deviceUUID);
    
    Serial.printf("[MQTT] Connecting to %s:%d as %s...\n", brokerURL, brokerPort, clientID);
    
    client.setCallback([this](char* topic, byte* payload, unsigned int length) {
        this->callback(topic, payload, length);
    });
    
    bool connected = client.connect(clientID, mqttUsername, mqttPassword);
    
    if (connected) {
        Serial.println("[MQTT] Connected!");
        
        char commandTopic[64];
        snprintf(commandTopic, sizeof(commandTopic), "%s/%s/command", MQTT_TOPIC_PREFIX, deviceUUID);
        client.subscribe(commandTopic);
        Serial.printf("[MQTT] Subscribed to: %s\n", commandTopic);
        
        publish(getOnlineTopic(), deviceUUID);
    } else {
        Serial.printf("[MQTT] Connection failed, rc=%d\n", client.state());
    }
    
    return connected;
}

void MQTTClientHandler::disconnect() {
    client.disconnect();
}

bool MQTTClientHandler::isConnected() {
    return client.connected();
}

void MQTTClientHandler::loop() {
    if (!client.loop()) {
        Serial.println("[MQTT] Loop failed, reconnecting...");
        connect();
    }
}

bool MQTTClientHandler::publish(const char* topic, const char* payload) {
    if (!isConnected()) {
        return false;
    }
    
    bool success = client.publish(topic, payload);
    if (!success) {
        Serial.println("[MQTT] Publish failed");
    }
    return success;
}

bool MQTTClientHandler::publishState(const char* stateJSON) {
    return publish(getStateTopic(), stateJSON);
}

const char* MQTTClientHandler::getCommandTopic() {
    static char topic[64];
    snprintf(topic, sizeof(topic), "%s/%s/command", MQTT_TOPIC_PREFIX, deviceUUID);
    return topic;
}

const char* MQTTClientHandler::getStateTopic() {
    static char topic[64];
    snprintf(topic, sizeof(topic), "%s/%s/state", MQTT_TOPIC_PREFIX, deviceUUID);
    return topic;
}

const char* MQTTClientHandler::getOnlineTopic() {
    return "devices/online";
}

void MQTTClientHandler::callback(char* topic, byte* payload, unsigned int length) {
    char message[512];
    unsigned int msgLen = length < sizeof(message) - 1 ? length : sizeof(message) - 1;
    memcpy(message, payload, msgLen);
    message[msgLen] = '\0';
    
    Serial.printf("[MQTT] Message on %s: %s\n", topic, message);
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
        Serial.printf("[MQTT] JSON parse error: %s\n", error.c_str());
        return;
    }
    
    const char* action = doc["action"];
    if (action && commandCallback) {
        String payloadStr;
        serializeJson(doc["payload"], payloadStr);
        commandCallback(action, payloadStr.c_str());
    }
}

void MQTTClientHandler::callbackStatic(MQTTClientHandler* instance, char* topic, byte* payload, unsigned int length) {
    instance->callback(topic, payload, length);
}
