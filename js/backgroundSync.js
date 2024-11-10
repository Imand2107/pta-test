class BackgroundSync {
    constructor() {
        this.syncTag = 'fitness-sync';
        this.setupSync();
    }

    async setupSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                // Register for periodic sync if available
                if ('periodicSync' in registration) {
                    const status = await navigator.permissions.query({
                        name: 'periodic-background-sync',
                    });
                    
                    if (status.state === 'granted') {
                        await registration.periodicSync.register(this.syncTag, {
                            minInterval: 24 * 60 * 60 * 1000, // 24 hours
                        });
                    }
                }
            } catch (error) {
                console.error('Background sync setup failed:', error);
            }
        }
    }

    async queueDataForSync(data) {
        if (!('serviceWorker' in navigator)) return;

        try {
            const db = await this.openIndexedDB();
            const tx = db.transaction('syncQueue', 'readwrite');
            const store = tx.objectStore('syncQueue');
            
            await store.add({
                id: Date.now(),
                data: data,
                timestamp: new Date().toISOString()
            });

            await tx.complete;
            
            // Request immediate sync if possible
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(this.syncTag);
        } catch (error) {
            console.error('Error queuing data for sync:', error);
        }
    }

    async openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('backgroundSync', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id' });
                }
            };
        });
    }

    async processSyncQueue() {
        try {
            const db = await this.openIndexedDB();
            const tx = db.transaction('syncQueue', 'readwrite');
            const store = tx.objectStore('syncQueue');
            const items = await store.getAll();

            for (const item of items) {
                try {
                    await this.syncData(item.data);
                    await store.delete(item.id);
                } catch (error) {
                    console.error('Error syncing item:', error);
                    // Keep failed items in queue for retry
                }
            }

            await tx.complete;
        } catch (error) {
            console.error('Error processing sync queue:', error);
        }
    }

    async syncData(data) {
        // Implement server sync when backend is available
        // For now, just update local storage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        const userData = JSON.parse(localStorage.getItem(`userData_${currentUser.id}`) || '{}');
        
        // Merge data based on type
        switch (data.type) {
            case 'workout':
                userData.workoutHistory = userData.workoutHistory || [];
                userData.workoutHistory.push(data.workout);
                break;
            case 'weight':
                userData.weightHistory = userData.weightHistory || [];
                userData.weightHistory.push(data.weight);
                break;
            case 'achievement':
                userData.achievements = userData.achievements || [];
                userData.achievements.push(data.achievement);
                break;
        }

        localStorage.setItem(`userData_${currentUser.id}`, JSON.stringify(userData));
    }
}

// Initialize background sync
const backgroundSync = new BackgroundSync();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundSync;
} 