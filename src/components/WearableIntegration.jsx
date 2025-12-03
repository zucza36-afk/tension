import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Switch,
  Platform
} from 'react-native';
import { Heart, Activity, Wifi, Bluetooth, AlertTriangle, CheckCircle, X } from 'lucide-react-native';
import WearableService from '../services/WearableService';

/**
 * Wearable Integration Component
 * Provides UI for Galaxy Watch6 connection and data monitoring
 */
const WearableIntegration = () => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [compatibility, setCompatibility] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [latestData, setLatestData] = useState({
    heartRate: null,
    motion: null,
    interaction: null
  });
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [dataStreaming, setDataStreaming] = useState(false);

  // Refs for cleanup
  const eventListeners = useRef([]);

  useEffect(() => {
    setupEventListeners();
    checkCompatibility();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  /**
   * Setup event listeners for wearable service
   */
  const setupEventListeners = () => {
    const listeners = [
      // Connection events
      { event: 'watchConnected', handler: handleWatchConnected },
      { event: 'watchDisconnected', handler: handleWatchDisconnected },
      { event: 'connectionFailed', handler: handleConnectionFailed },
      { event: 'reconnectionFailed', handler: handleReconnectionFailed },
      
      // Data events
      { event: 'heartRateData', handler: handleHeartRateData },
      { event: 'motionData', handler: handleMotionData },
      { event: 'gyroscopeData', handler: handleGyroscopeData },
      
      // BLE state events
      { event: 'bleStateChanged', handler: handleBleStateChanged },
      { event: 'compatibilityCheckFailed', handler: handleCompatibilityCheckFailed }
    ];

    listeners.forEach(({ event, handler }) => {
      WearableService.on(event, handler);
      eventListeners.current.push({ event, handler });
    });
  };

  /**
   * Cleanup event listeners
   */
  const cleanupEventListeners = () => {
    eventListeners.current.forEach(({ event, handler }) => {
      WearableService.off(event, handler);
    });
    eventListeners.current = [];
  };

  /**
   * Check device compatibility
   */
  const checkCompatibility = async () => {
    try {
      setConnectionStatus('checking');
      const result = await WearableService.checkCompatibility();
      setCompatibility(result);
      
      if (result.compatible) {
        setAvailableDevices(result.availableDevices);
        setConnectionStatus('ready');
      } else {
        setConnectionStatus('incompatible');
        Alert.alert(
          'Compatibility Error',
          result.error,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Compatibility check error:', error);
      setConnectionStatus('error');
    }
  };

  /**
   * Start scanning for devices
   */
  const startScanning = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'Galaxy Watch6 integration is only available on Android');
      return;
    }

    try {
      setIsScanning(true);
      setConnectionStatus('scanning');
      
      const devices = await WearableService.discoverGalaxyWatch6();
      setAvailableDevices(devices);
      
      if (devices.length > 0) {
        setShowDeviceModal(true);
      } else {
        Alert.alert('No Devices Found', 'No Galaxy Watch6 devices found in range');
      }
    } catch (error) {
      console.error('Scanning error:', error);
      Alert.alert('Scanning Error', error.message);
    } finally {
      setIsScanning(false);
      setConnectionStatus('ready');
    }
  };

  /**
   * Connect to selected device
   */
  const connectToDevice = async (device) => {
    try {
      setConnectionStatus('connecting');
      setSelectedDevice(device);
      
      const result = await WearableService.connectToWatch(device.id);
      
      if (result.success) {
        setIsConnected(true);
        setConnectionStatus('connected');
        setShowDeviceModal(false);
        setDataStreaming(true);
        
        Alert.alert(
          'Connected!',
          `Successfully connected to ${device.name}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      Alert.alert('Connection Failed', error.message);
    }
  };

  /**
   * Disconnect from device
   */
  const disconnect = async () => {
    try {
      await WearableService.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setSelectedDevice(null);
      setDataStreaming(false);
      setLatestData({ heartRate: null, motion: null, interaction: null });
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  /**
   * Event handlers
   */
  const handleWatchConnected = (device) => {
    setIsConnected(true);
    setConnectionStatus('connected');
    setSelectedDevice(device);
    setDataStreaming(true);
  };

  const handleWatchDisconnected = () => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setDataStreaming(false);
    
    if (autoReconnect) {
      Alert.alert(
        'Watch Disconnected',
        'Attempting to reconnect automatically...',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Watch Disconnected',
        'The watch has disconnected from your device.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleConnectionFailed = (error) => {
    setConnectionStatus('error');
    Alert.alert('Connection Failed', error.message);
  };

  const handleReconnectionFailed = (error) => {
    setConnectionStatus('error');
    Alert.alert('Reconnection Failed', 'Unable to reconnect to the watch');
  };

  const handleHeartRateData = (heartRate) => {
    setLatestData(prev => ({
      ...prev,
      heartRate: { value: heartRate, timestamp: Date.now() }
    }));
  };

  const handleMotionData = (motionData) => {
    setLatestData(prev => ({
      ...prev,
      motion: { ...motionData, timestamp: Date.now() }
    }));
  };

  const handleGyroscopeData = (gyroData) => {
    setLatestData(prev => ({
      ...prev,
      gyroscope: { ...gyroData, timestamp: Date.now() }
    }));
  };

  const handleBleStateChanged = (state) => {
    console.log('BLE State:', state);
    if (state === 'PoweredOff') {
      Alert.alert(
        'Bluetooth Disabled',
        'Please enable Bluetooth to use Galaxy Watch6 features',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCompatibilityCheckFailed = (error) => {
    setConnectionStatus('error');
    Alert.alert('Compatibility Error', error.message);
  };

  /**
   * Get status icon based on connection status
   */
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle size={24} color="#10B981" />;
      case 'connecting':
      case 'scanning':
        return <ActivityIndicator size={24} color="#3B82F6" />;
      case 'error':
        return <AlertTriangle size={24} color="#EF4444" />;
      default:
        return <X size={24} color="#6B7280" />;
    }
  };

  /**
   * Get status text
   */
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'scanning':
        return 'Scanning...';
      case 'checking':
        return 'Checking compatibility...';
      case 'error':
        return 'Error';
      case 'incompatible':
        return 'Incompatible';
      default:
        return 'Disconnected';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Galaxy Watch6 Integration</Text>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Compatibility Info */}
      {compatibility && (
        <View style={styles.compatibilityContainer}>
          <Text style={styles.sectionTitle}>Device Compatibility</Text>
          <View style={styles.capabilitiesContainer}>
            <View style={styles.capability}>
              <Bluetooth size={20} color={compatibility.capabilities?.bluetooth ? "#10B981" : "#EF4444"} />
              <Text style={styles.capabilityText}>Bluetooth</Text>
            </View>
            <View style={styles.capability}>
              <Wifi size={20} color={compatibility.capabilities?.wifi ? "#10B981" : "#EF4444"} />
              <Text style={styles.capabilityText}>WiFi</Text>
            </View>
            <View style={styles.capability}>
              <Heart size={20} color={compatibility.capabilities?.heartRate ? "#10B981" : "#EF4444"} />
              <Text style={styles.capabilityText}>Heart Rate</Text>
            </View>
            <View style={styles.capability}>
              <Activity size={20} color={compatibility.capabilities?.accelerometer ? "#10B981" : "#EF4444"} />
              <Text style={styles.capabilityText}>Motion</Text>
            </View>
          </View>
        </View>
      )}

      {/* Connection Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>Connection</Text>
        
        {!isConnected ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={startScanning}
            disabled={isScanning || connectionStatus === 'incompatible'}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Scan for Watch</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={disconnect}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        )}

        {/* Auto-reconnect toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Auto-reconnect</Text>
          <Switch
            value={autoReconnect}
            onValueChange={setAutoReconnect}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={autoReconnect ? "#3B82F6" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Data Display */}
      {isConnected && (
        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>Live Data</Text>
          
          <ScrollView style={styles.dataScrollView}>
            {/* Heart Rate */}
            {latestData.heartRate && (
              <View style={styles.dataCard}>
                <View style={styles.dataHeader}>
                  <Heart size={20} color="#EF4444" />
                  <Text style={styles.dataTitle}>Heart Rate</Text>
                </View>
                <Text style={styles.dataValue}>
                  {latestData.heartRate.value} BPM
                </Text>
                <Text style={styles.dataTimestamp}>
                  {new Date(latestData.heartRate.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}

            {/* Motion Data */}
            {latestData.motion && (
              <View style={styles.dataCard}>
                <View style={styles.dataHeader}>
                  <Activity size={20} color="#10B981" />
                  <Text style={styles.dataTitle}>Motion</Text>
                </View>
                <Text style={styles.dataValue}>
                  X: {latestData.motion.x?.toFixed(2)} Y: {latestData.motion.y?.toFixed(2)} Z: {latestData.motion.z?.toFixed(2)}
                </Text>
                <Text style={styles.dataTimestamp}>
                  {new Date(latestData.motion.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}

            {/* Gyroscope Data */}
            {latestData.gyroscope && (
              <View style={styles.dataCard}>
                <View style={styles.dataHeader}>
                  <Activity size={20} color="#8B5CF6" />
                  <Text style={styles.dataTitle}>Gyroscope</Text>
                </View>
                <Text style={styles.dataValue}>
                  X: {latestData.gyroscope.x?.toFixed(2)} Y: {latestData.gyroscope.y?.toFixed(2)} Z: {latestData.gyroscope.z?.toFixed(2)}
                </Text>
                <Text style={styles.dataTimestamp}>
                  {new Date(latestData.gyroscope.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Device Selection Modal */}
      <Modal
        visible={showDeviceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeviceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Galaxy Watch6</Text>
              <TouchableOpacity
                onPress={() => setShowDeviceModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.deviceList}>
              {availableDevices.map((device, index) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceItem}
                  onPress={() => connectToDevice(device)}
                >
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
                    <Text style={styles.deviceId}>{device.id}</Text>
                  </View>
                  <Bluetooth size={20} color="#3B82F6" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  compatibilityContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  capabilitiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  capability: {
    alignItems: 'center',
    gap: 4,
  },
  capabilityText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  controlsContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  dataContainer: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
  },
  dataScrollView: {
    flex: 1,
  },
  dataCard: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dataValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dataTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#374151',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deviceId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export default WearableIntegration; 