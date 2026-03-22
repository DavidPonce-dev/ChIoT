import {BleManager, Device} from 'react-native-ble-plx';
import {Platform, PermissionsAndroid} from 'react-native';

const SERVICE_UUID = '0000FFFE-0000-1000-8000-00805F9B34FB';
const CHAR_WIFI_SSID = '0000FF01-0000-1000-8000-00805F9B34FB';
const CHAR_WIFI_PASS = '0000FF02-0000-1000-8000-00805F9B34FB';
const CHAR_PAIRING_CODE = '0000FF03-0000-1000-8000-00805F9B34FB';
const CHAR_DEVICE_INFO = '0000FF04-0000-1000-8000-00805F9B34FB';
const CHAR_CONTROL = '0000FF06-0000-1000-8000-00805F9B34FB';

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

class BLEService {
  private manager: BleManager;
  private isScanning: boolean = false;
  private connectedDevice: Device | null = null;

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

        if (device && device.name?.startsWith('ChIoT_')) {
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
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch (error) {
        console.warn('Disconnect error:', error);
      }
      this.connectedDevice = null;
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

  async getDeviceInfo(): Promise<{uuid: string; type: string; pin: string}> {
    try {
      const [uuid, type, pin] = await Promise.all([
        this.readCharacteristic(CHAR_DEVICE_INFO),
        this.readCharacteristic(CHAR_DEVICE_INFO),
        this.readCharacteristic(CHAR_PAIRING_CODE),
      ]);

      const [deviceUuid, deviceType] = uuid.split('|');
      return {
        uuid: deviceUuid || '',
        type: deviceType || 'LED_STRIP',
        pin: pin || '',
      };
    } catch (error) {
      console.error('Get device info error:', error);
      return {uuid: '', type: 'LED_STRIP', pin: ''};
    }
  }

  async sendWiFiCredentials(config: BLEProvisionConfig): Promise<boolean> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const ssidData = '\x01' + config.ssid;
      const passData = '\x02' + config.password;
      const codeData = '\x03' + config.pairingCode;

      await this.writeCharacteristic(CHAR_WIFI_SSID, ssidData);
      await new Promise(resolve => setTimeout(resolve, 100));

      await this.writeCharacteristic(CHAR_WIFI_PASS, passData);
      await new Promise(resolve => setTimeout(resolve, 100));

      await this.writeCharacteristic(CHAR_PAIRING_CODE, codeData);
      await new Promise(resolve => setTimeout(resolve, 100));

      await this.writeCharacteristic(CHAR_CONTROL, '\x10');

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
