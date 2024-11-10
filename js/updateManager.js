class UpdateManager {
    constructor() {
        this.currentVersion = '1.0.0';
        this.checkForUpdates();
        this.setupUpdateListener();
    }

    setupUpdateListener() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                // New service worker activated
                this.showUpdateNotification();
            });
        }
    }

    async checkForUpdates() {
        try {
            const response = await fetch('/version.json');
            const data = await response.json();
            
            if (data.version !== this.currentVersion) {
                this.showUpdateAvailable(data.version, data.features);
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    showUpdateAvailable(newVersion, features) {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <h3>New Update Available! 🎉</h3>
                <p>Version ${newVersion} is available with new features:</p>
                <ul>
                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <div class="update-actions">
                    <button onclick="updateManager.installUpdate()">Update Now</button>
                    <button onclick="updateManager.dismissUpdate()">Later</button>
                </div>
            </div>
        `;
        document.body.appendChild(updateBanner);

        // Add animation
        setTimeout(() => updateBanner.classList.add('show'), 100);
    }

    async installUpdate() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            
            // Check for updates
            await registration.update();

            // Show loading indicator
            this.showUpdateProgress();

            // Reload the page to activate new service worker
            window.location.reload();
        }
    }

    showUpdateProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'update-progress';
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p>Updating app...</p>
        `;
        document.body.appendChild(progressBar);
    }

    dismissUpdate() {
        const banner = document.querySelector('.update-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    showUpdateNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('App Updated Successfully', {
                body: 'The app has been updated to the latest version.',
                icon: '/images/icons/icon-192x192.png',
                badge: '/images/icons/badge-72x72.png'
            });
        }
    }

    async checkAndReloadCache() {
        if ('caches' in window) {
            try {
                await caches.delete('fitness-app-v1');
                console.log('Cache cleared successfully');
                
                // Reload app resources
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.update();
                }
            } catch (error) {
                console.error('Error clearing cache:', error);
            }
        }
    }
}

// Initialize update manager
const updateManager = new UpdateManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpdateManager;
} 