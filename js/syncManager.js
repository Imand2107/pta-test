class SyncManager {
    constructor() {
        this.syncQueue = [];
        this.retryManager = new RetryManager();
        this.loadQueue();
        this.setupNetworkListeners();
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('Network connection restored. Starting sync...');
            this.syncData();
        });

        window.addEventListener('offline', () => {
            console.log('Network connection lost. Operations will be queued.');
        });
    }

    loadQueue() {
        this.syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    }

    saveQueue() {
        localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    }

    async addToQueue(action, data) {
        if (!('serviceWorker' in navigator)) return;

        const syncItem = {
            id: Date.now(),
            action,
            data,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        this.syncQueue.push(syncItem);
        this.saveQueue();

        if (navigator.onLine) {
            await this.syncData();
        } else {
            // Show offline indicator
            this.showOfflineIndicator();
        }
    }

    async syncData() {
        if (!navigator.onLine) {
            console.log('No network connection. Sync postponed.');
            return;
        }

        const itemsToSync = [...this.syncQueue];
        
        for (const item of itemsToSync) {
            try {
                await this.retryManager.retry(
                    `sync-${item.id}`,
                    () => this.performSync(item),
                    () => {
                        // On success
                        this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
                        this.saveQueue();
                        this.updateSyncStatus('success');
                    },
                    (error) => {
                        // On final failure
                        console.error('Sync failed after all retries:', error);
                        this.updateSyncStatus('failed');
                        this.handleSyncFailure(item);
                    }
                );
            } catch (error) {
                console.error('Sync error:', error);
            }
        }

        if (this.syncQueue.length === 0) {
            this.hideOfflineIndicator();
        }
    }

    async performSync(item) {
        // Implement actual sync logic here
        // For now, just simulate API calls
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.3) { // 70% success rate
                    resolve();
                } else {
                    reject(new Error('Sync failed'));
                }
            }, 1000);
        });
    }

    handleSyncFailure(item) {
        // Store failed items for later retry
        const failedItems = JSON.parse(localStorage.getItem('failedSyncItems') || '[]');
        failedItems.push(item);
        localStorage.setItem('failedSyncItems', JSON.stringify(failedItems));

        // Show failure notification to user
        this.showSyncFailureNotification();
    }

    showOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.innerHTML = `
            <div class="offline-indicator-content">
                <span>You're offline. Changes will sync when connection is restored.</span>
                <button onclick="syncManager.hideOfflineIndicator()">Dismiss</button>
            </div>
        `;
        document.body.appendChild(indicator);
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateSyncStatus(status) {
        const event = new CustomEvent('syncStatusUpdate', { 
            detail: { status, queueLength: this.syncQueue.length } 
        });
        window.dispatchEvent(event);
    }

    showSyncFailureNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sync Failed', {
                body: 'Some changes could not be saved. They will be retried later.',
                icon: '/images/icons/sync-failed.png'
            });
        }
    }
}

// Initialize sync manager
const syncManager = new SyncManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncManager;
} 