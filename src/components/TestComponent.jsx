import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Brain, Zap } from 'lucide-react';
import DeviceManager from '../services/DeviceManager';
import PlayerStatusEngine from '../services/PlayerStatusEngine';
import DataProcessor from '../services/DataProcessor';

const TestComponent = () => {
  const [testData, setTestData] = useState({
    devices: [],
    playerState: null,
    dataQuality: 0
  });

  useEffect(() => {
    // Test the services
    const testServices = async () => {
      try {
        // Test DeviceManager
        const devices = DeviceManager.getRegisteredDevices();
        console.log('Registered devices:', devices);

        // Test PlayerStatusEngine
        const playerState = PlayerStatusEngine.getCurrentState();
        console.log('Player state:', playerState);

        // Test DataProcessor
        const dataQuality = DataProcessor.getOverallDataQuality();
        console.log('Data quality:', dataQuality);

        setTestData({
          devices,
          playerState,
          dataQuality
        });

        // Test device discovery
        const mockDevice = {
          id: 'test-device-1',
          name: 'Test Galaxy Watch6',
          type: 'galaxy-watch6',
          capabilities: ['heartRate', 'motion', 'temperature'],
          signalStrength: 0.9,
          batteryLevel: 0.85
        };

        await DeviceManager.detectAndRegisterDevice('galaxy-watch6', mockDevice);
        console.log('Test device registered');

        // Connect to the test device
        await DeviceManager.connectToDevice('test-device-1');
        console.log('Test device connected');

      } catch (error) {
        console.error('Test failed:', error);
      }
    };

    testServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Wearable Integration Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Device Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Registered Devices:</span>
                <span className="text-blue-400">{testData.devices.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Connected Devices:</span>
                <span className="text-green-400">
                  {testData.devices.filter(d => d.connected).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Data Quality:</span>
                <span className="text-yellow-400">
                  {Math.round(testData.dataQuality * 100)}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Player State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Player State</h2>
            {testData.playerState ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span 
                    className="px-2 py-1 rounded text-sm"
                    style={{ 
                      backgroundColor: testData.playerState.status === 'disconnected' ? '#6B7280' : '#10B981',
                      color: 'white'
                    }}
                  >
                    {testData.playerState.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confidence:</span>
                  <span className="text-green-400">
                    {Math.round((testData.playerState.confidence || 0) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Update:</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(testData.playerState.lastUpdate || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Loading player state...</p>
            )}
          </motion.div>

          {/* Mock Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Mock Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {Math.floor(60 + Math.random() * 40)}
                </div>
                <div className="text-sm text-gray-400">BPM</div>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {Math.floor(Math.random() * 100)}
                </div>
                <div className="text-sm text-gray-400">GSR</div>
              </div>
              <div className="text-center">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {Math.floor(Math.random() * 100)}
                </div>
                <div className="text-sm text-gray-400">Motion</div>
              </div>
              <div className="text-center">
                <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {Math.floor(Math.random() * 100)}
                </div>
                <div className="text-sm text-gray-400">EEG</div>
              </div>
            </div>
          </motion.div>

          {/* Service Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Service Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>DeviceManager:</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PlayerStatusEngine:</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>DataProcessor:</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>WearableService:</span>
                <span className="text-green-400">✓ Mock Active</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Test Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gray-800 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={async () => {
                try {
                  const devices = await DeviceManager.discoverGalaxyWatch6();
                  console.log('Discovered devices:', devices);
                  alert(`Discovered ${devices.length} devices`);
                } catch (error) {
                  console.error('Discovery failed:', error);
                  alert('Discovery failed: ' + error.message);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Device Discovery
            </button>
            
            <button
              onClick={async () => {
                try {
                  const compatibility = await DeviceManager.checkCompatibility();
                  console.log('Compatibility check:', compatibility);
                  alert(`Compatibility: ${compatibility.compatible ? 'Yes' : 'No'}`);
                } catch (error) {
                  console.error('Compatibility check failed:', error);
                  alert('Compatibility check failed: ' + error.message);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Compatibility
            </button>
            
            <button
              onClick={() => {
                const state = PlayerStatusEngine.getCurrentState();
                console.log('Current state:', state);
                alert(`Current state: ${state.status}`);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Player State
            </button>
            
            <button
              onClick={() => {
                const quality = DataProcessor.getOverallDataQuality();
                console.log('Data quality:', quality);
                alert(`Data quality: ${Math.round(quality * 100)}%`);
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Data Quality
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TestComponent; 