# Wearable Integration for Napięcie Game

## Overview

The Napięcie game now includes comprehensive wearable device integration, specifically designed for Galaxy Watch6 compatibility. This integration provides real-time biofeedback data to enhance the gaming experience by adapting game intensity based on player physiological responses.

## Features

### 🎯 Core Functionality
- **Real-time Biofeedback**: Monitor heart rate, GSR (Galvanic Skin Response), motion, and EEG data
- **Adaptive Game Intensity**: Game difficulty adjusts based on player arousal levels
- **Multi-device Support**: Connect multiple wearable devices simultaneously
- **Data Quality Monitoring**: Ensure reliable sensor readings
- **Safety Integration**: Automatic game pausing for high arousal states

### 📱 Device Support
- **Primary**: Samsung Galaxy Watch6/Classic
- **Future**: Apple Watch, Fitbit, Muse EEG headband
- **Mock Mode**: Web development with simulated data

### 🔧 Technical Architecture

#### Service Layer
1. **DeviceManager** - Manages device connections and data aggregation
2. **WearableService** - Handles Galaxy Watch6 specific communication
3. **DataProcessor** - Normalizes and filters sensor data
4. **PlayerStatusEngine** - Analyzes biofeedback to determine player state

#### Component Layer
1. **EnhancedGameIntegration** - Main wearable integration interface
2. **PlayerStatusHUD** - Real-time player status display
3. **DeviceManagementPanel** - Device connection management
4. **TestComponent** - Development testing interface

## Installation & Setup

### Prerequisites
```bash
npm install
```

### Development Mode
```bash
npm run dev
```

### Testing Wearable Integration
1. Navigate to `/test` route
2. Use the test interface to verify service functionality
3. Check browser console for detailed logs

## Usage

### Basic Integration
1. **Start the Game**: Navigate to the game page
2. **Enable Wearable Mode**: Click the "Wearable" button in the header
3. **Connect Devices**: Use the device management panel to connect your Galaxy Watch6
4. **Monitor Status**: View real-time metrics in the HUD panel

### Device Management
1. **Scan for Devices**: Click "Scan" in the device management panel
2. **Connect Device**: Select your Galaxy Watch6 from the discovered devices
3. **Monitor Connection**: Check signal strength and battery level
4. **View Data Quality**: Ensure reliable sensor readings

### Game Integration
- **Automatic Intensity Adjustment**: Game adapts based on your physiological state
- **Safety Features**: Game pauses automatically if arousal levels are too high
- **Real-time Feedback**: Visual indicators show your current state

## API Reference

### DeviceManager
```javascript
// Discover devices
const devices = await DeviceManager.discoverGalaxyWatch6();

// Connect to device
await DeviceManager.connectToDevice(deviceId);

// Get connection status
const status = DeviceManager.getConnectionStatus();

// Get registered devices
const devices = DeviceManager.getRegisteredDevices();
```

### PlayerStatusEngine
```javascript
// Get current player state
const state = PlayerStatusEngine.getCurrentState();

// Get state definition
const definition = PlayerStatusEngine.getStateDefinition('focused');

// Get state history
const history = PlayerStatusEngine.getStateHistory(50);
```

### DataProcessor
```javascript
// Process incoming data
DataProcessor.processData(deviceId, 'heartRate', value, timestamp);

// Get data quality
const quality = DataProcessor.getOverallDataQuality();

// Get specific data quality
const heartRateQuality = DataProcessor.getDataQuality('heartRate');
```

## Player States

### State Definitions
- **Disconnected**: No device data available
- **Relaxed**: Player is calm and relaxed (arousal: 0-30%)
- **Normal**: Player is in normal state (arousal: 30-50%)
- **Focused**: Player is focused and engaged (arousal: 50-70%)
- **Anxious**: Player shows signs of anxiety (arousal: 70-80%)
- **Overstimulated**: Player is highly stimulated (arousal: 80-100%)

### State Transitions
- States are determined by analyzing multiple sensor inputs
- Confidence levels indicate reliability of state assessment
- Automatic transitions based on real-time data analysis

## Data Processing

### Sensor Data Types
1. **Heart Rate**: BPM with noise filtering
2. **GSR**: Galvanic skin response for stress detection
3. **Motion**: Accelerometer and gyroscope data
4. **EEG**: Brain wave patterns (future implementation)
5. **Temperature**: Body temperature monitoring

### Data Quality Metrics
- **Signal Strength**: Device connection quality
- **Data Consistency**: Variance in sensor readings
- **Update Frequency**: Real-time data refresh rate
- **Noise Levels**: Filtered vs. raw data quality

## Safety Features

### Automatic Safeguards
- **High Arousal Detection**: Game pauses when arousal exceeds 80%
- **Data Quality Monitoring**: Alerts when sensor data is unreliable
- **Connection Monitoring**: Automatic reconnection attempts
- **Emergency Stop**: Immediate game pause for safety

### Manual Controls
- **Safe Word Button**: Always accessible emergency stop
- **Manual Pause**: Player can pause game at any time
- **Device Disconnect**: Automatic pause when device disconnects

## Development

### Mock Mode
For web development, the system uses mock data generation:
- Simulated heart rate: 60-100 BPM
- Mock motion data: Random accelerometer values
- Fake device discovery: Mock Galaxy Watch6 devices
- Simulated connection states

### Testing
```bash
# Run the test interface
npm run dev
# Navigate to http://localhost:3000/test
```

### Debugging
- Check browser console for detailed service logs
- Use the test component to verify functionality
- Monitor network requests for device communication

## Configuration

### Game Intensity Mapping
```javascript
const intensityMapping = {
  relaxed: 'low',
  normal: 'normal', 
  focused: 'medium',
  anxious: 'high',
  overstimulated: 'extreme'
};
```

### Sensor Weights
```javascript
const sensorWeights = {
  heartRate: 0.4,
  gsr: 0.3,
  motion: 0.2,
  eeg: 0.1
};
```

## Troubleshooting

### Common Issues

#### Device Not Found
1. Ensure Bluetooth is enabled
2. Check device is in pairing mode
3. Verify device compatibility
4. Try refreshing device scan

#### Poor Data Quality
1. Check device battery level
2. Ensure proper device placement
3. Verify signal strength
4. Clean sensor contacts

#### Connection Drops
1. Check device proximity
2. Verify Bluetooth permissions
3. Restart device if needed
4. Check for interference

### Error Codes
- `DEVICE_NOT_FOUND`: No compatible devices discovered
- `CONNECTION_FAILED`: Unable to establish connection
- `PERMISSION_DENIED`: Required permissions not granted
- `DATA_QUALITY_LOW`: Sensor readings unreliable

## Future Enhancements

### Planned Features
- **Apple Watch Support**: Native iOS integration
- **EEG Headband Integration**: Brain wave monitoring
- **Machine Learning**: Advanced arousal prediction
- **Cloud Sync**: Multi-device data synchronization
- **Analytics Dashboard**: Detailed performance metrics

### API Extensions
- **WebSocket Support**: Real-time data streaming
- **REST API**: External data access
- **Webhook Integration**: Third-party notifications
- **Data Export**: CSV/JSON data export

## Contributing

### Development Guidelines
1. Follow existing code structure
2. Add comprehensive error handling
3. Include unit tests for new features
4. Update documentation for changes
5. Test with both real and mock devices

### Code Style
- Use functional components with hooks
- Implement proper TypeScript types
- Follow ESLint configuration
- Add JSDoc comments for complex functions

## License

This wearable integration is part of the Napięcie game project. See the main project license for details.

## Support

For technical support or feature requests:
1. Check the troubleshooting section
2. Review the test component for verification
3. Check browser console for error logs
4. Create an issue with detailed information

---

**Note**: This integration is designed for educational and entertainment purposes. Always prioritize player safety and comfort during use. 