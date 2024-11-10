class AlertManager {
    constructor() {
        this.alerts = [];
        this.thresholds = {
            memory: {
                warning: 70,
                critical: 90
            },
            cpu: {
                warning: 60,
                critical: 80
            },
            errorRate: {
                warning: 5,
                critical: 10
            },
            responseTime: {
                warning: 1000, // 1 second
                critical: 3000 // 3 seconds
            }
        };
        this.alertHandlers = new Map();
        this.setupDefaultHandlers();
    }

    setupDefaultHandlers() {
        // Default alert handlers
        this.addAlertHandler('email', this.sendEmailAlert.bind(this));
        this.addAlertHandler('slack', this.sendSlackAlert.bind(this));
        this.addAlertHandler('console', this.logAlert.bind(this));
    }

    addAlertHandler(type, handler) {
        this.alertHandlers.set(type, handler);
    }

    async checkMetrics(metrics) {
        const alerts = [];

        // Check memory usage
        const memoryPercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
        if (memoryPercent >= this.thresholds.memory.critical) {
            alerts.push(this.createAlert('critical', 'Memory usage critical', `Memory usage at ${memoryPercent.toFixed(1)}%`));
        } else if (memoryPercent >= this.thresholds.memory.warning) {
            alerts.push(this.createAlert('warning', 'Memory usage high', `Memory usage at ${memoryPercent.toFixed(1)}%`));
        }

        // Check CPU usage
        if (metrics.cpuUsage.usage >= this.thresholds.cpu.critical) {
            alerts.push(this.createAlert('critical', 'CPU usage critical', `CPU usage at ${metrics.cpuUsage.usage}%`));
        } else if (metrics.cpuUsage.usage >= this.thresholds.cpu.warning) {
            alerts.push(this.createAlert('warning', 'CPU usage high', `CPU usage at ${metrics.cpuUsage.usage}%`));
        }

        // Check error rate
        if (metrics.errorRate >= this.thresholds.errorRate.critical) {
            alerts.push(this.createAlert('critical', 'High error rate', `Error rate at ${metrics.errorRate} errors/second`));
        } else if (metrics.errorRate >= this.thresholds.errorRate.warning) {
            alerts.push(this.createAlert('warning', 'Elevated error rate', `Error rate at ${metrics.errorRate} errors/second`));
        }

        // Process new alerts
        for (const alert of alerts) {
            await this.processAlert(alert);
        }

        return alerts;
    }

    createAlert(severity, title, message) {
        return {
            id: Date.now(),
            severity,
            title,
            message,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };
    }

    async processAlert(alert) {
        this.alerts.push(alert);

        // Trigger all alert handlers
        for (const [type, handler] of this.alertHandlers) {
            try {
                await handler(alert);
            } catch (error) {
                console.error(`Error in ${type} alert handler:`, error);
            }
        }

        // Clean up old alerts
        this.cleanupAlerts();
    }

    async sendEmailAlert(alert) {
        // Implement email alert logic
        console.log('Email alert:', alert);
    }

    async sendSlackAlert(alert) {
        // Implement Slack alert logic
        console.log('Slack alert:', alert);
    }

    logAlert(alert) {
        const logMessage = `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`;
        if (alert.severity === 'critical') {
            console.error(logMessage);
        } else {
            console.warn(logMessage);
        }
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            this.logAlert({
                ...alert,
                title: 'Alert Acknowledged',
                message: `${alert.title} was acknowledged`
            });
        }
    }

    cleanupAlerts() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.alerts = this.alerts.filter(alert => 
            new Date(alert.timestamp).getTime() > oneDayAgo || !alert.acknowledged
        );
    }

    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.acknowledged);
    }

    getAlertHistory() {
        return [...this.alerts].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }

    updateThresholds(newThresholds) {
        this.thresholds = {
            ...this.thresholds,
            ...newThresholds
        };
    }
}

module.exports = AlertManager; 