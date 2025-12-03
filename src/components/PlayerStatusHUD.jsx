import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Brain, 
  Wifi, 
  Battery, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Shield,
  Eye,
  AlertTriangle
} from 'lucide-react';
import DeviceManager from '../services/DeviceManager';
import PlayerStatusEngine from '../services/PlayerStatusEngine';
import DataProcessor from '../services/DataProcessor';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';

/**
 * Player Status HUD Component
 * Dynamic visual indicators for player biofeedback and device status
 */
const PlayerStatusHUD = () => {
  const { language } = useLanguageStore();
  const [playerState, setPlayerState] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [dataQuality, setDataQuality] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  
  // Animation values
  const heartRateAnim = useMotionValue(0);
  const gsrAnim = useMotionValue(0);
  const motionAnim = useMotionValue(0);
  const eegAnim = useMotionValue(0);
  const statusAnim = useAnimation();
  const pulseAnim = useAnimation();
  
  // Refs for cleanup
  const eventListeners = useRef([]);

  const t = (key) => getTranslation(key, language);

  useEffect(() => {
    setupEventListeners();
    initializeHUD();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  /**
   * Setup event listeners for real-time updates
   */
  const setupEventListeners = () => {
    const listeners = [
      // Player status events
      { source: PlayerStatusEngine, event: 'stateChanged', handler: handleStateChange },
      { source: PlayerStatusEngine, event: 'stateUpdated', handler: handleStateUpdate },
      
      // Device events
      { source: DeviceManager, event: 'deviceConnected', handler: handleDeviceUpdate },
      { source: DeviceManager, event: 'deviceDisconnected', handler: handleDeviceUpdate },
      { source: DeviceManager, event: 'deviceData', handler: handleDeviceData },
      
      // Data processing events
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
   * Initialize HUD with current state
   */
  const initializeHUD = () => {
    const currentState = PlayerStatusEngine.getCurrentState();
    const devices = DeviceManager.getRegisteredDevices();
    const quality = DataProcessor.getOverallDataQuality();
    
    setPlayerState(currentState);
    setDataQuality(quality);
    
    // Initialize device status
    const status = {};
    devices.forEach(device => {
      status[device.id] = {
        connected: device.connected,
        signalStrength: DeviceManager.getDeviceSignalStrength(device.id),
        batteryLevel: device.batteryLevel || 0,
        dataQuality: device.dataQuality || 0
      };
    });
    setDeviceStatus(status);
  };

  /**
   * Event handlers
   */
  const handleStateChange = (event) => {
    const { newState, state } = event;
    setPlayerState(state);
    
    // Animate status change
    statusAnim.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 }
    });
    
    // Update metric animations
    if (state.metrics) {
      heartRateAnim.set(state.metrics.heartRate || 0);
      gsrAnim.set(state.metrics.gsr || 0);
      motionAnim.set(state.metrics.motion || 0);
      eegAnim.set(state.metrics.eeg || 0);
    }
  };

  const handleStateUpdate = (state) => {
    setPlayerState(state);
  };

  const handleDeviceUpdate = () => {
    const devices = DeviceManager.getRegisteredDevices();
    const status = {};
    devices.forEach(device => {
      status[device.id] = {
        connected: device.connected,
        signalStrength: DeviceManager.getDeviceSignalStrength(device.id),
        batteryLevel: device.batteryLevel || 0,
        dataQuality: device.dataQuality || 0
      };
    });
    setDeviceStatus(status);
  };

  const handleDeviceData = (data) => {
    // Update specific device data
    setDeviceStatus(prev => ({
      ...prev,
      [data.deviceId]: {
        ...prev[data.deviceId],
        dataQuality: data.quality || 0
      }
    }));
  };

  const handleDataProcessed = (data) => {
    setDataQuality(DataProcessor.getOverallDataQuality());
  };

  /**
   * Get state information
   */
  const getStateInfo = (status) => {
    const stateDef = PlayerStatusEngine.getStateDefinition(status);
    return {
      color: stateDef.color,
      icon: stateDef.icon,
      label: t(status) || status
    };
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

  if (!playerState) {
    return (
      <div className="w-80 h-full bg-gray-800 border-l border-gray-700 p-4">
        <div className="text-gray-400 text-center">Loading...</div>
      </div>
    );
  }

  const stateInfo = getStateInfo(playerState.status);

  return (
    <div className="w-80 h-full bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold text-lg">
            {t('playerStatus') || 'Player Status'}
          </h3>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye size={16} />
          </button>
        </div>
        
        {/* Status Indicator */}
        <motion.div
          animate={statusAnim}
          className="flex items-center p-3 bg-gray-700 rounded-lg"
        >
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: stateInfo.color }}
          />
          <div className="flex-1">
            <div 
              className="font-semibold text-sm"
              style={{ color: stateInfo.color }}
            >
              {stateInfo.label}
            </div>
            <div className="text-gray-400 text-xs">
              {Math.round((playerState.confidence || 0) * 100)}% confidence
            </div>
          </div>
        </motion.div>
      </div>

      {/* Real-time Metrics */}
      <div className="mb-6">
        <h4 className="text-white font-medium text-sm mb-3">
          {t('realTimeMetrics') || 'Real-time Metrics'}
        </h4>
        
        <div className="space-y-3">
          {/* Heart Rate */}
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center">
              <Heart size={16} className="text-red-500 mr-2" />
              <span className="text-gray-300 text-sm">
                {t('heartRate') || 'Heart Rate'}
              </span>
            </div>
            <div className="text-white font-semibold text-sm">
              {playerState.metrics?.heartRate ? 
                Math.round(playerState.metrics.heartRate * 100) : 0}%
            </div>
          </div>

          {/* GSR */}
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center">
              <Zap size={16} className="text-purple-500 mr-2" />
              <span className="text-gray-300 text-sm">
                {t('gsr') || 'GSR'}
              </span>
            </div>
            <div className="text-white font-semibold text-sm">
              {playerState.metrics?.gsr ? 
                Math.round(playerState.metrics.gsr * 100) : 0}%
            </div>
          </div>

          {/* Motion */}
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center">
              <Activity size={16} className="text-green-500 mr-2" />
              <span className="text-gray-300 text-sm">
                {t('activity') || 'Activity'}
              </span>
            </div>
            <div className="text-white font-semibold text-sm">
              {playerState.metrics?.motion ? 
                Math.round(playerState.metrics.motion * 100) : 0}%
            </div>
          </div>

          {/* EEG */}
          <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center">
              <Brain size={16} className="text-blue-500 mr-2" />
              <span className="text-gray-300 text-sm">
                {t('eeg') || 'EEG'}
              </span>
            </div>
            <div className="text-white font-semibold text-sm">
              {playerState.metrics?.eeg ? 
                Math.round(playerState.metrics.eeg * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Device Status */}
      <div className="mb-6">
        <h4 className="text-white font-medium text-sm mb-3">
          {t('deviceStatus') || 'Device Status'}
        </h4>
        
        <div className="space-y-2">
          {Object.entries(deviceStatus).map(([deviceId, status]) => (
            <div key={deviceId} className="p-2 bg-gray-700 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-xs">
                  {deviceId}
                </span>
                <div className="flex items-center space-x-2">
                  {/* Connection Status */}
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      status.connected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  
                  {/* Signal Strength */}
                  <Wifi 
                    size={12} 
                    className="text-gray-400"
                    style={{ color: getSignalColor(status.signalStrength) }}
                  />
                  
                  {/* Battery Level */}
                  <Battery 
                    size={12} 
                    className="text-gray-400"
                    style={{ color: getBatteryColor(status.batteryLevel) }}
                  />
                </div>
              </div>
              
              {showDetails && (
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Signal: {Math.round(status.signalStrength * 100)}%</div>
                  <div>Battery: {Math.round(status.batteryLevel * 100)}%</div>
                  <div>Quality: {Math.round(status.dataQuality * 100)}%</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Quality */}
      <div className="mb-6">
        <h4 className="text-white font-medium text-sm mb-3">
          {t('dataQuality') || 'Data Quality'}
        </h4>
        
        <div className="p-3 bg-gray-700 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">
              {t('overallQuality') || 'Overall Quality'}
            </span>
            <span className="text-white font-semibold text-sm">
              {Math.round(dataQuality * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${dataQuality * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {playerState.alerts && playerState.alerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium text-sm mb-3">
            {t('alerts') || 'Alerts'}
          </h4>
          
          <div className="space-y-2">
            {playerState.alerts.map((alert, index) => (
              <div key={index} className="flex items-center p-2 bg-red-900/20 border border-red-500/30 rounded">
                <AlertTriangle size={14} className="text-red-500 mr-2" />
                <span className="text-red-300 text-xs">
                  {alert.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Status */}
      <div className="mb-6">
        <h4 className="text-white font-medium text-sm mb-3">
          {t('safetyStatus') || 'Safety Status'}
        </h4>
        
        <div className="p-3 bg-gray-700 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield size={16} className="text-green-500 mr-2" />
              <span className="text-gray-300 text-sm">
                {t('safetyActive') || 'Safety Active'}
              </span>
            </div>
            <div className="text-green-400 text-sm font-semibold">
              {t('enabled') || 'Enabled'}
            </div>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-center">
        <div className="text-gray-500 text-xs">
          {t('lastUpdate') || 'Last Update'}: {new Date(playerState.lastUpdate || Date.now()).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatusHUD; 