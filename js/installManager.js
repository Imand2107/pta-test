class InstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Store the install prompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
            this.trackInstallation();
            console.log('PWA was installed');
        });
    }

    showInstallButton() {
        const installButton = document.createElement('button');
        installButton.id = 'install-button';
        installButton.className = 'install-button';
        installButton.innerHTML = `
            <span class="install-icon">📱</span>
            Install App
        `;
        installButton.addEventListener('click', () => this.installApp());
        
        // Add button to the page
        document.body.appendChild(installButton);

        // Add animation
        setTimeout(() => {
            installButton.classList.add('show');
        }, 100);
    }

    hideInstallButton() {
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.classList.remove('show');
            setTimeout(() => {
                installButton.remove();
            }, 300);
        }
    }

    async installApp() {
        if (!this.deferredPrompt) return;

        try {
            // Show the install prompt
            const result = await this.deferredPrompt.prompt();
            console.log(`Install prompt result: ${result}`);
            
            // Clear the deferred prompt
            this.deferredPrompt = null;
            
            // Hide the install button
            this.hideInstallButton();
        } catch (error) {
            console.error('Error installing app:', error);
        }
    }

    trackInstallation() {
        // Track installation in localStorage
        const installData = {
            date: new Date().toISOString(),
            platform: navigator.platform,
            userAgent: navigator.userAgent
        };
        localStorage.setItem('appInstallation', JSON.stringify(installData));
    }

    isInstalled() {
        // Check if app is installed
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    shouldPromptInstall() {
        // Check if we should show the install prompt
        const lastPrompt = localStorage.getItem('lastInstallPrompt');
        if (!lastPrompt) return true;

        const lastPromptDate = new Date(lastPrompt);
        const daysSinceLastPrompt = (new Date() - lastPromptDate) / (1000 * 60 * 60 * 24);
        
        return daysSinceLastPrompt > 7; // Show prompt again after 7 days
    }
}

// Initialize install manager
const installManager = new InstallManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InstallManager;
} 