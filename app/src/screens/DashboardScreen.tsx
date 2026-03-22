import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Card} from '../components/Card';
import {Button} from '../components/Button';
import {TextInput} from '../components/TextInput';
import {useDevices} from '../hooks/useDevices';
import {deviceService} from '../services/api';
import {useAuthStore} from '../store/auth';
import type {Device} from '../types';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
};

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export function DashboardScreen({navigation}: DashboardScreenProps) {
  const {devices, loading, error, refetch} = useDevices();
  const {user, logout} = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<string>('LED_STRIP');

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      {text: 'Cancelar', style: 'cancel'},
      {text: 'Cerrar', onPress: logout},
    ]);
  };

  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para el dispositivo');
      return;
    }
    try {
      switch (newDeviceType) {
        case 'LED_STRIP':
          await deviceService.ledStrips.create(newDeviceName);
          break;
        case 'thermostat':
          await deviceService.thermostats.create(newDeviceName);
          break;
        case 'smart_lock':
          await deviceService.locks.create(newDeviceName);
          break;
        case 'sensor':
          await deviceService.sensors.create(newDeviceName);
          break;
      }
      setShowAddModal(false);
      setNewDeviceName('');
      refetch();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Error');
    }
  };

  const renderDevice = (device: Device) => {
    switch (device.type) {
      case 'LED_STRIP':
        return <LedStripDevice device={device} refetch={refetch} />;
      case 'thermostat':
        return <ThermostatDevice device={device} refetch={refetch} />;
      case 'smart_lock':
        return <SmartLockDevice device={device} refetch={refetch} />;
      case 'sensor':
        return <SensorDevice device={device} refetch={refetch} />;
      default:
        return null;
    }
  };

  if (loading && devices.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dispositivos</Text>
          <Text style={styles.subtitle}>
            {devices.length} dispositivo{devices.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#6366f1" />
        }>
        {devices.map(device => (
          <Card key={device.uuid} title={device.name} subtitle={device.type}>
            {renderDevice(device)}
          </Card>
        ))}

        {devices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay dispositivos</Text>
            <Text style={styles.emptySubtext}>Agrega tu primer dispositivo</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Dispositivo</Text>
            <TextInput
              label="Nombre"
              placeholder="Mi dispositivo"
              value={newDeviceName}
              onChangeText={setNewDeviceName}
            />
            <View style={styles.typeSelector}>
              {['LED_STRIP', 'thermostat', 'smart_lock', 'sensor'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    newDeviceType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewDeviceType(type)}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      newDeviceType === type && styles.typeButtonTextActive,
                    ]}>
                    {type.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setShowAddModal(false)}
                style={{flex: 1, marginRight: 8}}
              />
              <Button
                title="Agregar"
                onPress={handleAddDevice}
                style={{flex: 1, marginLeft: 8}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function LedStripDevice({device, refetch}: {device: Device; refetch: () => void}) {
  const [loading, setLoading] = useState(false);
  const state = device.state as {color?: string; brightness?: number; mode?: string};

  const updateLed = async (updates: Record<string, unknown>) => {
    setLoading(true);
    try {
      await deviceService.ledStrips.update(device.uuid, updates);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={[styles.colorPreview, {backgroundColor: state.color || '#fff'}]} />
      <View style={styles.deviceControls}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => updateLed({mode: 'static'})}>
          <Text style={styles.modeButtonText}>Estático</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => updateLed({mode: 'rainbow'})}>
          <Text style={styles.modeButtonText}>Arcoíris</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => updateLed({mode: 'fire'})}>
          <Text style={styles.modeButtonText}>Fuego</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ThermostatDevice({device, refetch}: {device: Device; refetch: () => void}) {
  const [loading, setLoading] = useState(false);
  const state = device.state as {temperature?: number; mode?: string};
  const temp = state.temperature ?? 22;

  const setTemp = async (newTemp: number) => {
    setLoading(true);
    try {
      await deviceService.thermostats.setTemp(device.uuid, newTemp, state.mode);
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.thermostatContainer}>
      <Text style={styles.tempText}>{temp}°C</Text>
      <View style={styles.tempControls}>
        <TouchableOpacity
          style={styles.tempButton}
          onPress={() => setTemp(temp - 1)}>
          <Text style={styles.tempButtonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tempButton}
          onPress={() => setTemp(temp + 1)}>
          <Text style={styles.tempButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SmartLockDevice({device, refetch}: {device: Device; refetch: () => void}) {
  const [loading, setLoading] = useState(false);
  const state = device.state as {locked?: boolean};
  const isLocked = state.locked ?? true;

  const toggleLock = async () => {
    setLoading(true);
    try {
      if (isLocked) {
        await deviceService.locks.unlock(device.uuid);
      } else {
        await deviceService.locks.lock(device.uuid);
      }
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.lockButton, isLocked ? styles.lockButtonLocked : styles.lockButtonUnlocked]}
      onPress={toggleLock}>
      <Text style={styles.lockButtonText}>
        {isLocked ? '🔒 Bloqueado' : '🔓 Desbloqueado'}
      </Text>
    </TouchableOpacity>
  );
}

function SensorDevice({device}: {device: Device}) {
  const state = device.state as {temperature?: number; humidity?: number};

  return (
    <View>
      {state.temperature !== undefined && (
        <Text style={styles.sensorText}>🌡️ {state.temperature}°C</Text>
      )}
      {state.humidity !== undefined && (
        <Text style={styles.sensorText}>💧 {state.humidity}%</Text>
      )}
      {state.temperature === undefined && state.humidity === undefined && (
        <Text style={styles.sensorText}>Sin datos</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#ef444433',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#888',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#333',
  },
  typeButtonActive: {
    backgroundColor: '#6366f133',
    borderColor: '#6366f1',
  },
  typeButtonText: {
    color: '#888',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#6366f1',
  },
  modalButtons: {
    flexDirection: 'row',
  },
  colorPreview: {
    height: 40,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceControls: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#262626',
    alignItems: 'center',
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  thermostatContainer: {
    alignItems: 'center',
  },
  tempText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  tempControls: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  tempButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  lockButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  lockButtonLocked: {
    backgroundColor: '#22c55e33',
  },
  lockButtonUnlocked: {
    backgroundColor: '#eab30833',
  },
  lockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sensorText: {
    color: '#fff',
    fontSize: 18,
  },
});
