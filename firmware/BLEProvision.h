#ifndef BLE_PROVISION_H
#define BLE_PROVISION_H

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHAR_WIFI_SSID     "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define CHAR_WIFI_PASS     "beb5483f-36e1-4688-b7f5-ea07361b26a9"
#define CHAR_PAIRING_CODE  "beb54840-36e1-4688-b7f5-ea07361b26aa"
#define CHAR_DEVICE_INFO   "beb54842-36e1-4688-b7f5-ea07361b26ac"
#define CHAR_CONTROL       "beb54841-36e1-4688-b7f5-ea07361b26ab"
#define CHAR_STATUS        "beb54843-36e1-4688-b7f5-ea07361b26ad"

enum BLEProvisionState {
    BLE_STATE_IDLE,
    BLE_STATE_WAITING,
    BLE_STATE_RECEIVED,
    BLE_STATE_ERROR
};

enum BLEProvisionStatus {
    BLE_STATUS_IDLE = 0,
    BLE_STATUS_CONNECTING_WIFI = 1,
    BLE_STATUS_WIFI_CONNECTED = 2,
    BLE_STATUS_WIFI_FAILED = 3,
    BLE_STATUS_REGISTERING = 4,
    BLE_STATUS_REGISTERED = 5,
    BLE_STATUS_ERROR = 99
};

struct BLEProvisionData {
    char ssid[33];
    char password[64];
    char pairingCode[7];
    bool complete;
};

typedef std::function<void(BLEProvisionState state)> StateCallback;
typedef std::function<void(BLEProvisionData* data)> CompleteCallback;
typedef std::function<void(BLEProvisionStatus status, const char* message)> StatusCallback;

class BLEProvision {
public:
    BLEProvision();
    
    void begin(const char* deviceName);
    void end();
    void stop();
    
    void onStateChange(StateCallback callback);
    void onComplete(CompleteCallback callback);
    void onStatusChange(StatusCallback callback);
    
    bool isRunning();
    bool hasCompleteData();
    BLEProvisionData* getData();
    void clearData();
    void updateStatus(BLEProvisionStatus status, const char* message);
    
    const char* generatePairingCode();
    String getDeviceUUID();

    void setSSID(const char* ssid);
    void setPassword(const char* password);
    void setPairingCode(const char* code);
    void completeProvisioning();

    friend class MyBLEServerCallbacks;
    friend class MyBLECharacteristicCallbacks;

private:
    BLEProvisionState state;
    BLEProvisionData provisionData;
    
    BLEServer* pServer;
    BLEService* pService;
    BLECharacteristic* pCharStatus;
    
    StateCallback stateCallback;
    CompleteCallback completeCallback;
    StatusCallback statusCallback;
    
    String deviceUUID;
    
    void setState(BLEProvisionState newState);
};

class MyBLEServerCallbacks: public BLEServerCallbacks {
public:
    MyBLEServerCallbacks(BLEProvision* provision);
    void onConnect(BLEServer* pServer);
    void onDisconnect(BLEServer* pServer);

private:
    BLEProvision* m_provision;
};

class MyBLECharacteristicCallbacks: public BLECharacteristicCallbacks {
public:
    MyBLECharacteristicCallbacks(BLEProvision* provision, const char* charUUID);
    void onWrite(BLECharacteristic* pCharacteristic);

private:
    BLEProvision* m_provision;
    const char* m_charUUID;
};

#endif
