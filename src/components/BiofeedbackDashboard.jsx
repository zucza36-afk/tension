import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Brain, 
  Zap, 
  Activity, 
  Thermometer,
  Battery,
  Wifi,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';
import DeviceManager from '../services/DeviceManager';
import PlayerStatusEngine from '../services/PlayerStatusEngine';
import DataProcessor from '../services/DataProcessor';

const BiofeedbackDashboard = () => {
  const { language } = useLanguageStore();
  const [playerState, setPlayerState] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({
    connected: false,
    batteryLevel: 0,
    signalStrength: 0,
    lastUpdate: null
  });
  const [metrics, setMetrics] = useState({
    heartRate: 0,
    gsr: 0,
    eeg: 0,
    motion: 0,
    temperature: 0
  });
  const [dataQuality, setDataQuality] = useState(0);
  const [trends, setTrends] = useState({
    heartRate: 'stable',
    arousal: 'stable',
    confidence: 'stable'
  });

  const t = (key) => getTranslation(key, language);

  useEffect(() => {
    setupEventListeners();
    initializeDashboard();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  const setupEventListeners = () => {
    // Player state updates
    PlayerStatusEngine.on('stateChanged', handlePlayerStateChange);
    PlayerStatusEngine.on('stateUpdated', handlePlayerStateUpdate);
    
    // Device events
    DeviceManager.on('deviceConnected', handleDeviceEvent);
    DeviceManager.on('deviceDisconnected', handleDeviceEvent);
    
    // Data processing events
    DataProcessor.on('dataProcessed', handleDataProcessed);
  };

  const cleanupEventListeners = () => {
    PlayerStatusEngine.off('stateChanged', handlePlayerStateChange);
    PlayerStatusEngine.off('stateUpdated', handlePlayerStateUpdate);
    DeviceManager.off('deviceConnected', handleDeviceEvent);
    DeviceManager.off('deviceDisconnected', handleDeviceEvent);
    DataProcessor.off('dataProcessed', handleDataProcessed);
  };

  const initializeDashboard = () => {
    const currentState = PlayerStatusEngine.getCurrentState();
    setPlayerState(currentState);
    
    const connectedDevices = DeviceManager.getConnectedDevices();
    if (connectedDevices.length > 0) {
      const device = connectedDevices[0];
      setDeviceStatus({
        connected: true,
        batteryLevel: device.batteryLevel || 0,
        signalStrength: device.signalStrength || 0,
        lastUpdate: Date.now()
      });
    }
    
    const overallQuality = DataProcessor.getOverallDataQuality();
    setDataQuality(overallQuality);
  };

  const handlePlayerStateChange = (event) => {
    const { newState, state } = event;
    setPlayerState(state);
    
    // Update trends
    setTrends(prev => ({
      ...prev,
      arousal: newState.arousalScore > (prev.arousalScore || 0) ? 'up' : 
               newState.arousalScore < (prev.arousalScore || 0) ? 'down' : 'stable',
      confidence: newState.confidence > (prev.confidence || 0) ? 'up' : 
                  newState.confidence < (prev.confidence || 0) ? 'down' : 'stable'
    }));
  };

  const handlePlayerStateUpdate = (state) => {
    setPlayerState(state);
    setMetrics(state.metrics || metrics);
  };

  const handleDeviceEvent = (device) => {
    setDeviceStatus({
      connected: device.connected,
      batteryLevel: device.batteryLevel || 0,
      signalStrength: device.signalStrength || 0,
      lastUpdate: Date.now()
    });
  };

  const handleDataProcessed = (data) => {
    setMetrics(prev => ({
      ...prev,
      [data.dataType]: data.value
    }));
    
    const quality = DataProcessor.getOverallDataQuality();
    setDataQuality(quality);
  };

  const getMetricColor = (value, type) => {
    if (type === 'heartRate') {
      if (value > 100) return '#EF4444'; // High
      if (value > 80) return '#F59E0B'; // Elevated
      if (value > 60) return '#10B981'; // Normal
      return '#3B82F6'; // Low
    }
    
    if (type === 'gsr') {
      if (value > 0.7) return '#EF4444'; // High stress
      if (value > 0.4) return '#F59E0B'; // Moderate stress
      return '#10B981'; // Low stress
    }
    
    if (type === 'eeg') {
      if (value > 0.8) return '#8B5CF6'; // High activity
      if (value > 0.5) return '#3B82F6'; // Moderate activity
      return '#10B981'; // Low activity
    }
    
    return '#6B7280'; // Default
  };

  const getStatusColor = (status) => {
    const stateDef = PlayerStatusEngine.getStateDefinition(status);
    return stateDef ? stateDef.color : '#6B7280';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#EF4444';
      case 'down': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatMetricValue = (value, type) => {
    if (type === 'heartRate') return `${Math.round(value * 100)} BPM`;
    if (type === 'gsr') return `${Math.round(value * 100)}%`;
    if (type === 'eeg') return `${Math.round(value * 100)}%`;
    if (type === 'motion') return `${Math.round(value * 100)}%`;
    if (type === 'temperature') return `${Math.round(value)}°C`;
    return Math.round(value * 100);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Brain size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {t('biofeedbackDashboard') || 'Biofeedback Dashboard'}
            </h2>
            <p className="text-sm text-gray-400">
              {t('realTimePhysiologicalData') || 'Real-time physiological data'}
            </p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${deviceStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-300">
            {deviceStatus.connected ? t('connected') || 'Connected' : t('disconnected') || 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Player State Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current State */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor(playerState?.status || 'disconnected') }}
            />
            <span className="text-sm font-medium text-gray-300">
              {t('currentState') || 'Current State'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {t(playerState?.status || 'disconnected') || (playerState?.status || 'Disconnected')}
          </h3>
          <p className="text-sm text-gray-400">
            {t('confidence') || 'Confidence'}: {Math.round((playerState?.confidence || 0) * 100)}%
          </p>
        </motion.div>

        {/* Arousal Level */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              {t('arousalLevel') || 'Arousal Level'}
            </span>
            {React.createElement(getTrendIcon(trends.arousal), { 
              size: 16, 
              style: { color: getTrendColor(trends.arousal) }
            })}
          </div>
          <h3 className="text-lg font-semibold text-white">
            {Math.round((playerState?.arousalScore || 0) * 100)}%
          </h3>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(playerState?.arousalScore || 0) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Data Quality */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-700 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Wifi size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              {t('dataQuality') || 'Data Quality'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {Math.round(dataQuality * 100)}%
          </h3>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                dataQuality > 0.8 ? 'bg-green-500' : 
                dataQuality > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${dataQuality * 100}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {/* Heart Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-700 rounded-lg p-4 text-center"
        >
          <Heart size={24} className="text-red-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {formatMetricValue(metrics.heartRate, 'heartRate')}
          </div>
          <div className="text-xs text-gray-400">
            {t('heartRate') || 'Heart Rate'}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${metrics.heartRate * 100}%`,
                backgroundColor: getMetricColor(metrics.heartRate, 'heartRate')
              }}
            />
          </div>
        </motion.div>

        {/* GSR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-700 rounded-lg p-4 text-center"
        >
          <Zap size={24} className="text-purple-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {formatMetricValue(metrics.gsr, 'gsr')}
          </div>
          <div className="text-xs text-gray-400">
            {t('gsr') || 'GSR'}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${metrics.gsr * 100}%`,
                backgroundColor: getMetricColor(metrics.gsr, 'gsr')
              }}
            />
          </div>
        </motion.div>

        {/* EEG */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-700 rounded-lg p-4 text-center"
        >
          <Brain size={24} className="text-blue-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {formatMetricValue(metrics.eeg, 'eeg')}
          </div>
          <div className="text-xs text-gray-400">
            {t('eeg') || 'EEG'}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${metrics.eeg * 100}%`,
                backgroundColor: getMetricColor(metrics.eeg, 'eeg')
              }}
            />
          </div>
        </motion.div>

        {/* Motion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-700 rounded-lg p-4 text-center"
        >
          <Activity size={24} className="text-green-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {formatMetricValue(metrics.motion, 'motion')}
          </div>
          <div className="text-xs text-gray-400">
            {t('activity') || 'Activity'}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${metrics.motion * 100}%`,
                backgroundColor: getMetricColor(metrics.motion, 'motion')
              }}
            />
          </div>
        </motion.div>

        {/* Temperature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-700 rounded-lg p-4 text-center"
        >
          <Thermometer size={24} className="text-orange-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {formatMetricValue(metrics.temperature, 'temperature')}
          </div>
          <div className="text-xs text-gray-400">
            {t('temperature') || 'Temperature'}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${metrics.temperature * 100}%`,
                backgroundColor: getMetricColor(metrics.temperature, 'temperature')
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Device Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Battery Level */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Battery size={16} className="text-green-400" />
            <span className="text-sm font-medium text-gray-300">
              {t('batteryLevel') || 'Battery Level'}
            </span>
          </div>
          <div className="text-lg font-semibold text-white">
            {deviceStatus.batteryLevel}%
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                deviceStatus.batteryLevel > 50 ? 'bg-green-500' : 
                deviceStatus.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${deviceStatus.batteryLevel}%` }}
            />
          </div>
        </div>

        {/* Signal Strength */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Wifi size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              {t('signalStrength') || 'Signal Strength'}
            </span>
          </div>
          <div className="text-lg font-semibold text-white">
            {Math.round(deviceStatus.signalStrength * 100)}%
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                deviceStatus.signalStrength > 0.8 ? 'bg-green-500' : 
                deviceStatus.signalStrength > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${deviceStatus.signalStrength * 100}%` }}
            />
          </div>
        </div>

        {/* Last Update */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-gray-300">
              {t('lastUpdate') || 'Last Update'}
            </span>
          </div>
          <div className="text-lg font-semibold text-white">
            {deviceStatus.lastUpdate ? 
              new Date(deviceStatus.lastUpdate).toLocaleTimeString() : 
              t('never') || 'Never'
            }
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {deviceStatus.lastUpdate ? 
              `${Math.round((Date.now() - deviceStatus.lastUpdate) / 1000)}s ago` : 
              t('noData') || 'No data'
            }
          </div>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {dataQuality < 0.5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="text-sm text-red-300">
                {t('lowDataQuality') || 'Low data quality detected. Check device connection.'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BiofeedbackDashboard; 