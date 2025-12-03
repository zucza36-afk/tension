import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import WearableService from '../services/WearableService';

/**
 * Custom hook for Galaxy Watch6 integration
 * Provides easy access to wearable functionality and data
 */
export const useWearable = () => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [compatibility, setCompatibility] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  
  // Data state
  const [heartRate, setHeartRate] = useState(null);
  const [motionData, setMotionData] = useState(null);
  const [gyroscopeData, setGyroscopeData] = useState(null);
  const [interactionData, setInteractionData] = useState(null);
  
  // Refs for cleanup
  const eventListeners = useRef([]);

  useEffect(() => {
    setupEventListeners();
    initializeWearable();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  /**
   * Setup event listeners for wearable service
   */
  const setupEventListeners = useCallback(() => {
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
  }, []);

  /**
   * Cleanup event listeners
   */
  const cleanupEventListeners = useCallback(() => {
    eventListeners.current.forEach(({ event, handler }) => {
      WearableService.off(event, handler);
    });
    eventListeners.current = [];
  }, []);

  /**
   * Initialize wearable service
   */
  const initializeWearable = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setError('Galaxy Watch6 integration is only supported on Android');
      return;
    }

    try {
      setConnectionStatus('checking');
      const result = await WearableService.checkCompatibility();
      setCompatibility(result);
      
      if (result.compatible) {
        setAvailableDevices(result.availableDevices);
        setConnectionStatus('ready');
      } else {
        setConnectionStatus('incompatible');
        setError(result.error);
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(err.message);
    }
  }, []);

  /**
   * Event handlers
   */
  const handleWatchConnected = useCallback((device) => {
    setIsConnected(true);
    setConnectionStatus('connected');
    setSelectedDevice(device);
    setError(null);
  }, []);

  const handleWatchDisconnected = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setSelectedDevice(null);
  }, []);

  const handleConnectionFailed = useCallback((err) => {
    setConnectionStatus('error');
    setError(err.message);
  }, []);

  const handleReconnectionFailed = useCallback((err) => {
    setConnectionStatus('error');
    setError('Reconnection failed: ' + err.message);
  }, []);

  const handleHeartRateData = useCallback((data) => {
    setHeartRate({
      value: data,
      timestamp: Date.now()
    });
  }, []);

  const handleMotionData = useCallback((data) => {
    setMotionData({
      ...data,
      timestamp: Date.now()
    });
  }, []);

  const handleGyroscopeData = useCallback((data) => {
    setGyroscopeData({
      ...data,
      timestamp: Date.now()
    });
  }, []);

  const handleBleStateChanged = useCallback((state) => {
    console.log('BLE State changed:', state);
    if (state === 'PoweredOff') {
      setError('Bluetooth is disabled. Please enable Bluetooth to use Galaxy Watch6 features.');
    }
  }, []);

  const handleCompatibilityCheckFailed = useCallback((err) => {
    setConnectionStatus('error');
    setError(err.message);
  }, []);

  /**
   * Public methods
   */
  const scanForDevices = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setError('Galaxy Watch6 integration is only available on Android');
      return;
    }

    try {
      setIsScanning(true);
      setConnectionStatus('scanning');
      setError(null);
      
      const devices = await WearableService.discoverGalaxyWatch6();
      setAvailableDevices(devices);
      
      if (devices.length === 0) {
        setError('No Galaxy Watch6 devices found in range');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
      setConnectionStatus('ready');
    }
  }, []);

  const connectToDevice = useCallback(async (device) => {
    try {
      setConnectionStatus('connecting');
      setError(null);
      
      const result = await WearableService.connectToWatch(device.id);
      
      if (result.success) {
        setIsConnected(true);
        setConnectionStatus('connected');
        setSelectedDevice(device);
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(err.message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await WearableService.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setSelectedDevice(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const getConnectionStatus = useCallback(() => {
    return WearableService.getConnectionStatus();
  }, []);

  const getLatestData = useCallback(() => {
    return WearableService.getLatestData();
  }, []);

  const getAllData = useCallback(() => {
    return WearableService.getAllData();
  }, []);

  const clearData = useCallback(() => {
    WearableService.clearData();
    setHeartRate(null);
    setMotionData(null);
    setGyroscopeData(null);
    setInteractionData(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get status information
   */
  const getStatusInfo = useCallback(() => {
    return {
      isConnected,
      isScanning,
      connectionStatus,
      hasError: !!error,
      isCompatible: compatibility?.compatible || false,
      availableDevicesCount: availableDevices.length,
      selectedDevice,
      capabilities: compatibility?.capabilities || {}
    };
  }, [isConnected, isScanning, connectionStatus, error, compatibility, availableDevices, selectedDevice]);

  /**
   * Get all sensor data
   */
  const getSensorData = useCallback(() => {
    return {
      heartRate,
      motionData,
      gyroscopeData,
      interactionData,
      allData: WearableService.getAllData()
    };
  }, [heartRate, motionData, gyroscopeData, interactionData]);

  return {
    // State
    isConnected,
    isScanning,
    compatibility,
    availableDevices,
    selectedDevice,
    connectionStatus,
    error,
    
    // Data
    heartRate,
    motionData,
    gyroscopeData,
    interactionData,
    
    // Methods
    scanForDevices,
    connectToDevice,
    disconnect,
    getConnectionStatus,
    getLatestData,
    getAllData,
    clearData,
    clearError,
    
    // Utility methods
    getStatusInfo,
    getSensorData,
    
    // Service instance (for advanced usage)
    wearableService: WearableService
  };
};

export default useWearable; 