class ChangelogManager {
    constructor() {
        this.currentVersion = '1.0.0';
        this.changelog = null;
        this.loadChangelog();
    }

    async loadChangelog() {
        try {
            const response = await fetch('/version.json');
            this.changelog = await response.json();
            this.checkVersion();
        } catch (error) {
            console.error('Error loading changelog:', error);
        }
    }

    checkVersion() {
        const storedVersion = localStorage.getItem('appVersion');
        
        if (!storedVersion) {
            // First time user
            localStorage.setItem('appVersion', this.currentVersion);
            return;
        }

        if (storedVersion !== this.changelog.version) {
            // Show update notes for new version
            this.showUpdateNotes(storedVersion, this.changelog.version);
        }

        // Check if update is required
        if (this.changelog.updateRequired && 
            this.compareVersions(storedVersion, this.changelog.minVersion) < 0) {
            this.showRequiredUpdatePrompt();
        }

        // Check maintenance mode
        if (this.changelog.maintenanceMode) {
            this.showMaintenanceMessage();
        }
    }

    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            if (parts1[i] > parts2[i]) return 1;
            if (parts1[i] < parts2[i]) return -1;
        }
        return 0;
    }

    showUpdateNotes(oldVersion, newVersion) {
        const updateModal = document.createElement('div');
        updateModal.className = 'update-modal';
        
        let changesList = '';
        for (const version in this.changelog.changelog) {
            if (this.compareVersions(version, oldVersion) > 0) {
                const changes = this.changelog.changelog[version].changes;
                changesList += `
                    <div class="version-changes">
                        <h4>Version ${version}</h4>
                        <ul>
                            ${changes.map(change => `<li>${change}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }

        updateModal.innerHTML = `
            <div class="update-modal-content">
                <h2>What's New</h2>
                <div class="changes-list">
                    ${changesList}
                </div>
                <div class="update-modal-actions">
                    <button onclick="changelogManager.acknowledgeUpdate('${newVersion}')">
                        Got it!
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(updateModal);
    }

    showRequiredUpdatePrompt() {
        const updatePrompt = document.createElement('div');
        updatePrompt.className = 'update-required-prompt';
        updatePrompt.innerHTML = `
            <div class="update-prompt-content">
                <h2>Update Required</h2>
                <p>A new version is required to continue using the app.</p>
                <p>Please update to the latest version.</p>
                <button onclick="location.reload()">Update Now</button>
            </div>
        `;
        document.body.appendChild(updatePrompt);
    }

    showMaintenanceMessage() {
        const maintenancePrompt = document.createElement('div');
        maintenancePrompt.className = 'maintenance-prompt';
        maintenancePrompt.innerHTML = `
            <div class="maintenance-content">
                <h2>Maintenance Mode</h2>
                <p>${this.changelog.maintenanceMessage}</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
        document.body.appendChild(maintenancePrompt);
    }

    acknowledgeUpdate(version) {
        localStorage.setItem('appVersion', version);
        const modal = document.querySelector('.update-modal');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => modal.remove(), 300);
        }
    }

    getVersionHistory() {
        return this.changelog?.changelog || {};
    }

    getCurrentVersion() {
        return this.changelog?.version || this.currentVersion;
    }

    isUpdateAvailable() {
        const storedVersion = localStorage.getItem('appVersion');
        return storedVersion && this.changelog && 
               this.compareVersions(this.changelog.version, storedVersion) > 0;
    }
}

// Initialize changelog manager
const changelogManager = new ChangelogManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChangelogManager;
} 