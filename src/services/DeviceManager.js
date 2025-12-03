import WearableService from './WearableService';

/**
 * Device Management Layer
 * Manages multiple connected wearable devices with plug-and-play architecture
 */
class DeviceManager {
  constructor() {
    // Simple event emitter for browser compatibility
    this.events = {};
    
    // Device registry - stores all connected devices
    this.deviceRegistry = new Map();
    
    // Device adapters - handles different device types
    this.deviceAdapters = new Map();
    
    // Connection status tracking
    this.connectionStatus = new Map();
    
    // Data aggregation
    this.aggregatedData = {
      timestamp: Date.now(),
      heartRate: null,
      gsr: null,
      eeg: null,
      activityLevel: null,
      motion: null,
      temperature: null,
      batteryLevel: null,
      signalStrength: null
    };
    
    // Player state computation
    this.playerState = {
      status: 'disconnected',
      confidence: 0,
      lastUpdate: Date.now(),
      dataQuality: 0
    };
    
    // Initialize default adapters
    this.initializeDefaultAdapters();
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
   * Initialize default device adapters
   */
  initializeDefaultAdapters() {
    // Galaxy Watch6 adapter
    this.registerDeviceAdapter('galaxy-watch6', {
      name: 'Galaxy Watch6',
      capabilities: ['heartRate', 'motion', 'temperature', 'battery'],
      service: WearableService,
      dataMapping: {
        heartRate: 'heartRate',
        motion: 'motionData',
        gyroscope: 'gyroscopeData',
        temperature: 'temperature',
        battery: 'batteryLevel'
      }
    });
  }

  /**
   * Register a new device adapter
   */
  registerDeviceAdapter(deviceType, adapter) {
    this.deviceAdapters.set(deviceType, adapter);
    console.log(`Device adapter registered: ${deviceType}`);
  }

  /**
   * Detect and register a new device
   */
  async detectAndRegisterDevice(deviceType, deviceInfo) {
    try {
      const adapter = this.deviceAdapters.get(deviceType);
      if (!adapter) {
        throw new Error(`No adapter found for device type: ${deviceType}`);
      }

      const deviceId = deviceInfo.id || `device_${Date.now()}`;
      const device = {
        id: deviceId,
        type: deviceType,
        name: deviceInfo.name || adapter.name,
        capabilities: adapter.capabilities,
        adapter: adapter,
        info: deviceInfo,
        connected: false,
        lastSeen: Date.now(),
        dataQuality: 0
      };

      this.deviceRegistry.set(deviceId, device);
      this.connectionStatus.set(deviceId, 'disconnected');
      
      console.log(`Device registered: ${device.name} (${deviceId})`);
      this.emit('deviceRegistered', device);
      
      return device;
    } catch (error) {
      console.error('Device registration failed:', error);
      throw error;
    }
  }

  /**
   * Connect to a specific device
   */
  async connectToDevice(deviceId) {
    try {
      const device = this.deviceRegistry.get(deviceId);
      if (!device) {
        throw new Error(`Device not found: ${deviceId}`);
      }

      console.log(`Connecting to device: ${device.name}`);
      
      // Use the device's adapter to connect
      const adapter = device.adapter;
      if (adapter.service && adapter.service.connectToWatch) {
        await adapter.service.connectToWatch(deviceId);
      }
      
      device.connected = true;
      device.lastSeen = Date.now();
      this.connectionStatus.set(deviceId, 'connected');
      
      // Setup data listeners
      this.setupDeviceDataListeners(device);
      
      console.log(`Device connected: ${device.name}`);
      this.emit('deviceConnected', device);
      
      return device;
    } catch (error) {
      console.error('Device connection failed:', error);
      throw error;
    }
  }

  /**
   * Setup data listeners for a device
   */
  setupDeviceDataListeners(device) {
    const adapter = device.adapter;
    if (adapter.service) {
      // Listen for heart rate data
      adapter.service.on('heartRateData', (data) => {
        this.handleDeviceData(device.id, 'heartRate', data.value);
      });
      
      // Listen for motion data
      adapter.service.on('motionData', (data) => {
        this.handleDeviceData(device.id, 'motion', data.value);
      });
    }
  }

  /**
   * Handle incoming device data
   */
  handleDeviceData(deviceId, capability, data) {
    const device = this.deviceRegistry.get(deviceId);
    if (!device) return;

    // Update device data quality
    device.dataQuality = Math.min(1, device.dataQuality + 0.1);
    
    // Update aggregated data
    this.updateAggregatedData(capability, data, deviceId);
    
    // Emit data event
    this.emit('deviceData', {
      deviceId,
      capability,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Update aggregated data from all devices
   */
  updateAggregatedData(capability, data, deviceId) {
    const device = this.deviceRegistry.get(deviceId);
    if (!device) return;

    switch (capability) {
      case 'heartRate':
        this.aggregatedData.heartRate = data;
        break;
      case 'motion':
        this.aggregatedData.motion = data;
        break;
      case 'gsr':
        this.aggregatedData.gsr = data;
        break;
      case 'eeg':
        this.aggregatedData.eeg = data;
        break;
      case 'temperature':
        this.aggregatedData.temperature = data;
        break;
      case 'battery':
        this.aggregatedData.batteryLevel = data;
        break;
    }

    this.aggregatedData.timestamp = Date.now();
    this.computePlayerState();
  }

  /**
   * Compute overall player state from aggregated data
   */
  computePlayerState() {
    const metrics = {
      heartRate: this.aggregatedData.heartRate || 0,
      gsr: this.aggregatedData.gsr || 0,
      motion: this.aggregatedData.motion || 0,
      eeg: this.aggregatedData.eeg || 0
    };

    // Calculate arousal score (0-1)
    let arousalScore = 0;
    let totalWeight = 0;

    if (metrics.heartRate > 0) {
      const heartRateNormalized = Math.min(1, (metrics.heartRate - 60) / 40);
      arousalScore += heartRateNormalized * 0.4;
      totalWeight += 0.4;
    }

    if (metrics.gsr > 0) {
      const gsrNormalized = Math.min(1, metrics.gsr / 50);
      arousalScore += gsrNormalized * 0.3;
      totalWeight += 0.3;
    }

    if (metrics.motion > 0) {
      const motionMagnitude = typeof metrics.motion === 'object' ? 
        Math.sqrt(metrics.motion.x ** 2 + metrics.motion.y ** 2 + metrics.motion.z ** 2) :
        metrics.motion;
      const motionNormalized = Math.min(1, motionMagnitude / 3);
      arousalScore += motionNormalized * 0.2;
      totalWeight += 0.2;
    }

    if (metrics.eeg > 0) {
      const eegNormalized = Math.min(1, metrics.eeg / 200);
      arousalScore += eegNormalized * 0.1;
      totalWeight += 0.1;
    }

    // Normalize arousal score
    arousalScore = totalWeight > 0 ? arousalScore / totalWeight : 0;

    // Determine player state based on arousal
    let status = 'disconnected';
    let confidence = 0;

    if (totalWeight > 0) {
      if (arousalScore < 0.3) {
        status = 'relaxed';
        confidence = 0.8;
      } else if (arousalScore < 0.5) {
        status = 'normal';
        confidence = 0.9;
      } else if (arousalScore < 0.7) {
        status = 'focused';
        confidence = 0.85;
      } else if (arousalScore < 0.8) {
        status = 'anxious';
        confidence = 0.75;
      } else {
        status = 'overstimulated';
        confidence = 0.7;
      }
    }

    // Calculate overall data quality
    const connectedDevices = Array.from(this.deviceRegistry.values()).filter(d => d.connected);
    const avgDataQuality = connectedDevices.length > 0 ? 
      connectedDevices.reduce((sum, d) => sum + d.dataQuality, 0) / connectedDevices.length : 0;

    this.playerState = {
      status,
      confidence,
      lastUpdate: Date.now(),
      dataQuality: avgDataQuality,
      metrics,
      arousalScore
    };

    this.emit('playerStateUpdated', this.playerState);
  }

  /**
   * Disconnect from a device
   */
  async disconnectDevice(deviceId) {
    try {
      const device = this.deviceRegistry.get(deviceId);
      if (!device) {
        throw new Error(`Device not found: ${deviceId}`);
      }

      console.log(`Disconnecting from device: ${device.name}`);
      
      // Use the device's adapter to disconnect
      const adapter = device.adapter;
      if (adapter.service && adapter.service.disconnect) {
        await adapter.service.disconnect();
      }
      
      device.connected = false;
      this.connectionStatus.set(deviceId, 'disconnected');
      
      console.log(`Device disconnected: ${device.name}`);
      this.emit('deviceDisconnected', device);
      
      return device;
    } catch (error) {
      console.error('Device disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Get all registered devices
   */
  getRegisteredDevices() {
    return Array.from(this.deviceRegistry.values());
  }

  /**
   * Get connected devices
   */
  getConnectedDevices() {
    return Array.from(this.deviceRegistry.values()).filter(d => d.connected);
  }

  /**
   * Get device connection status
   */
  getDeviceConnectionStatus(deviceId) {
    return this.connectionStatus.get(deviceId) || 'unknown';
  }

  /**
   * Get aggregated data
   */
  getAggregatedData() {
    return { ...this.aggregatedData };
  }

  /**
   * Get current player state
   */
  getPlayerState() {
    return { ...this.playerState };
  }

  /**
   * Get specific device
   */
  getDevice(deviceId) {
    return this.deviceRegistry.get(deviceId);
  }

  /**
   * Remove a device
   */
  removeDevice(deviceId) {
    const device = this.deviceRegistry.get(deviceId);
    if (device) {
      this.deviceRegistry.delete(deviceId);
      this.connectionStatus.delete(deviceId);
      this.emit('deviceRemoved', device);
      console.log(`Device removed: ${device.name}`);
    }
  }

  /**
   * Get available adapters
   */
  getAvailableAdapters() {
    return Array.from(this.deviceAdapters.entries()).map(([type, adapter]) => ({
      type,
      name: adapter.name,
      capabilities: adapter.capabilities
    }));
  }

  /**
   * Check if device type is supported
   */
  isDeviceTypeSupported(deviceType) {
    return this.deviceAdapters.has(deviceType);
  }

  /**
   * Get device signal strength (mock implementation)
   */
  getDeviceSignalStrength(deviceId) {
    const device = this.deviceRegistry.get(deviceId);
    if (!device) return 0;
    
    // Mock signal strength based on device info
    return device.info.signalStrength || 0.8;
  }

  /**
   * Check compatibility (mock implementation)
   */
  async checkCompatibility() {
    try {
      const compatibility = await WearableService.checkCompatibility();
      return compatibility;
    } catch (error) {
      console.error('Compatibility check failed:', error);
      return {
        compatible: false,
        error: error.message,
        availableDevices: []
      };
    }
  }

  /**
   * Discover Galaxy Watch6 devices (mock implementation)
   */
  async discoverGalaxyWatch6() {
    try {
      const devices = await WearableService.discoverGalaxyWatch6();
      return devices;
    } catch (error) {
      console.error('Device discovery failed:', error);
      return [];
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Disconnect all devices
    this.deviceRegistry.forEach((device, deviceId) => {
      if (device.connected) {
        this.disconnectDevice(deviceId);
      }
    });
    
    this.deviceRegistry.clear();
    this.connectionStatus.clear();
    this.removeAllListeners();
    
    console.log('DeviceManager destroyed');
  }
}

// Create singleton instance
const deviceManager = new DeviceManager();

export default deviceManager; 