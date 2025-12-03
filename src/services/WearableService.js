/**
 * Galaxy Watch6 Integration Service (Web Mock)
 * Handles compatibility check, connection, data synchronization, and error handling
 * Mock implementation for web development
 */
class WearableService {
  constructor() {
    // Simple event emitter for browser compatibility
    this.events = {};
    
    // Service and characteristic UUIDs for Galaxy Watch6
    this.WATCH_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb'; // Health service
    this.HEART_RATE_CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
    this.MOTION_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Motion service
    this.ACCELEROMETER_CHARACTERISTIC_UUID = '00002a6d-0000-1000-8000-00805f9b34fb';
    this.GYROSCOPE_CHARACTERISTIC_UUID = '00002a6e-0000-1000-8000-00805f9b34fb';
    
    // Service and characteristic UUIDs for Galaxy Watch6
    this.WATCH_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb'; // Health service
    this.HEART_RATE_CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
    this.MOTION_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Motion service
    this.ACCELEROMETER_CHARACTERISTIC_UUID = '00002a6d-0000-1000-8000-00805f9b34fb';
    this.GYROSCOPE_CHARACTERISTIC_UUID = '00002a6e-0000-1000-8000-00805f9b34fb';
    
    // Connection state
    this.isConnected = false;
    this.watchDevice = null;
    this.connectionRetryCount = 0;
    this.maxRetryAttempts = 3;
    
    // Data buffers for real-time streaming
    this.heartRateData = [];
    this.motionData = [];
    this.interactionData = [];
    
    // Mock data generation
    this.mockDataInterval = null;
    this.setupMockDataGeneration();
  }

  // Simple event emitter methods for browser compatibility
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }

  /**
   * Setup mock data generation for web development
   */
  setupMockDataGeneration() {
    // Generate mock heart rate data
    this.mockDataInterval = setInterval(() => {
      if (this.isConnected) {
        const mockHeartRate = 60 + Math.random() * 40; // 60-100 BPM
        const mockMotion = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2
        };
        
        this.heartRateData.push({
          timestamp: Date.now(),
          value: mockHeartRate
        });
        
        this.motionData.push({
          timestamp: Date.now(),
          value: mockMotion
        });
        
        // Emit mock data events
        this.emit('heartRateData', { value: mockHeartRate, timestamp: Date.now() });
        this.emit('motionData', { value: mockMotion, timestamp: Date.now() });
        
        // Keep only last 100 data points
        if (this.heartRateData.length > 100) {
          this.heartRateData.shift();
        }
        if (this.motionData.length > 100) {
          this.motionData.shift();
        }
      }
    }, 1000); // Update every second
  }

  /**
   * 1. COMPATIBILITY CHECK
   * Detect Galaxy Watch6 and check required capabilities
   */
  async checkCompatibility() {
    try {
      console.log('Checking Galaxy Watch6 compatibility (Web Mock)...');
      
      // Mock compatibility check for web
      const mockDevices = [
        {
          id: 'mock-galaxy-watch6-1',
          name: 'Galaxy Watch6 (Mock)',
          model: 'SM-R955F',
          firmware: 'R955FXXU1AWF2',
          batteryLevel: 85,
          signalStrength: 0.9
        }
      ];

      console.log('Compatibility check passed (Mock)');
      return {
        compatible: true,
        availableDevices: mockDevices,
        capabilities: {
          bluetooth: true,
          wifi: true,
          heartRate: true,
          accelerometer: true,
          gyroscope: true
        }
      };

    } catch (error) {
      console.error('Compatibility check failed:', error);
      this.emit('compatibilityCheckFailed', error);
      return {
        compatible: false,
        error: error.message,
        availableDevices: []
      };
    }
  }

  /**
   * Check required permissions (Mock for web)
   */
  async checkRequiredPermissions() {
    // Mock permissions for web
    return {
      allGranted: true,
      missing: [],
      permissions: {
        bluetooth: true,
        location: true,
        bluetoothScan: true,
        bluetoothConnect: true
      }
    };
  }

  /**
   * Discover Galaxy Watch6 devices (Mock)
   */
  async discoverGalaxyWatch6() {
    console.log('Discovering Galaxy Watch6 devices (Mock)...');
    
    // Simulate discovery delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockDevices = [
      {
        id: 'mock-galaxy-watch6-1',
        name: 'Galaxy Watch6 (Mock)',
        model: 'SM-R955F',
        firmware: 'R955FXXU1AWF2',
        batteryLevel: 85,
        signalStrength: 0.9,
        capabilities: ['heartRate', 'motion', 'temperature']
      },
      {
        id: 'mock-galaxy-watch6-2',
        name: 'Galaxy Watch6 Classic (Mock)',
        model: 'SM-R965F',
        firmware: 'R965FXXU1AWF2',
        batteryLevel: 72,
        signalStrength: 0.7,
        capabilities: ['heartRate', 'motion', 'temperature', 'eeg']
      }
    ];
    
    console.log('Discovered devices:', mockDevices);
    return mockDevices;
  }

  /**
   * Check if device is Galaxy Watch6 (Mock)
   */
  isGalaxyWatch6(device) {
    // Mock device identification
    return device.name && device.name.includes('Galaxy Watch6');
  }

  /**
   * Check WiFi capability (Mock)
   */
  async checkWiFiCapability() {
    return true; // Mock WiFi capability
  }

  /**
   * Connect to Galaxy Watch6 (Mock)
   */
  async connectToWatch(deviceId) {
    try {
      console.log(`Connecting to Galaxy Watch6 (Mock): ${deviceId}`);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.watchDevice = {
        id: deviceId,
        name: 'Galaxy Watch6 (Mock)',
        model: 'SM-R955F',
        firmware: 'R955FXXU1AWF2',
        batteryLevel: 85,
        signalStrength: 0.9
      };
      
      this.isConnected = true;
      this.connectionRetryCount = 0;
      
      console.log('Successfully connected to Galaxy Watch6 (Mock)');
      this.emit('connected', this.watchDevice);
      
      // Setup data streaming
      await this.setupDataStreaming(this.watchDevice);
      
      return this.watchDevice;
      
    } catch (error) {
      console.error('Connection failed:', error);
      this.emit('connectionFailed', error);
      throw error;
    }
  }

  /**
   * Authenticate connection (Mock)
   */
  async authenticateConnection(device) {
    console.log('Authenticating connection (Mock)...');
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Authentication successful (Mock)');
    return true;
  }

  /**
   * Setup data streaming (Mock)
   */
  async setupDataStreaming(device) {
    console.log('Setting up data streaming (Mock)...');
    
    // Setup heart rate monitoring
    await this.setupHeartRateMonitoring(device);
    
    // Setup motion monitoring
    await this.setupMotionMonitoring(device);
    
    // Setup interaction monitoring
    await this.setupInteractionMonitoring(device);
    
    console.log('Data streaming setup complete (Mock)');
  }

  /**
   * Setup heart rate monitoring (Mock)
   */
  async setupHeartRateMonitoring(device) {
    console.log('Setting up heart rate monitoring (Mock)...');
    
    // Mock heart rate data generation is handled in setupMockDataGeneration
    this.emit('heartRateMonitoringStarted', { deviceId: device.id });
  }

  /**
   * Setup motion monitoring (Mock)
   */
  async setupMotionMonitoring(device) {
    console.log('Setting up motion monitoring (Mock)...');
    
    // Mock motion data generation is handled in setupMockDataGeneration
    this.emit('motionMonitoringStarted', { deviceId: device.id });
  }

  /**
   * Setup interaction monitoring (Mock)
   */
  async setupInteractionMonitoring(device) {
    console.log('Setting up interaction monitoring (Mock)...');
    
    // Mock interaction events
    setInterval(() => {
      if (this.isConnected) {
        const mockInteraction = {
          type: Math.random() > 0.5 ? 'tap' : 'swipe',
          timestamp: Date.now(),
          intensity: Math.random()
        };
        
        this.interactionData.push(mockInteraction);
        this.emit('interactionDetected', mockInteraction);
        
        if (this.interactionData.length > 50) {
          this.interactionData.shift();
        }
      }
    }, 5000); // Mock interaction every 5 seconds
  }

  /**
   * Parse heart rate data (Mock)
   */
  parseHeartRateData(value) {
    // Mock heart rate parsing
    return {
      heartRate: value,
      energyExpended: Math.random() * 100,
      rrIntervals: []
    };
  }

  /**
   * Parse motion data (Mock)
   */
  parseMotionData(value) {
    // Mock motion data parsing
    return {
      accelerometer: value,
      gyroscope: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
      }
    };
  }

  /**
   * Parse gyroscope data (Mock)
   */
  parseGyroscopeData(value) {
    // Mock gyroscope data parsing
    return {
      x: value.x || 0,
      y: value.y || 0,
      z: value.z || 0
    };
  }

  /**
   * Handle disconnection (Mock)
   */
  async handleDisconnection() {
    console.log('Handling disconnection (Mock)...');
    
    this.isConnected = false;
    this.watchDevice = null;
    
    this.emit('disconnected');
    
    // Attempt reconnection if retry count is within limits
    if (this.connectionRetryCount < this.maxRetryAttempts) {
      setTimeout(() => {
        this.attemptReconnection();
      }, 5000);
    }
  }

  /**
   * Attempt reconnection (Mock)
   */
  async attemptReconnection() {
    if (this.connectionRetryCount >= this.maxRetryAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }
    
    this.connectionRetryCount++;
    console.log(`Attempting reconnection ${this.connectionRetryCount}/${this.maxRetryAttempts} (Mock)...`);
    
    try {
      if (this.watchDevice) {
        await this.connectToWatch(this.watchDevice.id);
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }

  /**
   * Disconnect from device (Mock)
   */
  async disconnect() {
    console.log('Disconnecting from Galaxy Watch6 (Mock)...');
    
    this.isConnected = false;
    this.watchDevice = null;
    this.connectionRetryCount = 0;
    
    // Clear mock data interval
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
    }
    
    // Clear data buffers
    this.heartRateData = [];
    this.motionData = [];
    this.interactionData = [];
    
    this.emit('disconnected');
    console.log('Disconnected from Galaxy Watch6 (Mock)');
  }

  /**
   * Get connection status (Mock)
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      device: this.watchDevice,
      retryCount: this.connectionRetryCount,
      signalStrength: this.watchDevice?.signalStrength || 0,
      batteryLevel: this.watchDevice?.batteryLevel || 0
    };
  }

  /**
   * Get latest data (Mock)
   */
  getLatestData() {
    return {
      heartRate: this.heartRateData[this.heartRateData.length - 1] || null,
      motion: this.motionData[this.motionData.length - 1] || null,
      interaction: this.interactionData[this.interactionData.length - 1] || null
    };
  }

  /**
   * Get all data (Mock)
   */
  getAllData() {
    return {
      heartRate: this.heartRateData,
      motion: this.motionData,
      interaction: this.interactionData
    };
  }

  /**
   * Clear data buffers (Mock)
   */
  clearData() {
    this.heartRateData = [];
    this.motionData = [];
    this.interactionData = [];
    console.log('Data buffers cleared (Mock)');
  }

  /**
   * Destroy service (Mock)
   */
  destroy() {
    console.log('Destroying WearableService (Mock)...');
    
    this.disconnect();
    this.removeAllListeners();
    
    console.log('WearableService destroyed (Mock)');
  }
}

// Create singleton instance
const wearableService = new WearableService();

export default wearableService; 