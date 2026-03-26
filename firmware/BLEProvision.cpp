#include "BLEProvision.h"
#include "Config.h"

BLEProvision::BLEProvision() : state(BLE_STATE_IDLE), pServer(nullptr), pService(nullptr) {
    provisionData.ssid[0] = '\0';
    provisionData.password[0] = '\0';
    provisionData.pairingCode[0] = '\0';
    provisionData.complete = false;
}

void BLEProvision::begin(const char* deviceName) {
    Serial.println("[BLE] Starting BLE Provisioning...");
    
    BLEDevice::init(deviceName);
    BLEDevice::setPower(ESP_PWR_LVL_P9);
    
    BLEDevice::setSecurityAuth(true, true, true);
    
    deviceUUID = BLEDevice::getAddress().toString().c_str();
    deviceUUID.replace(":", "");
    
    Serial.printf("[BLE] Device UUID: %s\n", deviceUUID.c_str());
    
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyBLEServerCallbacks(this));
    
    pService = pServer->createService(SERVICE_UUID);
    
    BLECharacteristic* pCharSSID = pService->createCharacteristic(
        CHAR_WIFI_SSID,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCharSSID->setCallbacks(new MyBLECharacteristicCallbacks(this, CHAR_WIFI_SSID));
    
    BLECharacteristic* pCharPass = pService->createCharacteristic(
        CHAR_WIFI_PASS,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCharPass->setCallbacks(new MyBLECharacteristicCallbacks(this, CHAR_WIFI_PASS));
    
    BLECharacteristic* pCharCode = pService->createCharacteristic(
        CHAR_PAIRING_CODE,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCharCode->setCallbacks(new MyBLECharacteristicCallbacks(this, CHAR_PAIRING_CODE));
    
    BLECharacteristic* pCharControl = pService->createCharacteristic(
        CHAR_CONTROL,
        BLECharacteristic::PROPERTY_WRITE_NR
    );
    pCharControl->setCallbacks(new MyBLECharacteristicCallbacks(this, CHAR_CONTROL));
    
    BLECharacteristic* pCharInfo = pService->createCharacteristic(
        CHAR_DEVICE_INFO,
        BLECharacteristic::PROPERTY_READ
    );
    String deviceInfo = deviceUUID + "|" + DEVICE_TYPE;
    pCharInfo->setValue(deviceInfo.c_str());
    
    pCharStatus = pService->createCharacteristic(
        CHAR_STATUS,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pCharStatus->addDescriptor(new BLE2902());
    pCharStatus->setValue("idle");
    
    pService->start();
    
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinInterval(20);
    pAdvertising->setMaxInterval(40);
    pAdvertising->setAppearance(0x0080);
    
    delay(100);
    BLEDevice::startAdvertising();
    delay(200);
    
    Serial.printf("[BLE] Advertising started with encryption, scanning for device...\n");
    setState(BLE_STATE_WAITING);
    Serial.println("[BLE] Waiting for provisioning data...");
}

void BLEProvision::end() {
    stop();
    BLEDevice::deinit(false);
}

void BLEProvision::stop() {
    if (pServer) {
        pServer->disconnect(0);
    }
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    if (pAdvertising) {
        pAdvertising->stop();
    }
    setState(BLE_STATE_IDLE);
}

void BLEProvision::onStateChange(StateCallback callback) {
    stateCallback = callback;
}

void BLEProvision::onComplete(CompleteCallback callback) {
    completeCallback = callback;
}

void BLEProvision::onStatusChange(StatusCallback callback) {
    statusCallback = callback;
}

void BLEProvision::updateStatus(BLEProvisionStatus status, const char* message) {
    if (pCharStatus) {
        String statusStr = String(status) + "|" + message;
        pCharStatus->setValue(statusStr.c_str());
        pCharStatus->notify();
        Serial.printf("[BLE] Status update: %d - %s\n", status, message);
    }
    if (statusCallback) {
        statusCallback(status, message);
    }
}

bool BLEProvision::isRunning() {
    return pServer != nullptr && state == BLE_STATE_WAITING;
}

bool BLEProvision::hasCompleteData() {
    return provisionData.complete;
}

BLEProvisionData* BLEProvision::getData() {
    if (provisionData.complete) {
        return &provisionData;
    }
    return nullptr;
}

void BLEProvision::clearData() {
    provisionData.ssid[0] = '\0';
    provisionData.password[0] = '\0';
    provisionData.pairingCode[0] = '\0';
    provisionData.complete = false;
    setState(BLE_STATE_IDLE);
}

void BLEProvision::setSSID(const char* ssid) {
    strncpy(provisionData.ssid, ssid, 32);
    provisionData.ssid[32] = '\0';
    Serial.printf("[BLE] Received SSID: %s\n", provisionData.ssid);
}

void BLEProvision::setPassword(const char* password) {
    strncpy(provisionData.password, password, 63);
    provisionData.password[63] = '\0';
    Serial.println("[BLE] Received WiFi password");
}

void BLEProvision::setPairingCode(const char* code) {
    strncpy(provisionData.pairingCode, code, 6);
    provisionData.pairingCode[6] = '\0';
    Serial.printf("[BLE] Received pairing code: %s\n", provisionData.pairingCode);
}

void BLEProvision::completeProvisioning() {
    if (strlen(provisionData.ssid) > 0 && strlen(provisionData.pairingCode) > 0) {
        provisionData.complete = true;
        setState(BLE_STATE_RECEIVED);
        Serial.println("[BLE] Provisioning data complete!");
        if (completeCallback) {
            completeCallback(&provisionData);
        }
    }
}

const char* BLEProvision::generatePairingCode() {
    static char code[7];
    uint32_t rand = esp_random();
    snprintf(code, sizeof(code), "%06u", rand % 1000000);
    return code;
}

String BLEProvision::getDeviceUUID() {
    return deviceUUID;
}

void BLEProvision::setState(BLEProvisionState newState) {
    state = newState;
    if (stateCallback) {
        stateCallback(newState);
    }
}

MyBLEServerCallbacks::MyBLEServerCallbacks(BLEProvision* provision) : m_provision(provision) {}

void MyBLEServerCallbacks::onConnect(BLEServer* pServer) {
    Serial.println("[BLE] Client connected");
}

void MyBLEServerCallbacks::onDisconnect(BLEServer* pServer) {
    Serial.println("[BLE] Client disconnected");
    delay(100);
    pServer->startAdvertising();
}

MyBLECharacteristicCallbacks::MyBLECharacteristicCallbacks(BLEProvision* provision, const char* charUUID)
    : m_provision(provision), m_charUUID(charUUID) {}

void MyBLECharacteristicCallbacks::onWrite(BLECharacteristic* pCharacteristic) {
    String value = pCharacteristic->getValue().c_str();
    
    if (strcmp(m_charUUID, CHAR_WIFI_SSID) == 0) {
        m_provision->setSSID(value.c_str());
    }
    else if (strcmp(m_charUUID, CHAR_WIFI_PASS) == 0) {
        m_provision->setPassword(value.c_str());
    }
    else if (strcmp(m_charUUID, CHAR_PAIRING_CODE) == 0) {
        m_provision->setPairingCode(value.c_str());
    }
    else if (strcmp(m_charUUID, CHAR_CONTROL) == 0) {
        if (value == "complete") {
            m_provision->completeProvisioning();
        }
    }
}
