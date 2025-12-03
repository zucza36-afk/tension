import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Heart, Activity, Bluetooth, AlertTriangle } from 'lucide-react-native';
import { useWearable } from '../hooks/useWearable';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';

/**
 * Wearable Game Integration Component
 * Integrates Galaxy Watch6 data with the Napięcie game
 */
const WearableGameIntegration = () => {
  const { language } = useLanguageStore();
  const { currentCard, updateGameIntensity, gameStatus } = useGameStore();
  const {
    isConnected,
    heartRate,
    motionData,
    gyroscopeData,
    scanForDevices,
    connectToDevice,
    disconnect,
    availableDevices,
    error,
    clearError
  } = useWearable();

  const [showDeviceList, setShowDeviceList] = useState(false);
  const [intensityLevel, setIntensityLevel] = useState('normal');

  const t = (key) => getTranslation(key, language);

  // Monitor heart rate for game intensity adjustments
  useEffect(() => {
    if (heartRate && gameStatus === 'playing') {
      const hr = heartRate.value;
      
      if (hr > 120) {
        setIntensityLevel('high');
        updateGameIntensity('high');
      } else if (hr > 90) {
        setIntensityLevel('medium');
        updateGameIntensity('medium');
      } else {
        setIntensityLevel('normal');
        updateGameIntensity('normal');
      }
    }
  }, [heartRate, gameStatus]);

  // Monitor motion for game interactions
  useEffect(() => {
    if (motionData && gameStatus === 'playing') {
      const movement = Math.sqrt(
        motionData.x ** 2 + motionData.y ** 2 + motionData.z ** 2
      );
      
      // Detect significant movement for game mechanics
      if (movement > 2.0) {
        console.log('Significant movement detected - player is active!');
        // Could trigger special game events based on movement
      }
    }
  }, [motionData, gameStatus]);

  // Handle connection to device
  const handleConnectToDevice = async (device) => {
    try {
      await connectToDevice(device);
      setShowDeviceList(false);
      Alert.alert(
        t('watchConnected') || 'Watch Connected',
        `${t('connectedTo') || 'Connected to'} ${device.name}`
      );
    } catch (error) {
      Alert.alert(
        t('connectionFailed') || 'Connection Failed',
        error.message
      );
    }
  };

  // Handle device scanning
  const handleScanForDevices = async () => {
    try {
      await scanForDevices();
      if (availableDevices.length > 0) {
        setShowDeviceList(true);
      } else {
        Alert.alert(
          t('noDevicesFound') || 'No Devices Found',
          t('noWatchDevices') || 'No Galaxy Watch6 devices found in range'
        );
      }
    } catch (error) {
      Alert.alert(
        t('scanningError') || 'Scanning Error',
        error.message
      );
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      await disconnect();
      Alert.alert(
        t('watchDisconnected') || 'Watch Disconnected',
        t('watchDisconnectedMessage') || 'Watch has been disconnected'
      );
    } catch (error) {
      Alert.alert(
        t('disconnectionError') || 'Disconnection Error',
        error.message
      );
    }
  };

  // Clear error
  const handleClearError = () => {
    clearError();
  };

  return (
    <View style={styles.container}>
      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <Bluetooth 
            size={24} 
            color={isConnected ? '#10B981' : '#6B7280'} 
          />
          <Text style={styles.statusTitle}>
            {t('galaxyWatch6') || 'Galaxy Watch6'}
          </Text>
        </View>
        
        <Text style={[
          styles.statusText,
          { color: isConnected ? '#10B981' : '#6B7280' }
        ]}>
          {isConnected 
            ? t('connected') || 'Connected'
            : t('disconnected') || 'Disconnected'
          }
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <AlertTriangle size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleClearError} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Connection Controls */}
      <View style={styles.controlsContainer}>
        {!isConnected ? (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleScanForDevices}
          >
            <Text style={styles.buttonText}>
              {t('connectWatch') || 'Connect Watch'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Text style={styles.buttonText}>
              {t('disconnectWatch') || 'Disconnect Watch'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Live Data Display */}
      {isConnected && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>
            {t('liveData') || 'Live Data'}
          </Text>
          
          {/* Heart Rate */}
          {heartRate && (
            <View style={styles.dataCard}>
              <View style={styles.dataHeader}>
                <Heart size={20} color="#EF4444" />
                <Text style={styles.dataLabel}>
                  {t('heartRate') || 'Heart Rate'}
                </Text>
              </View>
              <Text style={styles.dataValue}>
                {heartRate.value} BPM
              </Text>
              <View style={[
                styles.intensityIndicator,
                { backgroundColor: getIntensityColor(intensityLevel) }
              ]}>
                <Text style={styles.intensityText}>
                  {t(intensityLevel) || intensityLevel}
                </Text>
              </View>
            </View>
          )}

          {/* Motion Data */}
          {motionData && (
            <View style={styles.dataCard}>
              <View style={styles.dataHeader}>
                <Activity size={20} color="#10B981" />
                <Text style={styles.dataLabel}>
                  {t('motion') || 'Motion'}
                </Text>
              </View>
              <Text style={styles.dataValue}>
                X: {motionData.x?.toFixed(2)} Y: {motionData.y?.toFixed(2)} Z: {motionData.z?.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Game Integration Status */}
          {gameStatus === 'playing' && (
            <View style={styles.gameIntegrationCard}>
              <Text style={styles.gameIntegrationTitle}>
                {t('gameIntegration') || 'Game Integration'}
              </Text>
              <Text style={styles.gameIntegrationText}>
                {t('intensityLevel') || 'Intensity Level'}: {t(intensityLevel) || intensityLevel}
              </Text>
              <Text style={styles.gameIntegrationText}>
                {t('monitoringActive') || 'Monitoring Active'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Device Selection Modal */}
      {showDeviceList && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('selectWatch') || 'Select Galaxy Watch6'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowDeviceList(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.deviceList}>
              {availableDevices.map((device, index) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceItem}
                  onPress={() => handleConnectToDevice(device)}
                >
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>
                      {device.name || t('unknownDevice') || 'Unknown Device'}
                    </Text>
                    <Text style={styles.deviceId}>{device.id}</Text>
                  </View>
                  <Bluetooth size={20} color="#3B82F6" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// Helper function to get intensity color
const getIntensityColor = (level) => {
  switch (level) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    default:
      return '#10B981';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    marginLeft: 8,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlsContainer: {
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dataContainer: {
    marginTop: 16,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  dataCard: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    color: '#D1D5DB',
    marginLeft: 8,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  intensityIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  intensityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gameIntegrationCard: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  gameIntegrationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameIntegrationText: {
    fontSize: 12,
    color: '#D1FAE5',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
  closeButtonText: {
    color: '#6B7280',
    fontSize: 24,
    fontWeight: 'bold',
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

export default WearableGameIntegration; 