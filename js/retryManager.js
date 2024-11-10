class RetryManager {
    constructor(maxRetries = 3, baseDelay = 1000) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.retryQueue = new Map(); // Map of operation IDs to retry counts
    }

    async retry(operationId, operation, onSuccess, onError) {
        let retryCount = this.retryQueue.get(operationId) || 0;

        try {
            const result = await operation();
            this.retryQueue.delete(operationId);
            if (onSuccess) onSuccess(result);
            return result;
        } catch (error) {
            console.error(`Operation ${operationId} failed:`, error);

            if (retryCount < this.maxRetries) {
                retryCount++;
                this.retryQueue.set(operationId, retryCount);
                
                const delay = this.calculateDelay(retryCount);
                console.log(`Retrying operation ${operationId} in ${delay}ms (attempt ${retryCount})`);
                
                await this.wait(delay);
                return this.retry(operationId, operation, onSuccess, onError);
            } else {
                this.retryQueue.delete(operationId);
                if (onError) onError(error);
                throw error;
            }
        }
    }

    calculateDelay(retryCount) {
        // Exponential backoff with jitter
        const exponentialDelay = this.baseDelay * Math.pow(2, retryCount - 1);
        const jitter = Math.random() * 0.3 * exponentialDelay;
        return exponentialDelay + jitter;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isRetrying(operationId) {
        return this.retryQueue.has(operationId);
    }

    getRetryCount(operationId) {
        return this.retryQueue.get(operationId) || 0;
    }

    clearRetries() {
        this.retryQueue.clear();
    }
}

// Initialize retry manager
const retryManager = new RetryManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RetryManager;
} 