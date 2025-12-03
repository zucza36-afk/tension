import React, { useState, useEffect, useRef } from 'react';
import { 
  Bluetooth, 
  Wifi, 
  Battery, 
  Signal, 
  Plus, 
  Settings, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeviceManager from '../services/DeviceManager';
import DataProcessor from '../services/DataProcessor';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';

/**
 * Device Management Panel Component
 * Comprehensive interface for managing multiple wearable devices
 */
const DeviceManagementPanel = ({ isVisible, onClose }) => {
  const { language } = useLanguageStore();
  const [devices, setDevices] = useState([]);
  const [availableAdapters, setAvailableAdapters] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [dataQuality, setDataQuality] = useState({});
  
  // Refs for cleanup
  const eventListeners = useRef([]);

  const t = (key) => getTranslation(key, language);

  useEffect(() => {
    if (isVisible) {
      setupEventListeners();
      loadDeviceData();
    }
    
    return () => {
      cleanupEventListeners();
    };
  }, [isVisible]);

  /**
   * Setup event listeners
   */
  const setupEventListeners = () => {
    const listeners = [
      { source: DeviceManager, event: 'deviceRegistered', handler: handleDeviceRegistered },
      { source: DeviceManager, event: 'deviceConnected', handler: handleDeviceConnected },
      { source: DeviceManager, event: 'deviceDisconnected', handler: handleDeviceDisconnected },
      { source: DeviceManager, event: 'deviceRemoved', handler: handleDeviceRemoved },
      { source: DataProcessor, event: 'dataProcessed', handler: handleDataProcessed }
    ];

    listeners.forEach(({ source, event, handler }) => {
      source.on(event, handler);
      eventListeners.current.push({ source, event, handler });
    });
  };

  /**
   * Cleanup event listeners
   */
  const cleanupEventListeners = () => {
    eventListeners.current.forEach(({ source, event, handler }) => {
      source.off(event, handler);
    });
    eventListeners.current = [];
  };

  /**
   * Load current device data
   */
  const loadDeviceData = () => {
    const registeredDevices = DeviceManager.getRegisteredDevices();
    const adapters = DeviceManager.getAvailableAdapters();
    
    setDevices(registeredDevices);
    setAvailableAdapters(adapters);
    
    // Load data quality for each device
    const quality = {};
    registeredDevices.forEach(device => {
      quality[device.id] = DataProcessor.getDataQuality(device.type)?.quality || 0;
    });
    setDataQuality(quality);
  };

  /**
   * Event handlers
   */
  const handleDeviceRegistered = (device) => {
    setDevices(prev => [...prev, device]);
  };

  const handleDeviceConnected = (device) => {
    setDevices(prev => prev.map(d => 
      d.id === device.id ? { ...d, connected: true } : d
    ));
  };

  const handleDeviceDisconnected = (device) => {
    setDevices(prev => prev.map(d => 
      d.id === device.id ? { ...d, connected: false } : d
    ));
  };

  const handleDeviceRemoved = (device) => {
    setDevices(prev => prev.filter(d => d.id !== device.id));
  };

  const handleDataProcessed = (data) => {
    if (data.deviceId) {
      setDataQuality(prev => ({
        ...prev,
        [data.deviceId]: data.quality || 0
      }));
    }
  };

  /**
   * Scan for new devices
   */
  const scanForDevices = async () => {
    setScanning(true);
    
    try {
      // Simulate device scanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock discovered devices
      const mockDevices = [
        {
          id: `device_${Date.now()}_1`,
          name: 'Galaxy Watch6',
          type: 'galaxy-watch6',
          capabilities: ['heartRate', 'motion', 'temperature'],
          signalStrength: 0.85,
          batteryLevel: 0.75
        },
        {
          id: `device_${Date.now()}_2`,
          name: 'Fitbit Sense',
          type: 'fitbit',
          capabilities: ['heartRate', 'motion'],
          signalStrength: 0.92,
          batteryLevel: 0.45
        }
      ];
      
      // Auto-register discovered devices
      mockDevices.forEach(device => {
        DeviceManager.detectAndRegisterDevice(device.type, device);
      });
      
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setScanning(false);
    }
  };

  /**
   * Connect to a device
   */
  const connectToDevice = async (deviceId) => {
    try {
      await DeviceManager.connectToDevice(deviceId);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  /**
   * Disconnect from a device
   */
  const disconnectFromDevice = async (deviceId) => {
    try {
      await DeviceManager.disconnectDevice(deviceId);
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  /**
   * Remove a device
   */
  const removeDevice = async (deviceId) => {
    if (confirm(t('confirmRemoveDevice') || 'Are you sure you want to remove this device?')) {
      try {
        await DeviceManager.removeDevice(deviceId);
      } catch (error) {
        console.error('Device removal failed:', error);
      }
    }
  };

  /**
   * Get device status color
   */
  const getDeviceStatusColor = (device) => {
    if (device.connected) return '#10B981';
    if (device.lastSeen && Date.now() - device.lastSeen < 30000) return '#F59E0B';
    return '#EF4444';
  };

  /**
   * Get signal strength color
   */
  const getSignalColor = (strength) => {
    if (strength >= 0.8) return '#10B981';
    if (strength >= 0.6) return '#F59E0B';
    if (strength >= 0.4) return '#EF4444';
    return '#6B7280';
  };

  /**
   * Get battery level color
   */
  const getBatteryColor = (level) => {
    if (level >= 0.5) return '#10B981';
    if (level >= 0.2) return '#F59E0B';
    return '#EF4444';
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-semibold">
              {t('deviceManagement') || 'Device Management'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex gap-6 h-full">
            {/* Device List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">
                  {t('registeredDevices') || 'Registered Devices'}
                </h3>
                <button
                  onClick={scanForDevices}
                  disabled={scanning}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <RefreshCw size={16} className={`mr-2 ${scanning ? 'animate-spin' : ''}`} />
                  {scanning ? t('scanning') || 'Scanning...' : t('scan') || 'Scan'}
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {devices.length === 0 ? (
                  <div className="text-center py-8">
                    <Bluetooth size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {t('noDevicesFound') || 'No devices found'}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      {t('scanToFindDevices') || 'Scan to find available devices'}
                    </p>
                  </div>
                ) : (
                  devices.map(device => (
                    <div
                      key={device.id}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: getDeviceStatusColor(device) }}
                          />
                          <div>
                            <h4 className="text-white font-medium">
                              {device.name}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {device.type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Signal Strength */}
                          <Wifi 
                            size={16} 
                            className="text-gray-400"
                            style={{ color: getSignalColor(device.signalStrength || 0) }}
                          />
                          
                          {/* Battery Level */}
                          <Battery 
                            size={16} 
                            className="text-gray-400"
                            style={{ color: getBatteryColor(device.batteryLevel || 0) }}
                          />
                          
                          {/* Connection Status */}
                          {device.connected ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-500" />
                          )}
                        </div>
                      </div>

                      {/* Device Info */}
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-400">
                            {t('signal') || 'Signal'}:
                          </span>
                          <span className="text-white ml-2">
                            {Math.round((device.signalStrength || 0) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">
                            {t('battery') || 'Battery'}:
                          </span>
                          <span className="text-white ml-2">
                            {Math.round((device.batteryLevel || 0) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">
                            {t('dataQuality') || 'Data Quality'}:
                          </span>
                          <span className="text-white ml-2">
                            {Math.round((dataQuality[device.id] || 0) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">
                            {t('capabilities') || 'Capabilities'}:
                          </span>
                          <span className="text-white ml-2">
                            {device.capabilities?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {device.connected ? (
                          <button
                            onClick={() => disconnectFromDevice(device.id)}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm transition-colors"
                          >
                            {t('disconnect') || 'Disconnect'}
                          </button>
                        ) : (
                          <button
                            onClick={() => connectToDevice(device.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition-colors"
                          >
                            {t('connect') || 'Connect'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => removeDevice(device.id)}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Device Info Panel */}
            <div className="w-80">
              <h3 className="text-white font-medium mb-4">
                {t('deviceInformation') || 'Device Information'}
              </h3>
              
              <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                {/* Connection Summary */}
                <div>
                  <h4 className="text-gray-300 text-sm font-medium mb-2">
                    {t('connectionSummary') || 'Connection Summary'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t('totalDevices') || 'Total Devices'}:
                      </span>
                      <span className="text-white">{devices.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t('connected') || 'Connected'}:
                      </span>
                      <span className="text-green-400">
                        {devices.filter(d => d.connected).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t('disconnected') || 'Disconnected'}:
                      </span>
                      <span className="text-red-400">
                        {devices.filter(d => !d.connected).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Quality Overview */}
                <div>
                  <h4 className="text-gray-300 text-sm font-medium mb-2">
                    {t('dataQualityOverview') || 'Data Quality Overview'}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(dataQuality).map(([deviceId, quality]) => {
                      const device = devices.find(d => d.id === deviceId);
                      return (
                        <div key={deviceId} className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            {device?.name || deviceId}
                          </span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${quality * 100}%` }}
                              />
                            </div>
                            <span className="text-white text-sm">
                              {Math.round(quality * 100)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Available Adapters */}
                <div>
                  <h4 className="text-gray-300 text-sm font-medium mb-2">
                    {t('supportedDevices') || 'Supported Devices'}
                  </h4>
                  <div className="space-y-2">
                    {availableAdapters.map(adapter => (
                      <div key={adapter.type} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                        <div>
                          <div className="text-white text-sm font-medium">
                            {adapter.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {adapter.capabilities.join(', ')}
                          </div>
                        </div>
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help Section */}
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-gray-300 text-sm font-medium mb-2">
                    {t('help') || 'Help'}
                  </h4>
                  <div className="text-gray-400 text-xs space-y-2">
                    <p>
                      {t('deviceHelpText') || 'Connect your wearable devices to enable biofeedback integration.'}
                    </p>
                    <p>
                      {t('dataQualityHelp') || 'Data quality indicates the reliability of sensor readings.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeviceManagementPanel; 