# Technical Integration Documentation
## External Device Integration for Biofeedback Gaming

### Overview
This document describes the technical implementation of integrating external biofeedback devices (Galaxy Watch6, BLE sensors) with the Napięcie party game application. The integration enables real-time physiological data collection and analysis to enhance gameplay experience.

## 1. Physiological Data Reading

### 1.1 Data Sources
- **Galaxy Watch6**: Heart rate, motion, temperature, battery level
- **BLE Sensors**: GSR (Galvanic Skin Response), EEG (Electroencephalography)
- **Health Connect API**: Historical data and trends
- **Samsung Health SDK**: Real-time sensor data

### 1.2 Data Collection Architecture

```javascript
// Device Manager handles multiple device types
class DeviceManager {
  // Device registry for plug-and-play architecture
  deviceRegistry = new Map();
  
  // Data aggregation from multiple sources
  aggregatedData = {
    heartRate: null,
    gsr: null,
    eeg: null,
    motion: null,
    temperature: null
  };
}
```

### 1.3 Real-time Data Flow
1. **Device Discovery**: Bluetooth LE scanning for compatible devices
2. **Connection Management**: Automatic pairing and connection monitoring
3. **Data Streaming**: Continuous data collection with configurable frequency
4. **Quality Assessment**: Real-time data validation and quality scoring
5. **State Computation**: Physiological state analysis and trend detection

## 2. APIs and SDKs

### 2.1 Samsung Health SDK
```javascript
// Galaxy Watch6 integration
const samsungHealth = {
  // Initialize SDK
  initialize: async () => {
    await SamsungHealth.initialize({
      appId: 'your-app-id',
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret'
    });
  },
  
  // Request permissions
  requestPermissions: async () => {
    const permissions = [
      'com.samsung.android.health.permission.read',
      'com.samsung.android.health.permission.write'
    ];
    return await SamsungHealth.requestPermissions(permissions);
  },
  
  // Subscribe to real-time data
  subscribeToHeartRate: (callback) => {
    SamsungHealth.subscribe('heart_rate', callback);
  }
};
```

### 2.2 Health Connect API
```javascript
// Android Health Connect integration
const healthConnect = {
  // Check availability
  isAvailable: async () => {
    return await HealthConnect.isAvailable();
  },
  
  // Request permissions
  requestPermissions: async () => {
    const permissions = [
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'SleepSession' }
    ];
    return await HealthConnect.requestPermissions(permissions);
  },
  
  // Read historical data
  readHeartRate: async (startTime, endTime) => {
    return await HealthConnect.readRecords('HeartRate', {
      timeRangeFilter: { startTime, endTime }
    });
  }
};
```

### 2.3 BLE GATT Protocol
```javascript
// Bluetooth Low Energy integration
const bleManager = {
  // Scan for devices
  scanForDevices: async () => {
    return await BleManager.scan([], 5, true);
  },
  
  // Connect to device
  connectToDevice: async (deviceId) => {
    const device = await BleManager.connect(deviceId);
    await device.discoverAllServicesAndCharacteristics();
    return device;
  },
  
  // Read characteristic
  readCharacteristic: async (deviceId, serviceUUID, characteristicUUID) => {
    return await BleManager.read(deviceId, serviceUUID, characteristicUUID);
  },
  
  // Subscribe to notifications
  subscribeToCharacteristic: async (deviceId, serviceUUID, characteristicUUID, callback) => {
    return await BleManager.startNotification(deviceId, serviceUUID, characteristicUUID, callback);
  }
};
```

## 3. Data Mapping to User State

### 3.1 Physiological State Analysis
```javascript
class PlayerStatusEngine {
  // State definitions
  stateDefinitions = {
    relaxed: { arousalLevel: 0.2, confidence: 0.8 },
    normal: { arousalLevel: 0.5, confidence: 0.9 },
    focused: { arousalLevel: 0.7, confidence: 0.85 },
    anxious: { arousalLevel: 0.8, confidence: 0.75 },
    overstimulated: { arousalLevel: 0.95, confidence: 0.7 }
  };
  
  // Calculate arousal score from metrics
  calculateArousalScore(metrics) {
    const { heartRate, gsr, motion, eeg } = metrics;
    
    return (
      heartRate * 0.4 +    // Heart rate weight
      gsr * 0.3 +         // GSR weight
      motion * 0.2 +      // Motion weight
      eeg * 0.1           // EEG weight
    );
  }
}
```

### 3.2 Game Adaptation Logic
```javascript
// Game intensity adaptation based on player state
const gameAdaptation = {
  // Update game intensity based on player arousal
  updateGameIntensity: (arousalScore) => {
    let intensity = 'normal';
    
    if (arousalScore < 0.3) intensity = 'low';
    else if (arousalScore < 0.6) intensity = 'normal';
    else if (arousalScore < 0.8) intensity = 'high';
    else intensity = 'extreme';
    
    return intensity;
  },
  
  // Card selection based on player state
  selectAppropriateCard: (playerState, availableCards) => {
    const { arousalScore, confidence } = playerState;
    
    return availableCards.filter(card => {
      // Match card intensity to player state
      const intensityMatch = Math.abs(card.intensity - arousalScore) < 0.2;
      
      // Consider player confidence
      const confidenceMatch = card.intensity <= confidence + 0.1;
      
      return intensityMatch && confidenceMatch;
    });
  }
};
```

## 4. Security and Privacy

### 4.1 Data Privacy
- **Local Processing**: All physiological data is processed locally on the device
- **No Cloud Storage**: No personal health data is transmitted to external servers
- **Encrypted Storage**: Local data storage uses device encryption
- **User Consent**: Explicit permission required for each data type

### 4.2 App Permissions
```xml
<!-- Android Manifest Permissions -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Health Connect Permissions -->
<uses-permission android:name="android.permission.health.READ_HEART_RATE" />
<uses-permission android:name="android.permission.health.READ_STEPS" />
<uses-permission android:name="android.permission.health.READ_SLEEP" />
```

### 4.3 Data Retention Policy
- **Session Data**: Deleted after game session ends
- **Historical Data**: User-controlled retention (7 days default)
- **Analytics Data**: Anonymized and aggregated only

## 5. Implementation Examples

### 5.1 Device Connection Flow
```javascript
// Complete device connection example
const connectDevice = async () => {
  try {
    // 1. Check permissions
    const hasPermissions = await checkPermissions();
    if (!hasPermissions) {
      await requestPermissions();
    }
    
    // 2. Scan for devices
    const devices = await bleManager.scanForDevices();
    const targetDevice = devices.find(d => d.name.includes('Galaxy Watch6'));
    
    // 3. Connect to device
    const connectedDevice = await bleManager.connectToDevice(targetDevice.id);
    
    // 4. Subscribe to data
    await bleManager.subscribeToCharacteristic(
      connectedDevice.id,
      HEART_RATE_SERVICE_UUID,
      HEART_RATE_CHARACTERISTIC_UUID,
      handleHeartRateData
    );
    
    // 5. Update device status
    DeviceManager.emit('deviceConnected', connectedDevice);
    
  } catch (error) {
    console.error('Device connection failed:', error);
  }
};
```

### 5.2 Data Processing Pipeline
```javascript
// Real-time data processing
const processPhysiologicalData = (rawData) => {
  // 1. Normalize data
  const normalizedData = DataProcessor.normalizeData(rawData.type, rawData.value);
  
  // 2. Apply noise filtering
  const filteredData = DataProcessor.applyNoiseFilter(rawData.type, normalizedData);
  
  // 3. Update player state
  PlayerStatusEngine.updateState({
    [rawData.type]: filteredData
  });
  
  // 4. Emit processed data
  DataProcessor.emit('dataProcessed', {
    type: rawData.type,
    value: filteredData,
    quality: DataProcessor.getDataQuality(rawData.type)
  });
};
```

## 6. Error Handling and Fallbacks

### 6.1 Connection Failures
- **Automatic Retry**: Exponential backoff for connection attempts
- **Mock Data**: Fallback to simulated data for development/testing
- **Graceful Degradation**: Game continues without biofeedback features

### 6.2 Data Quality Issues
- **Quality Thresholds**: Minimum quality scores for reliable data
- **Interpolation**: Fill gaps in data streams
- **User Notifications**: Alert users to connection issues

## 7. Performance Considerations

### 7.1 Battery Optimization
- **Adaptive Sampling**: Adjust data collection frequency based on battery level
- **Background Processing**: Efficient background data processing
- **Connection Management**: Smart device connection/disconnection

### 7.2 Memory Management
- **Data Buffering**: Efficient circular buffers for real-time data
- **Garbage Collection**: Proper cleanup of event listeners and timers
- **Memory Monitoring**: Track memory usage and optimize as needed

## 8. Testing and Validation

### 8.1 Unit Testing
```javascript
// Test physiological state calculation
describe('PlayerStatusEngine', () => {
  test('should calculate correct arousal score', () => {
    const metrics = { heartRate: 0.7, gsr: 0.5, motion: 0.3, eeg: 0.2 };
    const arousalScore = PlayerStatusEngine.calculateArousalScore(metrics);
    expect(arousalScore).toBeCloseTo(0.56, 2);
  });
});
```

### 8.2 Integration Testing
- **Device Simulation**: Mock device responses for testing
- **Data Validation**: Verify data accuracy and consistency
- **Performance Testing**: Measure latency and throughput

## 9. Future Enhancements

### 9.1 Planned Features
- **Multi-device Support**: Simultaneous connection to multiple sensors
- **Machine Learning**: Advanced pattern recognition for better state analysis
- **Cloud Sync**: Optional cloud backup of game preferences (no health data)

### 9.2 Platform Expansion
- **iOS Support**: HealthKit integration for Apple devices
- **Web Platform**: Web Bluetooth API for browser-based games
- **Cross-platform**: Unified API for multiple platforms

## 10. Troubleshooting

### 10.1 Common Issues
1. **Device Not Found**: Check Bluetooth permissions and device compatibility
2. **Poor Data Quality**: Verify device placement and connection stability
3. **High Battery Usage**: Adjust sampling frequency and optimize processing

### 10.2 Debug Tools
- **Data Logger**: Comprehensive logging of all data streams
- **Quality Metrics**: Real-time data quality indicators
- **Connection Monitor**: Detailed connection status and error reporting

---

*This documentation is maintained by the development team and should be updated as the integration evolves.* 