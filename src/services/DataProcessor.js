/**
 * Data Abstraction Layer
 * Normalizes data streams from different devices into unified internal format
 */
class DataProcessor {
  constructor() {
    // Simple event emitter for browser compatibility
    this.events = {};
    
    // Data normalization schemas
    this.dataSchemas = {
      heartRate: {
        unit: 'bpm',
        range: { min: 30, max: 220 },
        defaultValue: 72,
        noiseThreshold: 5
      },
      gsr: {
        unit: 'microsiemens',
        range: { min: 0, max: 100 },
        defaultValue: 10,
        noiseThreshold: 2
      },
      eeg: {
        unit: 'microvolts',
        range: { min: -500, max: 500 },
        defaultValue: 0,
        noiseThreshold: 10
      },
      motion: {
        unit: 'g',
        range: { min: -10, max: 10 },
        defaultValue: { x: 0, y: 0, z: 1 },
        noiseThreshold: 0.1
      },
      temperature: {
        unit: 'celsius',
        range: { min: 20, max: 45 },
        defaultValue: 37,
        noiseThreshold: 0.5
      },
      battery: {
        unit: 'percentage',
        range: { min: 0, max: 100 },
        defaultValue: 100,
        noiseThreshold: 1
      }
    };
    
    // Data buffers for filtering
    this.dataBuffers = new Map();
    this.bufferSize = 10; // Number of samples to keep for filtering
    
    // Time synchronization
    this.timeOffset = 0;
    this.lastSyncTime = Date.now();
    
    // Data quality metrics
    this.dataQuality = {
      heartRate: { quality: 0, lastUpdate: 0 },
      gsr: { quality: 0, lastUpdate: 0 },
      eeg: { quality: 0, lastUpdate: 0 },
      motion: { quality: 0, lastUpdate: 0 },
      temperature: { quality: 0, lastUpdate: 0 },
      battery: { quality: 0, lastUpdate: 0 }
    };
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
   * Process and normalize incoming data
   */
  processData(deviceId, dataType, rawData, timestamp = Date.now()) {
    try {
      // Synchronize timestamp
      const syncedTimestamp = this.synchronizeTimestamp(timestamp);
      
      // Normalize data based on type
      const normalizedData = this.normalizeData(dataType, rawData);
      
      // Apply noise filtering
      const filteredData = this.applyNoiseFilter(dataType, normalizedData, deviceId);
      
      // Update data quality
      this.updateDataQuality(dataType, filteredData, syncedTimestamp);
      
      // Create unified data format
      const unifiedData = {
        timestamp: syncedTimestamp,
        deviceId,
        dataType,
        value: filteredData,
        quality: this.dataQuality[dataType]?.quality || 0,
        metadata: {
          originalValue: rawData,
          processingTime: Date.now() - timestamp,
          schema: this.dataSchemas[dataType]
        }
      };
      
      // Emit processed data event
      this.emit('dataProcessed', unifiedData);
      
      return unifiedData;
    } catch (error) {
      console.error('Data processing failed:', error);
      throw error;
    }
  }

  /**
   * Normalize data based on type
   */
  normalizeData(dataType, rawData) {
    const schema = this.dataSchemas[dataType];
    if (!schema) {
      throw new Error(`Unknown data type: ${dataType}`);
    }

    switch (dataType) {
      case 'heartRate':
        return this.normalizeHeartRate(rawData);
      case 'gsr':
        return this.normalizeGSR(rawData);
      case 'eeg':
        return this.normalizeEEG(rawData);
      case 'motion':
        return this.normalizeMotion(rawData);
      case 'temperature':
        return this.normalizeTemperature(rawData);
      case 'battery':
        return this.normalizeBattery(rawData);
      default:
        return rawData;
    }
  }

  /**
   * Normalize heart rate data
   */
  normalizeHeartRate(rawData) {
    let heartRate = parseFloat(rawData);
    
    // Validate range
    if (isNaN(heartRate) || heartRate < 30 || heartRate > 220) {
      heartRate = this.dataSchemas.heartRate.defaultValue;
    }
    
    return heartRate;
  }

  /**
   * Normalize GSR data
   */
  normalizeGSR(rawData) {
    let gsr = parseFloat(rawData);
    
    // Validate range
    if (isNaN(gsr) || gsr < 0 || gsr > 100) {
      gsr = this.dataSchemas.gsr.defaultValue;
    }
    
    return gsr;
  }

  /**
   * Normalize EEG data
   */
  normalizeEEG(rawData) {
    let eeg = parseFloat(rawData);
    
    // Validate range
    if (isNaN(eeg) || eeg < -500 || eeg > 500) {
      eeg = this.dataSchemas.eeg.defaultValue;
    }
    
    return eeg;
  }

  /**
   * Normalize motion data
   */
  normalizeMotion(rawData) {
    if (typeof rawData === 'object' && rawData.x !== undefined) {
      // Already in correct format
      return {
        x: Math.max(-10, Math.min(10, parseFloat(rawData.x) || 0)),
        y: Math.max(-10, Math.min(10, parseFloat(rawData.y) || 0)),
        z: Math.max(-10, Math.min(10, parseFloat(rawData.z) || 1))
      };
    } else {
      // Single value - convert to 3D
      const value = parseFloat(rawData) || 0;
      return {
        x: Math.max(-10, Math.min(10, value)),
        y: 0,
        z: 1
      };
    }
  }

  /**
   * Normalize temperature data
   */
  normalizeTemperature(rawData) {
    let temperature = parseFloat(rawData);
    
    // Validate range
    if (isNaN(temperature) || temperature < 20 || temperature > 45) {
      temperature = this.dataSchemas.temperature.defaultValue;
    }
    
    return temperature;
  }

  /**
   * Normalize battery data
   */
  normalizeBattery(rawData) {
    let battery = parseFloat(rawData);
    
    // Validate range
    if (isNaN(battery) || battery < 0 || battery > 100) {
      battery = this.dataSchemas.battery.defaultValue;
    }
    
    return battery;
  }

  /**
   * Apply noise filtering to data
   */
  applyNoiseFilter(dataType, data, deviceId) {
    const bufferKey = `${deviceId}_${dataType}`;
    
    // Initialize buffer if not exists
    if (!this.dataBuffers.has(bufferKey)) {
      this.dataBuffers.set(bufferKey, []);
    }
    
    const buffer = this.dataBuffers.get(bufferKey);
    buffer.push(data);
    
    // Keep only recent samples
    if (buffer.length > this.bufferSize) {
      buffer.shift();
    }
    
    // Apply appropriate filter based on data type
    switch (dataType) {
      case 'heartRate':
        return this.filterHeartRate(buffer);
      case 'motion':
        return this.filterMotion(buffer);
      case 'temperature':
        return this.filterTemperature(buffer);
      default:
        return this.applyMovingAverage(buffer);
    }
  }

  /**
   * Filter heart rate data
   */
  filterHeartRate(buffer) {
    if (buffer.length < 3) return buffer[buffer.length - 1];
    
    // Remove outliers (values that differ too much from median)
    const sorted = [...buffer].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const threshold = this.dataSchemas.heartRate.noiseThreshold;
    
    const filtered = buffer.filter(value => 
      Math.abs(value - median) <= threshold
    );
    
    return filtered.length > 0 ? 
      filtered.reduce((sum, val) => sum + val, 0) / filtered.length : 
      median;
  }

  /**
   * Filter motion data
   */
  filterMotion(buffer) {
    if (buffer.length < 3) return buffer[buffer.length - 1];
    
    // Calculate average motion
    const avgMotion = {
      x: buffer.reduce((sum, val) => sum + val.x, 0) / buffer.length,
      y: buffer.reduce((sum, val) => sum + val.y, 0) / buffer.length,
      z: buffer.reduce((sum, val) => sum + val.z, 0) / buffer.length
    };
    
    return avgMotion;
  }

  /**
   * Filter temperature data
   */
  filterTemperature(buffer) {
    if (buffer.length < 3) return buffer[buffer.length - 1];
    
    // Simple moving average for temperature
    return this.applyMovingAverage(buffer);
  }

  /**
   * Apply moving average filter
   */
  applyMovingAverage(buffer) {
    if (buffer.length === 0) return 0;
    
    const sum = buffer.reduce((acc, val) => acc + val, 0);
    return sum / buffer.length;
  }

  /**
   * Synchronize timestamp
   */
  synchronizeTimestamp(timestamp) {
    // Simple time synchronization (in real implementation, this would be more sophisticated)
    return timestamp + this.timeOffset;
  }

  /**
   * Update data quality metrics
   */
  updateDataQuality(dataType, data, timestamp) {
    if (!this.dataQuality[dataType]) {
      this.dataQuality[dataType] = { quality: 0, lastUpdate: 0 };
    }
    
    const quality = this.dataQuality[dataType];
    const timeSinceLastUpdate = timestamp - quality.lastUpdate;
    
    // Calculate quality based on data consistency and update frequency
    let newQuality = 0.8; // Base quality
    
    // Penalize for infrequent updates
    if (timeSinceLastUpdate > 5000) { // 5 seconds
      newQuality *= 0.5;
    } else if (timeSinceLastUpdate > 1000) { // 1 second
      newQuality *= 0.8;
    }
    
    // Penalize for extreme values
    const schema = this.dataSchemas[dataType];
    if (schema && typeof data === 'number') {
      const range = schema.range;
      const normalized = (data - range.min) / (range.max - range.min);
      if (normalized < 0.1 || normalized > 0.9) {
        newQuality *= 0.7;
      }
    }
    
    // Smooth quality transition
    quality.quality = quality.quality * 0.7 + newQuality * 0.3;
    quality.lastUpdate = timestamp;
  }

  /**
   * Get data quality for specific type
   */
  getDataQuality(dataType) {
    return this.dataQuality[dataType] || { quality: 0, lastUpdate: 0 };
  }

  /**
   * Get overall data quality
   */
  getOverallDataQuality() {
    const qualities = Object.values(this.dataQuality);
    if (qualities.length === 0) return 0;
    
    const avgQuality = qualities.reduce((sum, q) => sum + q.quality, 0) / qualities.length;
    return Math.min(1, Math.max(0, avgQuality));
  }

  /**
   * Get data schema for type
   */
  getDataSchema(dataType) {
    return this.dataSchemas[dataType];
  }

  /**
   * Register custom data schema
   */
  registerDataSchema(dataType, schema) {
    this.dataSchemas[dataType] = {
      unit: 'unknown',
      range: { min: 0, max: 100 },
      defaultValue: 0,
      noiseThreshold: 1,
      ...schema
    };
  }

  /**
   * Clear all data buffers
   */
  clearBuffers() {
    this.dataBuffers.clear();
  }

  /**
   * Get buffer statistics
   */
  getBufferStats() {
    const stats = {};
    
    this.dataBuffers.forEach((buffer, key) => {
      stats[key] = {
        size: buffer.length,
        maxSize: this.bufferSize,
        lastUpdate: buffer.length > 0 ? Date.now() : 0
      };
    });
    
    return stats;
  }

  /**
   * Validate data against schema
   */
  validateData(dataType, data) {
    const schema = this.dataSchemas[dataType];
    if (!schema) return false;
    
    const range = schema.range;
    
    if (typeof data === 'number') {
      return data >= range.min && data <= range.max;
    } else if (typeof data === 'object' && data.x !== undefined) {
      // 3D data
      return data.x >= range.min && data.x <= range.max &&
             data.y >= range.min && data.y <= range.max &&
             data.z >= range.min && data.z <= range.max;
    }
    
    return false;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.clearBuffers();
    this.removeAllListeners();
    console.log('DataProcessor destroyed');
  }
}

// Create singleton instance
const dataProcessor = new DataProcessor();

export default dataProcessor; 