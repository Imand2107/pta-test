class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 60000; // 1 minute default
        this.maxRequests = options.maxRequests || 100; // 100 requests per window default
        this.clients = new Map(); // Store client request counts
        this.blacklist = new Set(); // Store blacklisted IPs
        this.maxViolations = options.maxViolations || 3; // Max violations before blacklist
        this.violations = new Map(); // Track violations per client
        this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
    }

    isRateLimited(clientId) {
        if (this.blacklist.has(clientId)) {
            return true;
        }

        const now = Date.now();
        const clientData = this.clients.get(clientId) || { count: 0, resetTime: now + this.windowMs };

        if (now > clientData.resetTime) {
            clientData.count = 1;
            clientData.resetTime = now + this.windowMs;
        } else {
            clientData.count++;
        }

        this.clients.set(clientId, clientData);

        if (clientData.count > this.maxRequests) {
            this.handleViolation(clientId);
            return true;
        }

        return false;
    }

    handleViolation(clientId) {
        const violations = (this.violations.get(clientId) || 0) + 1;
        this.violations.set(clientId, violations);

        if (violations >= this.maxViolations) {
            this.blacklist.add(clientId);
            console.log(`Client ${clientId} blacklisted for excessive violations`);
        }
    }

    cleanup() {
        const now = Date.now();
        
        // Clean up expired client data
        for (const [clientId, data] of this.clients.entries()) {
            if (now > data.resetTime) {
                this.clients.delete(clientId);
            }
        }

        // Reset violations periodically (every hour)
        if (now % (60 * 60 * 1000) < this.windowMs) {
            this.violations.clear();
        }
    }

    removeFromBlacklist(clientId) {
        this.blacklist.delete(clientId);
        this.violations.delete(clientId);
    }

    getClientStats(clientId) {
        const clientData = this.clients.get(clientId);
        if (!clientData) return null;

        return {
            requests: clientData.count,
            remainingRequests: Math.max(0, this.maxRequests - clientData.count),
            resetTime: clientData.resetTime,
            isBlacklisted: this.blacklist.has(clientId),
            violations: this.violations.get(clientId) || 0
        };
    }

    destroy() {
        clearInterval(this.cleanupInterval);
    }
}

module.exports = RateLimiter; 