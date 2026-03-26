import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {pairingService} from '../services/api';
import {bleService, DiscoveredBLEDevice, BLEProvisionStatus, BLEStatusUpdate} from '../services/bleService';
import {useAuthStore} from '../store/auth';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Provisioning: undefined;
};

type ProvisioningScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Provisioning'>;
};

interface PairingSession {
  code: string;
  expiresAt: string;
}

export function ProvisioningScreen({navigation}: ProvisioningScreenProps) {
  const {token} = useAuthStore();
  const [devices, setDevices] = useState<DiscoveredBLEDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredBLEDevice | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [devicePairingCode, setDevicePairingCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provisionStatus, setProvisionStatus] = useState<BLEStatusUpdate | null>(null);

  useEffect(() => {
    initializeBLE();
    return () => {
      bleService.destroy();
    };
  }, []);

  const initializeBLE = async () => {
    try {
      const hasPermission = await bleService.requestPermissions();
      if (!hasPermission) {
        setError('Se requieren permisos de Bluetooth');
        return;
      }

      const isEnabled = await bleService.checkBluetoothState();
      if (!isEnabled) {
        setError('Activa el Bluetooth para continuar');
        return;
      }

      startScan();
    } catch (err) {
      console.error('BLE init error:', err);
      setError('Error inicializando Bluetooth');
    }
  };

  const startScan = useCallback(() => {
    setScanning(true);
    setDevices([]);
    setError(null);

    bleService.startScanning(
      device => {
        setDevices(prev => {
          const exists = prev.find(d => d.id === device.id);
          if (!exists) {
            return [...prev, device];
          }
          return prev;
        });
      },
      err => {
        console.error('Scan error:', err);
        setError('Error escaneando dispositivos');
        setScanning(false);
      },
    );
  }, []);

  const stopScan = useCallback(() => {
    bleService.stopScanning();
    setScanning(false);
  }, []);

  const handleDevicePress = async (device: DiscoveredBLEDevice) => {
    Alert.alert(
      'Dispositivo Encontrado',
      `¿Conectar con ${device.name}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Conectar',
          onPress: () => {
            setSelectedDevice(device);
            setShowCredentialsModal(true);
          },
        },
      ],
    );
  };

  const handleProvision = async () => {
    if (!selectedDevice || !ssid.trim() || !password.trim()) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setProvisioning(true);
    setError(null);

    try {
      console.log('Connecting to device:', selectedDevice.id);
      setConnecting(true);
      
      await bleService.connectToDevice(selectedDevice.id);
      console.log('Device connected');

      const deviceInfo = await bleService.getDeviceInfo();
      console.log('Device info:', deviceInfo);
      setDevicePairingCode(deviceInfo.pairingCode);

      if (!deviceInfo.pairingCode) {
        Alert.alert('Error', 'No se pudo leer el código del dispositivo');
        setProvisioning(false);
        setConnecting(false);
        return;
      }

      bleService.subscribeToStatus((update: BLEStatusUpdate) => {
        setProvisionStatus(update);
        console.log('Device status:', update);

        if (update.status === BLEProvisionStatus.REGISTERED) {
          Alert.alert(
            'Éxito',
            'Dispositivo configurado y registrado correctamente',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Dashboard'),
              },
            ],
          );
        } else if (update.status === BLEProvisionStatus.WIFI_FAILED) {
          Alert.alert('Error', 'Error conectando al WiFi: ' + update.message);
        } else if (update.status === BLEProvisionStatus.ERROR) {
          Alert.alert('Error', update.message);
        }
      });

      const success = await bleService.sendWiFiCredentials({
        ssid: ssid.trim(),
        password: password.trim(),
        pairingCode: deviceInfo.pairingCode,
      });

      if (success) {
        console.log('Credentials sent successfully, waiting for device status...');

        Alert.alert(
          'Éxito',
          `Dispositivo ${selectedDevice.name} configurado correctamente`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ],
        );
      } else {
        setError('Error enviando credenciales al dispositivo');
      }
    } catch (err) {
      console.error('Provisioning error:', err);
      setError('Error durante el aprovisionamiento');
    } finally {
      setProvisioning(false);
      setConnecting(false);
      setShowCredentialsModal(false);
      stopScan();
    }
  };

  const renderDevice = ({item}: {item: DiscoveredBLEDevice}) => {
    const signalStrength = item.rssi > -50 ? 'Excelente' : item.rssi > -70 ? 'Bueno' : 'Débil';
    
    return (
      <TouchableOpacity
        style={styles.deviceCard}
        onPress={() => handleDevicePress(item)}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceSignal}>
            {signalStrength} ({item.rssi} dBm)
          </Text>
        </View>
        <View style={styles.provisionIcon}>
          <Text style={styles.provisionIconText}>+</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Agregar Dispositivo</Text>
        <TouchableOpacity onPress={scanning ? stopScan : startScan}>
          <Text style={styles.scanButton}>{scanning ? 'Detener' : 'Escanear'}</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {devicePairingCode && (
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Código del Dispositivo</Text>
          <Text style={styles.codeValue}>{devicePairingCode}</Text>
          <Text style={styles.codeHint}>
            Ingresa este código en el dashboard web
          </Text>
        </View>
      )}

      {provisionStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Estado del Dispositivo</Text>
          <Text style={styles.statusValue}>
            {provisionStatus.status === BLEProvisionStatus.CONNECTING_WIFI && 'Conectando a WiFi...'}
            {provisionStatus.status === BLEProvisionStatus.WIFI_CONNECTED && 'WiFi conectado'}
            {provisionStatus.status === BLEProvisionStatus.WIFI_FAILED && 'Error de WiFi'}
            {provisionStatus.status === BLEProvisionStatus.REGISTERING && 'Registrando dispositivo...'}
            {provisionStatus.status === BLEProvisionStatus.REGISTERED && 'Registrado'}
            {provisionStatus.status === BLEProvisionStatus.ERROR && 'Error'}
          </Text>
          {provisionStatus.message && provisionStatus.status !== BLEProvisionStatus.REGISTERED && (
            <Text style={styles.statusMessage}>{provisionStatus.message}</Text>
          )}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Dispositivos BLE Cercanos</Text>
        
        {scanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator color="#6366f1" size="small" />
            <Text style={styles.scanningText}>Escaneando...</Text>
          </View>
        )}

        <FlatList
          data={devices}
          keyExtractor={item => item.id}
          renderItem={renderDevice}
          ListEmptyComponent={
            !scanning ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontraron dispositivos</Text>
                <Text style={styles.emptySubtext}>
                  Asegúrate de que el dispositivo esté en modo emparejamiento
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      <Modal visible={showCredentialsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configurar WiFi</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa las credenciales WiFi para {selectedDevice?.name}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre WiFi (SSID)"
              placeholderTextColor="#666"
              value={ssid}
              onChangeText={setSsid}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Contraseña WiFi"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCredentialsModal(false)}
                disabled={provisioning}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.provisionButton, provisioning && styles.provisionButtonDisabled]}
                onPress={handleProvision}
                disabled={provisioning || connecting}>
                <Text style={styles.provisionButtonText}>
                  {connecting ? 'Conectando...' : provisioning ? 'Enviando...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  backButton: {
    color: '#fff',
    fontSize: 24,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scanButton: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ff3b3040',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    flex: 1,
  },
  errorDismiss: {
    color: '#ff6b6b',
    fontSize: 18,
    paddingLeft: 8,
  },
  codeContainer: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  codeLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  codeValue: {
    color: '#6366f1',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  codeHint: {
    color: '#666',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  statusLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  statusValue: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  statusMessage: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  scanningIndicator: {
    flexDirection: 'row',
    backgroundColor: '#6366f133',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    gap: 8,
  },
  scanningText: {
    color: '#6366f1',
  },
  listContent: {
    paddingBottom: 20,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#262626',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceSignal: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  provisionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f133',
    justifyContent: 'center',
    alignItems: 'center',
  },
  provisionIconText: {
    color: '#6366f1',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
  emptySubtext: {
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#888',
    marginBottom: 20,
  },
  modalCodeContainer: {
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  modalCodeLabel: {
    color: '#888',
    fontSize: 12,
  },
  modalCodeValue: {
    color: '#6366f1',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#262626',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  provisionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  provisionButtonDisabled: {
    opacity: 0.6,
  },
  provisionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
