import {BleManager, Device} from 'react-native-ble-plx';
import {Platform, PermissionsAndroid} from 'react-native';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHAR_WIFI_SSID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const CHAR_WIFI_PASS = 'beb5483f-36e1-4688-b7f5-ea07361b26a9';
const CHAR_PAIRING_CODE = 'beb54840-36e1-4688-b7f5-ea07361b26aa';
const CHAR_DEVICE_INFO = 'beb54842-36e1-4688-b7f5-ea07361b26ac';
const CHAR_CONTROL = 'beb54841-36e1-4688-b7f5-ea07361b26ab';
const CHAR_STATUS = 'beb54843-36e1-4688-b7f5-ea07361b26ad';

export enum BLEProvisionStatus {
  IDLE = 0,
  CONNECTING_WIFI = 1,
  WIFI_CONNECTED = 2,
  WIFI_FAILED = 3,
  REGISTERING = 4,
  REGISTERED = 5,
  ERROR = 99,
}

export interface BLEStatusUpdate {
  status: BLEProvisionStatus;
  message: string;
}

export interface DiscoveredBLEDevice {
  id: string;
  name: string;
  rssi: number;
  deviceUUID?: string;
  deviceType?: string;
}

export interface BLEProvisionConfig {
  ssid: string;
  password: string;
  pairingCode: string;
}

type StatusCallback = (update: BLEStatusUpdate) => void;

class BLEService {
  private manager: BleManager;
  private isScanning: boolean = false;
  private connectedDevice: Device | null = null;
  private statusSubscription: any = null;

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        const allGranted = Object.values(granted).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED,
        );
        return allGranted;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  }

  async checkBluetoothState(): Promise<boolean> {
    const state = await this.manager.state();
    if (state !== 'PoweredOn') {
      console.warn('Bluetooth is not enabled:', state);
      return false;
    }
    return true;
  }

  startScanning(
    onDeviceFound: (device: DiscoveredBLEDevice) => void,
    onError: (error: Error) => void,
  ): void {
    if (this.isScanning) {
      return;
    }

    this.isScanning = true;

    this.manager.startDeviceScan(
      [SERVICE_UUID],
      {allowDuplicates: false},
      (error, device) => {
        if (error) {
          onError(error);
          this.stopScanning();
          return;
        }

        if (device && device.name?.startsWith('ChiotPlatform_')) {
          onDeviceFound({
            id: device.id,
            name: device.name || 'Unknown Device',
            rssi: device.rssi || -100,
          });
        }
      },
    );
  }

  stopScanning(): void {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
    }
  }

  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      const device = await this.manager.connectToDevice(deviceId, {
        timeout: 10000,
      });
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;
      return device;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.statusSubscription) {
      this.statusSubscription.remove();
      this.statusSubscription = null;
    }
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch (error) {
        console.warn('Disconnect error:', error);
      }
      this.connectedDevice = null;
    }
  }

  async subscribeToStatus(callback: StatusCallback): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const characteristics = await this.connectedDevice.characteristicsForService(
        SERVICE_UUID,
      );
      const statusChar = characteristics.find(c => c.uuid === CHAR_STATUS);

      if (!statusChar) {
        throw new Error('Status characteristic not found');
      }

      this.statusSubscription = statusChar.monitor((error: Error | null, char: any) => {
        if (error) {
          console.error('Status monitor error:', error);
          return;
        }
        if (char?.value) {
          const [statusStr, ...messageParts] = this.base64ToString(char.value).split('|');
          const status = parseInt(statusStr, 10);
          const message = messageParts.join('|');
          callback({status: status as BLEProvisionStatus, message});
        }
      });
    } catch (error) {
      console.error('Subscribe to status error:', error);
      throw error;
    }
  }

  private async writeCharacteristic(
    uuid: string,
    value: string,
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    const base64Value = this.stringToBase64(value);

    try {
      await this.connectedDevice.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        uuid,
        base64Value,
      );
    } catch (error) {
      console.error('Write error:', error);
      throw error;
    }
  }

  private async readCharacteristic(uuid: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const response = await this.connectedDevice.readCharacteristicForService(
        SERVICE_UUID,
        uuid,
      );
      return this.base64ToString(response.value || '');
    } catch (error) {
      console.error('Read error:', error);
      throw error;
    }
  }

  async getDeviceInfo(): Promise<{uuid: string; type: string; pairingCode: string}> {
    try {
      const [deviceInfo, pairingCode] = await Promise.all([
        this.readCharacteristic(CHAR_DEVICE_INFO),
        this.readCharacteristic(CHAR_PAIRING_CODE),
      ]);

      const [deviceUuid, deviceType] = deviceInfo.split('|');
      return {
        uuid: deviceUuid || '',
        type: deviceType || 'led_strip',
        pairingCode: pairingCode || '',
      };
    } catch (error) {
      console.error('Get device info error:', error);
      return {uuid: '', type: 'led_strip', pairingCode: ''};
    }
  }

  async sendWiFiCredentials(config: BLEProvisionConfig): Promise<boolean> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      await this.writeCharacteristic(CHAR_WIFI_SSID, config.ssid);
      await new Promise(resolve => setTimeout(resolve, 100));

      await this.writeCharacteristic(CHAR_WIFI_PASS, config.password);
      await new Promise(resolve => setTimeout(resolve, 100));

      await this.writeCharacteristic(CHAR_PAIRING_CODE, config.pairingCode);
      await new Promise(resolve => setTimeout(resolve, 100));

      await this.writeCharacteristic(CHAR_CONTROL, 'complete');

      await new Promise(resolve => setTimeout(resolve, 2000));

      return true;
    } catch (error) {
      console.error('Send credentials error:', error);
      return false;
    }
  }

  destroy(): void {
    this.stopScanning();
    this.disconnect();
    this.manager.destroy();
  }

  private stringToBase64(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToString(base64: string): string {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    } catch {
      return '';
    }
  }
}

export const bleService = new BLEService();
