class OfflineStorage {
    constructor() {
        this.dbName = 'fitnessAppDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('workouts')) {
                    db.createObjectStore('workouts', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('userData')) {
                    db.createObjectStore('userData', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('achievements')) {
                    db.createObjectStore('achievements', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'id' });
                }
            };
        });
    }

    async saveData(storeName, data) {
        const store = this.db.transaction(storeName, 'readwrite').objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getData(storeName, id) {
        const store = this.db.transaction(storeName, 'readonly').objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getAllData(storeName) {
        const store = this.db.transaction(storeName, 'readonly').objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async deleteData(storeName, id) {
        const store = this.db.transaction(storeName, 'readwrite').objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async clearStore(storeName) {
        const store = this.db.transaction(storeName, 'readwrite').objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async syncWithServer() {
        // Implement server sync when backend is available
        const pendingSync = await this.getAllData('pendingSync');
        // Process pending sync items
        await this.clearStore('pendingSync');
    }
}

// Initialize offline storage
const offlineStorage = new OfflineStorage();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineStorage;
} 