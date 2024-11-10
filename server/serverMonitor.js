class ServerMonitor {
    constructor() {
        this.metrics = {
            connections: 0,
            messageRate: 0,
            errorRate: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            uptime: 0
        };
        this.messageCount = 0;
        this.errorCount = 0;
        this.startTime = Date.now();
        this.updateInterval = 5000; // 5 seconds
        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => this.updateMetrics(), this.updateInterval);
    }

    updateMetrics() {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 1000; // in seconds

        this.metrics = {
            connections: this.getConnectionCount(),
            messageRate: this.calculateMessageRate(),
            errorRate: this.calculateErrorRate(),
            memoryUsage: this.getMemoryUsage(),
            cpuUsage: this.getCpuUsage(),
            uptime: elapsedTime
        };

        // Reset counters
        this.messageCount = 0;
        this.errorCount = 0;

        // Log metrics
        this.logMetrics();
    }

    getConnectionCount() {
        return this.wss?.clients?.size || 0;
    }

    calculateMessageRate() {
        return this.messageCount / (this.updateInterval / 1000);
    }

    calculateErrorRate() {
        return this.errorCount / (this.updateInterval / 1000);
    }

    getMemoryUsage() {
        const used = process.memoryUsage();
        return {
            heapTotal: Math.round(used.heapTotal / 1024 / 1024), // MB
            heapUsed: Math.round(used.heapUsed / 1024 / 1024), // MB
            rss: Math.round(used.rss / 1024 / 1024) // MB
        };
    }

    getCpuUsage() {
        const cpus = require('os').cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        return {
            usage: Math.round((1 - totalIdle / totalTick) * 100),
            cores: cpus.length
        };
    }

    logMetrics() {
        console.log('Server Metrics:', {
            timestamp: new Date().toISOString(),
            ...this.metrics
        });
    }

    logMessage() {
        this.messageCount++;
    }

    logError(error) {
        this.errorCount++;
        console.error('Server Error:', {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        });
    }

    getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date().toISOString()
        };
    }

    getHealthStatus() {
        const memoryThreshold = 90; // 90% of total memory
        const cpuThreshold = 80; // 80% CPU usage
        const errorThreshold = 10; // 10 errors per second

        const memoryPercent = (this.metrics.memoryUsage.heapUsed / this.metrics.memoryUsage.heapTotal) * 100;
        const isHealthy = 
            memoryPercent < memoryThreshold &&
            this.metrics.cpuUsage.usage < cpuThreshold &&
            this.metrics.errorRate < errorThreshold;

        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            details: {
                memory: memoryPercent < memoryThreshold ? 'ok' : 'high',
                cpu: this.metrics.cpuUsage.usage < cpuThreshold ? 'ok' : 'high',
                errors: this.metrics.errorRate < errorThreshold ? 'ok' : 'high'
            }
        };
    }
}

module.exports = ServerMonitor; 