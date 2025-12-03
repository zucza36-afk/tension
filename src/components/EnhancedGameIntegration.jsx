import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Brain, 
  Zap, 
  Activity, 
  Settings, 
  BarChart3,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import DeviceManager from '../services/DeviceManager';
import PlayerStatusEngine from '../services/PlayerStatusEngine';
import DataProcessor from '../services/DataProcessor';
import PlayerStatusHUD from './PlayerStatusHUD';
import DeviceManagementPanel from './DeviceManagementPanel';
import { useGameStore } from '../store/gameStore';
import { useLanguageStore } from '../store/languageStore';
import { getTranslation } from '../utils/translations';

/**
 * Enhanced Game Integration Component
 * Demonstrates comprehensive wearable and biofeedback integration
 */
const EnhancedGameIntegration = () => {
  const { language } = useLanguageStore();
  const { gameStatus, currentCard, updateGameIntensity } = useGameStore();
  
  // State management
  const [playerState, setPlayerState] = useState(null);
  const [showHUD, setShowHUD] = useState(true);
  const [showDevicePanel, setShowDevicePanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [gameIntensity, setGameIntensity] = useState('normal');
  const [biofeedbackEnabled, setBiofeedbackEnabled] = useState(true);
  
  // Refs for cleanup
  const eventListeners = useRef([]);

  const t = (key) => getTranslation(key, language);

  useEffect(() => {
    setupEventListeners();
    initializeIntegration();
    
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
      { source: PlayerStatusEngine, event: 'stateChanged', handler: handlePlayerStateChange },
      { source: PlayerStatusEngine, event: 'stateUpdated', handler: handlePlayerStateUpdate },
      
      // Device events
      { source: DeviceManager, event: 'deviceConnected', handler: handleDeviceEvent },
      { source: DeviceManager, event: 'deviceDisconnected', handler: handleDeviceEvent },
      
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
   * Initialize integration
   */
  const initializeIntegration = () => {
    const currentState = PlayerStatusEngine.getCurrentState();
    setPlayerState(currentState);
  };

  /**
   * Event handlers
   */
  const handlePlayerStateChange = (event) => {
    const { newState, state } = event;
    setPlayerState(state);
    
    // Update game intensity based on player state
    if (biofeedbackEnabled) {
      updateGameIntensityFromState(newState);
    }
  };

  const handlePlayerStateUpdate = (state) => {
    setPlayerState(state);
  };

  const handleDeviceEvent = (device) => {
    console.log('Device event:', device.name, device.connected ? 'connected' : 'disconnected');
  };

  const handleDataProcessed = (data) => {
    // Handle processed biofeedback data
    console.log('Data processed:', data.dataType, data.value);
  };

  /**
   * Update game intensity based on player state
   */
  const updateGameIntensityFromState = (state) => {
    let intensity = 'normal';
    
    switch (state) {
      case 'relaxed':
        intensity = 'low';
        break;
      case 'normal':
        intensity = 'normal';
        break;
      case 'focused':
        intensity = 'medium';
        break;
      case 'anxious':
        intensity = 'high';
        break;
      case 'overstimulated':
        intensity = 'extreme';
        break;
      default:
        intensity = 'normal';
    }
    
    setGameIntensity(intensity);
    updateGameIntensity(intensity);
  };

  /**
   * Toggle biofeedback integration
   */
  const toggleBiofeedback = () => {
    setBiofeedbackEnabled(!biofeedbackEnabled);
    
    if (!biofeedbackEnabled) {
      alert(
        t('biofeedbackEnabled') || 'Biofeedback Enabled',
        t('biofeedbackEnabledMessage') || 'Game will now adapt to your physiological state'
      );
    } else {
      alert(
        t('biofeedbackDisabled') || 'Biofeedback Disabled',
        t('biofeedbackDisabledMessage') || 'Game will use default intensity settings'
      );
    }
  };

  /**
   * Get intensity color
   */
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'low': return '#10B981';
      case 'normal': return '#3B82F6';
      case 'medium': return '#8B5CF6';
      case 'high': return '#F59E0B';
      case 'extreme': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  /**
   * Get state color
   */
  const getStateColor = (status) => {
    const stateDef = PlayerStatusEngine.getStateDefinition(status);
    return stateDef.color;
  };

  return (
    <div className="flex-1 bg-gray-800">
      {/* Main Game Area */}
      <div className="flex-1 p-5">
        {/* Game Status */}
        <div className="bg-gray-700 rounded-xl p-4 mb-4">
          <div className="text-white font-semibold text-base mb-2">
            {t('gameStatus') || 'Game Status'}: {t(gameStatus) || gameStatus}
          </div>
          {currentCard && (
            <div className="text-gray-300 text-sm">
              {t('currentCard') || 'Current Card'}: {currentCard.title}
            </div>
          )}
        </div>

        {/* Biofeedback Status */}
        <div className="bg-gray-700 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-400 text-sm">
              {t('playerState') || 'Player State'}:
            </div>
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getStateColor(playerState?.status || 'disconnected') }}
              />
              <div 
                className="text-sm font-semibold"
                style={{ color: getStateColor(playerState?.status || 'disconnected') }}
              >
                {t(playerState?.status || 'disconnected') || (playerState?.status || 'Disconnected')}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-400 text-sm">
              {t('gameIntensity') || 'Game Intensity'}:
            </div>
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getIntensityColor(gameIntensity) }}
              />
              <div 
                className="text-sm font-semibold"
                style={{ color: getIntensityColor(gameIntensity) }}
              >
                {t(gameIntensity) || gameIntensity}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              {t('confidence') || 'Confidence'}:
            </div>
            <div className="text-sm font-semibold text-green-400">
              {Math.round((playerState?.confidence || 0) * 100)}%
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex-1 transition-colors"
            onClick={() => setShowHUD(!showHUD)}
          >
            <BarChart3 size={20} className="mr-2" />
            <span className="text-xs font-semibold">
              {showHUD ? t('hideHUD') || 'Hide HUD' : t('showHUD') || 'Show HUD'}
            </span>
          </button>

          <button
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex-1 transition-colors"
            onClick={() => setShowDevicePanel(true)}
          >
            <Settings size={20} className="mr-2" />
            <span className="text-xs font-semibold">
              {t('manageDevices') || 'Manage Devices'}
            </span>
          </button>

          <button
            className={`flex items-center text-white py-3 px-4 rounded-lg flex-1 transition-colors ${
              biofeedbackEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            onClick={toggleBiofeedback}
          >
            <Brain size={20} className="mr-2" />
            <span className="text-xs font-semibold">
              {biofeedbackEnabled ? t('disableBiofeedback') || 'Disable Biofeedback' : t('enableBiofeedback') || 'Enable Biofeedback'}
            </span>
          </button>
        </div>

        {/* Metrics Display */}
        <div className="bg-gray-700 rounded-xl p-4 mb-4">
          <div className="text-white font-semibold text-base mb-3">
            {t('realTimeMetrics') || 'Real-time Metrics'}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Heart Rate */}
            <div className="bg-gray-600 rounded-lg p-3 text-center">
              <Heart size={24} className="text-red-500 mx-auto mb-1" />
              <div className="text-white font-bold text-lg">
                {playerState?.metrics?.heartRate ? 
                  Math.round(playerState.metrics.heartRate * 100) : 0}%
              </div>
              <div className="text-gray-400 text-xs">
                {t('heartRate') || 'Heart Rate'}
              </div>
            </div>

            {/* GSR */}
            <div className="bg-gray-600 rounded-lg p-3 text-center">
              <Zap size={24} className="text-purple-500 mx-auto mb-1" />
              <div className="text-white font-bold text-lg">
                {playerState?.metrics?.gsr ? 
                  Math.round(playerState.metrics.gsr * 100) : 0}%
              </div>
              <div className="text-gray-400 text-xs">
                {t('gsr') || 'GSR'}
              </div>
            </div>

            {/* Motion */}
            <div className="bg-gray-600 rounded-lg p-3 text-center">
              <Activity size={24} className="text-green-500 mx-auto mb-1" />
              <div className="text-white font-bold text-lg">
                {playerState?.metrics?.motion ? 
                  Math.round(playerState.metrics.motion * 100) : 0}%
              </div>
              <div className="text-gray-400 text-xs">
                {t('activity') || 'Activity'}
              </div>
            </div>

            {/* EEG */}
            <div className="bg-gray-600 rounded-lg p-3 text-center">
              <Brain size={24} className="text-blue-500 mx-auto mb-1" />
              <div className="text-white font-bold text-lg">
                {playerState?.metrics?.eeg ? 
                  Math.round(playerState.metrics.eeg * 100) : 0}%
              </div>
              <div className="text-gray-400 text-xs">
                {t('eeg') || 'EEG'}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-700 rounded-xl p-4">
          <div className="text-white font-semibold text-base mb-2">
            {t('deviceConnection') || 'Device Connection'}
          </div>
          <div className="space-y-1">
            <div className="text-gray-300 text-xs">
              {t('connectedDevices') || 'Connected Devices'}: {DeviceManager.getConnectedDevices().length}
            </div>
            <div className="text-gray-300 text-xs">
              {t('totalDevices') || 'Total Devices'}: {DeviceManager.getRegisteredDevices().length}
            </div>
            <div className="text-gray-300 text-xs">
              {t('dataQuality') || 'Data Quality'}: {Math.round(DataProcessor.getOverallDataQuality() * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Player Status HUD */}
      <AnimatePresence>
        {showHUD && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 right-0 h-full"
          >
            <PlayerStatusHUD />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device Management Panel */}
      <DeviceManagementPanel
        isVisible={showDevicePanel}
        onClose={() => setShowDevicePanel(false)}
      />

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-5 right-5 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors"
          onClick={() => setShowDevicePanel(true)}
        >
          <Settings size={24} className="text-white" />
        </button>
      </motion.div>
    </div>
  );
};

export default EnhancedGameIntegration; 