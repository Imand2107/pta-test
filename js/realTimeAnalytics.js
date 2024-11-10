class RealTimeAnalytics {
    constructor() {
        this.updateInterval = 5000; // 5 seconds
        this.listeners = new Map();
        this.metrics = {
            activeUsers: 0,
            currentWorkouts: 0,
            errorRate: 0,
            serverStatus: 'healthy'
        };
        this.startUpdates();
    }

    startUpdates() {
        setInterval(() => this.updateMetrics(), this.updateInterval);
    }

    async updateMetrics() {
        // In a real app, this would fetch from a server
        // For demo, we'll simulate real-time data
        this.metrics = {
            activeUsers: Math.floor(Math.random() * 100),
            currentWorkouts: Math.floor(Math.random() * 50),
            errorRate: Math.random() * 2,
            serverStatus: Math.random() > 0.95 ? 'warning' : 'healthy'
        };

        // Notify all listeners
        this.notifyListeners();
    }

    subscribe(metricName, callback) {
        if (!this.listeners.has(metricName)) {
            this.listeners.set(metricName, new Set());
        }
        this.listeners.get(metricName).add(callback);
    }

    unsubscribe(metricName, callback) {
        if (this.listeners.has(metricName)) {
            this.listeners.get(metricName).delete(callback);
        }
    }

    notifyListeners() {
        for (const [metricName, callbacks] of this.listeners) {
            const value = this.metrics[metricName];
            callbacks.forEach(callback => callback(value));
        }
    }

    getMetric(metricName) {
        return this.metrics[metricName];
    }

    getAllMetrics() {
        return { ...this.metrics };
    }
}

// Initialize real-time analytics
const realTimeAnalytics = new RealTimeAnalytics();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimeAnalytics;
} 