const WebSocket = require('ws');
const http = require('http');
const authService = require('./authService');
const RateLimiter = require('./rateLimiter');

class WebSocketServer {
    constructor(port = 8080) {
        this.server = http.createServer();
        this.wss = new WebSocket.Server({ 
            server: this.server,
            verifyClient: this.verifyClient.bind(this)
        });
        this.clients = new Map();
        this.metrics = {
            activeUsers: 0,
            currentWorkouts: 0,
            errorRate: 0,
            serverStatus: 'healthy'
        };

        // Initialize rate limiter
        this.rateLimiter = new RateLimiter({
            windowMs: 60000, // 1 minute
            maxRequests: 100, // 100 requests per minute
            maxViolations: 3
        });

        this.setupWebSocket();
        this.startMetricsUpdate();
        this.server.listen(port);
    }

    verifyClient(info, callback) {
        const clientId = info.req.socket.remoteAddress;
        const token = this.extractToken(info.req);

        // Check rate limit
        if (this.rateLimiter.isRateLimited(clientId)) {
            callback(false, 429, 'Too Many Requests');
            return;
        }

        // Verify authentication
        const isValid = authService.validateConnection(token);
        callback(isValid, isValid ? 200 : 401, isValid ? 'Success' : 'Unauthorized');
    }

    extractToken(request) {
        const authHeader = request.headers['authorization'];
        if (!authHeader) return null;
        
        const [bearer, token] = authHeader.split(' ');
        return bearer === 'Bearer' ? token : null;
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, request) => {
            const clientId = request.socket.remoteAddress;
            const token = this.extractToken(request);
            const decoded = authService.verifyToken(token);
            ws.userId = decoded.userId;
            ws.clientId = clientId;

            console.log(`Client connected: ${ws.userId}`);
            this.clients.set(ws.userId, ws);
            this.updateMetrics({ activeUsers: this.clients.size });

            ws.on('message', async (message) => {
                try {
                    // Check rate limit for messages
                    if (this.rateLimiter.isRateLimited(clientId)) {
                        this.sendError(ws, 'Rate limit exceeded');
                        return;
                    }

                    const data = JSON.parse(message);
                    await this.handleMessage(ws, data);
                } catch (error) {
                    console.error('Error handling message:', error);
                    this.sendError(ws, 'Invalid message format');
                }
            });

            ws.on('close', () => {
                this.handleDisconnect(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.updateMetrics({ errorRate: this.metrics.errorRate + 1 });
            });

            // Send initial metrics
            this.sendMetrics(ws);
        });
    }

    async handleMessage(ws, message) {
        switch (message.type) {
            case 'auth':
                await this.handleAuth(ws, message.data);
                break;
            case 'startWorkout':
                this.handleStartWorkout(ws, message.data);
                break;
            case 'completeWorkout':
                this.handleCompleteWorkout(ws, message.data);
                break;
            case 'achievement':
                this.broadcastAchievement(message.data);
                break;
            default:
                this.sendError(ws, 'Unknown message type');
        }
    }

    async handleAuth(ws, data) {
        try {
            // Verify JWT token (implement your own verification logic)
            const userId = data.userId;
            this.clients.set(userId, ws);
            ws.userId = userId;

            this.sendToClient(ws, {
                type: 'auth_success',
                data: { userId }
            });

            this.updateMetrics({ activeUsers: this.clients.size });
        } catch (error) {
            this.sendError(ws, 'Authentication failed');
        }
    }

    handleStartWorkout(ws, data) {
        this.updateMetrics({ currentWorkouts: this.metrics.currentWorkouts + 1 });
        this.broadcastMetrics();
    }

    handleCompleteWorkout(ws, data) {
        this.updateMetrics({ currentWorkouts: this.metrics.currentWorkouts - 1 });
        this.broadcastMetrics();
    }

    handleDisconnect(ws) {
        if (ws.userId) {
            this.clients.delete(ws.userId);
            this.updateMetrics({ activeUsers: this.clients.size });
        }
    }

    broadcastAchievement(achievement) {
        this.broadcast({
            type: 'user_achievement',
            data: achievement
        });
    }

    updateMetrics(newMetrics) {
        this.metrics = { ...this.metrics, ...newMetrics };
        this.broadcastMetrics();
    }

    sendMetrics(ws) {
        this.sendToClient(ws, {
            type: 'metrics_update',
            data: this.metrics
        });
    }

    broadcastMetrics() {
        this.broadcast({
            type: 'metrics_update',
            data: this.metrics
        });
    }

    startMetricsUpdate() {
        // Simulate real-time metrics updates
        setInterval(() => {
            this.updateMetrics({
                errorRate: Math.random() * 2,
                serverStatus: Math.random() > 0.95 ? 'warning' : 'healthy'
            });
        }, 5000);
    }

    sendToClient(ws, data) {
        if (ws.readyState === WebSocket.OPEN) {
            const payload = {
                ...data,
                timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(payload));
        }
    }

    broadcast(data, excludeUserId = null) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.userId !== excludeUserId) {
                this.sendToClient(client, data);
            }
        });
    }

    broadcastToGroup(userIds, data) {
        userIds.forEach(userId => {
            const client = this.clients.get(userId);
            if (client && client.readyState === WebSocket.OPEN) {
                this.sendToClient(client, data);
            }
        });
    }

    sendError(ws, message) {
        this.sendToClient(ws, {
            type: 'error',
            data: { message }
        });
    }

    getClientStats(clientId) {
        return this.rateLimiter.getClientStats(clientId);
    }
}

// Start WebSocket server
const wss = new WebSocketServer();

module.exports = WebSocketServer; 