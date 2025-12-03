/**
 * Player Status Engine
 * Analyzes biofeedback data to determine player's physiological and emotional state
 */
class PlayerStatusEngine {
  constructor() {
    // Simple event emitter for browser compatibility
    this.events = {};
    
    // State definitions
    this.stateDefinitions = {
      disconnected: {
        name: 'Disconnected',
        color: '#6B7280',
        description: 'No devices connected',
        arousalLevel: 0,
        confidence: 0
      },
      relaxed: {
        name: 'Relaxed',
        color: '#10B981',
        description: 'Low arousal, calm state',
        arousalLevel: 0.2,
        confidence: 0.8
      },
      normal: {
        name: 'Normal',
        color: '#3B82F6',
        description: 'Baseline physiological state',
        arousalLevel: 0.5,
        confidence: 0.9
      },
      focused: {
        name: 'Focused',
        color: '#8B5CF6',
        description: 'Moderate arousal, engaged',
        arousalLevel: 0.7,
        confidence: 0.85
      },
      anxious: {
        name: 'Anxious',
        color: '#F59E0B',
        description: 'High arousal, stress response',
        arousalLevel: 0.8,
        confidence: 0.75
      },
      overstimulated: {
        name: 'Overstimulated',
        color: '#EF4444',
        description: 'Very high arousal, may need break',
        arousalLevel: 0.95,
        confidence: 0.7
      }
    };
    
    // Current state
    this.currentState = {
      status: 'disconnected',
      confidence: 0,
      lastUpdate: Date.now(),
      dataQuality: 0,
      metrics: {
        heartRate: 0,
        gsr: 0,
        motion: 0,
        eeg: 0
      },
      arousalScore: 0,
      trend: 'stable'
    };
    
    // State history for trend analysis
    this.stateHistory = [];
    this.maxHistoryLength = 50;
    
    // Analysis parameters
    this.analysisParams = {
      heartRateWeight: 0.4,
      gsrWeight: 0.3,
      motionWeight: 0.2,
      eegWeight: 0.1,
      trendWindow: 10, // Number of samples for trend analysis
      stateTransitionThreshold: 0.1 // Minimum change to trigger state transition
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
   * Update player state with new biofeedback data
   */
  updateState(metrics, dataQuality = 1.0) {
    try {
      const timestamp = Date.now();
      
      // Calculate arousal score from metrics
      const arousalScore = this.calculateArousalScore(metrics);
      
      // Determine new status based on arousal
      const newStatus = this.determineStatus(arousalScore);
      
      // Calculate confidence based on data quality and consistency
      const confidence = this.calculateConfidence(metrics, dataQuality, newStatus);
      
      // Analyze trend
      const trend = this.analyzeTrend(newStatus, arousalScore);
      
      // Create new state
      const newState = {
        status: newStatus,
        confidence,
        lastUpdate: timestamp,
        dataQuality,
        metrics: { ...metrics },
        arousalScore,
        trend
      };
      
      // Check if state has changed significantly
      const stateChanged = this.hasStateChanged(newState);
      
      // Update current state
      this.currentState = newState;
      
      // Add to history
      this.addToHistory(newState);
      
      // Emit events
      if (stateChanged) {
        this.emit('stateChanged', {
          oldState: this.getPreviousState(),
          newState,
          state: newState
        });
      }
      
      this.emit('stateUpdated', newState);
      
      return newState;
    } catch (error) {
      console.error('State update failed:', error);
      throw error;
    }
  }

  /**
   * Calculate arousal score from biofeedback metrics
   */
  calculateArousalScore(metrics) {
    let totalScore = 0;
    let totalWeight = 0;
    
    // Heart rate analysis (40% weight)
    if (metrics.heartRate > 0) {
      const heartRateScore = this.analyzeHeartRate(metrics.heartRate);
      totalScore += heartRateScore * this.analysisParams.heartRateWeight;
      totalWeight += this.analysisParams.heartRateWeight;
    }
    
    // GSR analysis (30% weight)
    if (metrics.gsr > 0) {
      const gsrScore = this.analyzeGSR(metrics.gsr);
      totalScore += gsrScore * this.analysisParams.gsrWeight;
      totalWeight += this.analysisParams.gsrWeight;
    }
    
    // Motion analysis (20% weight)
    if (metrics.motion > 0) {
      const motionScore = this.analyzeMotion(metrics.motion);
      totalScore += motionScore * this.analysisParams.motionWeight;
      totalWeight += this.analysisParams.motionWeight;
    }
    
    // EEG analysis (10% weight)
    if (metrics.eeg > 0) {
      const eegScore = this.analyzeEEG(metrics.eeg);
      totalScore += eegScore * this.analysisParams.eegWeight;
      totalWeight += this.analysisParams.eegWeight;
    }
    
    // Normalize score
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Analyze heart rate for arousal
   */
  analyzeHeartRate(heartRate) {
    // Normalize heart rate to 0-1 scale
    // Assuming normal range is 60-100 BPM
    const normalized = Math.max(0, Math.min(1, (heartRate - 60) / 40));
    
    // Apply sigmoid-like curve for better sensitivity
    return 1 / (1 + Math.exp(-5 * (normalized - 0.5)));
  }

  /**
   * Analyze GSR for arousal
   */
  analyzeGSR(gsr) {
    // Normalize GSR to 0-1 scale
    // Assuming normal range is 0-50 microsiemens
    const normalized = Math.max(0, Math.min(1, gsr / 50));
    
    // Apply power curve for better sensitivity
    return Math.pow(normalized, 0.7);
  }

  /**
   * Analyze motion for arousal
   */
  analyzeMotion(motion) {
    let motionMagnitude;
    
    if (typeof motion === 'object' && motion.x !== undefined) {
      // 3D motion data
      motionMagnitude = Math.sqrt(motion.x ** 2 + motion.y ** 2 + motion.z ** 2);
    } else {
      // Single value
      motionMagnitude = Math.abs(motion);
    }
    
    // Normalize motion to 0-1 scale
    // Assuming normal range is 0-3 g
    const normalized = Math.max(0, Math.min(1, motionMagnitude / 3));
    
    return normalized;
  }

  /**
   * Analyze EEG for arousal
   */
  analyzeEEG(eeg) {
    // Normalize EEG to 0-1 scale
    // Assuming normal range is 0-200 microvolts
    const normalized = Math.max(0, Math.min(1, Math.abs(eeg) / 200));
    
    return normalized;
  }

  /**
   * Determine player status based on arousal score
   */
  determineStatus(arousalScore) {
    if (arousalScore < 0.3) {
      return 'relaxed';
    } else if (arousalScore < 0.5) {
      return 'normal';
    } else if (arousalScore < 0.7) {
      return 'focused';
    } else if (arousalScore < 0.8) {
      return 'anxious';
    } else {
      return 'overstimulated';
    }
  }

  /**
   * Calculate confidence in the state assessment
   */
  calculateConfidence(metrics, dataQuality, status) {
    let confidence = dataQuality;
    
    // Reduce confidence if we have limited data
    const availableMetrics = Object.values(metrics).filter(m => m > 0).length;
    if (availableMetrics < 2) {
      confidence *= 0.7;
    }
    
    // Reduce confidence for extreme states
    if (status === 'overstimulated' || status === 'anxious') {
      confidence *= 0.9;
    }
    
    // Reduce confidence if data is inconsistent
    const consistency = this.calculateDataConsistency(metrics);
    confidence *= consistency;
    
    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Calculate data consistency across metrics
   */
  calculateDataConsistency(metrics) {
    const values = Object.values(metrics).filter(m => m > 0);
    if (values.length < 2) return 0.5;
    
    // Calculate coefficient of variation
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;
    
    // Convert to consistency score (lower CV = higher consistency)
    return Math.max(0, 1 - cv);
  }

  /**
   * Analyze trend in player state
   */
  analyzeTrend(newStatus, arousalScore) {
    if (this.stateHistory.length < 2) {
      return 'stable';
    }
    
    const recentStates = this.stateHistory.slice(-this.analysisParams.trendWindow);
    const arousalScores = recentStates.map(state => state.arousalScore);
    
    // Calculate trend direction
    const firstHalf = arousalScores.slice(0, Math.floor(arousalScores.length / 2));
    const secondHalf = arousalScores.slice(Math.floor(arousalScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    const threshold = 0.05;
    
    if (change > threshold) {
      return 'increasing';
    } else if (change < -threshold) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  /**
   * Check if state has changed significantly
   */
  hasStateChanged(newState) {
    if (this.currentState.status !== newState.status) {
      return true;
    }
    
    const arousalChange = Math.abs(newState.arousalScore - this.currentState.arousalScore);
    return arousalChange > this.analysisParams.stateTransitionThreshold;
  }

  /**
   * Add state to history
   */
  addToHistory(state) {
    this.stateHistory.push(state);
    
    // Keep only recent history
    if (this.stateHistory.length > this.maxHistoryLength) {
      this.stateHistory.shift();
    }
  }

  /**
   * Get previous state
   */
  getPreviousState() {
    return this.stateHistory.length > 1 ? 
      this.stateHistory[this.stateHistory.length - 2] : 
      this.currentState;
  }

  /**
   * Get current state
   */
  getCurrentState() {
    return { ...this.currentState };
  }

  /**
   * Get state definition
   */
  getStateDefinition(status) {
    return this.stateDefinitions[status] || this.stateDefinitions.disconnected;
  }

  /**
   * Get all state definitions
   */
  getAllStateDefinitions() {
    return { ...this.stateDefinitions };
  }

  /**
   * Get state history
   */
  getStateHistory() {
    return [...this.stateHistory];
  }

  /**
   * Get trend analysis
   */
  getTrendAnalysis() {
    if (this.stateHistory.length < 5) {
      return {
        trend: 'stable',
        confidence: 0.5,
        duration: 0
      };
    }
    
    const recentStates = this.stateHistory.slice(-10);
    const trends = recentStates.map(state => state.trend);
    const mostCommonTrend = this.getMostCommon(trends);
    
    return {
      trend: mostCommonTrend,
      confidence: this.calculateTrendConfidence(trends, mostCommonTrend),
      duration: this.calculateTrendDuration(mostCommonTrend)
    };
  }

  /**
   * Get most common value in array
   */
  getMostCommon(arr) {
    const counts = {};
    arr.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );
  }

  /**
   * Calculate trend confidence
   */
  calculateTrendConfidence(trends, mostCommonTrend) {
    const count = trends.filter(t => t === mostCommonTrend).length;
    return count / trends.length;
  }

  /**
   * Calculate trend duration
   */
  calculateTrendDuration(trend) {
    let duration = 0;
    for (let i = this.stateHistory.length - 1; i >= 0; i--) {
      if (this.stateHistory[i].trend === trend) {
        duration++;
      } else {
        break;
      }
    }
    return duration;
  }

  /**
   * Reset state to disconnected
   */
  reset() {
    this.currentState = {
      status: 'disconnected',
      confidence: 0,
      lastUpdate: Date.now(),
      dataQuality: 0,
      metrics: {
        heartRate: 0,
        gsr: 0,
        motion: 0,
        eeg: 0
      },
      arousalScore: 0,
      trend: 'stable'
    };
    
    this.stateHistory = [];
    this.emit('stateReset');
  }

  /**
   * Update analysis parameters
   */
  updateAnalysisParams(newParams) {
    this.analysisParams = {
      ...this.analysisParams,
      ...newParams
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stateHistory = [];
    this.removeAllListeners();
    console.log('PlayerStatusEngine destroyed');
  }
}

// Create singleton instance
const playerStatusEngine = new PlayerStatusEngine();

export default playerStatusEngine; 