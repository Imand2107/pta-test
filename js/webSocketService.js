class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map();
        this.connect();
    }

    connect() {
        try {
            // In production, use wss:// for secure connection
            this.socket = new WebSocket('ws://localhost:8080');
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    setupEventHandlers() {
        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.sendAuthentication();
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.handleReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Attempting to reconnect in ${delay}ms...`);
            setTimeout(() => this.connect(), delay);
        } else {
            console.error('Max reconnection attempts reached');
            this.notifyError('connection_failed');
        }
    }

    sendAuthentication() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            this.send({
                type: 'auth',
                data: {
                    userId: currentUser.id,
                    token: localStorage.getItem('authToken')
                }
            });
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'metrics_update':
                this.notifyListeners('metrics', message.data);
                break;
            case 'user_achievement':
                this.notifyListeners('achievement', message.data);
                break;
            case 'system_status':
                this.notifyListeners('status', message.data);
                break;
            case 'error':
                this.notifyError(message.data);
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }

    subscribe(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);
    }

    unsubscribe(eventType, callback) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).delete(callback);
        }
    }

    notifyListeners(eventType, data) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in listener callback:', error);
                }
            });
        }
    }

    notifyError(error) {
        this.notifyListeners('error', error);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

// Initialize WebSocket service
const webSocketService = new WebSocketService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketService;
} 