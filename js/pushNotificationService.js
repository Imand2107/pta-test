class PushNotificationService {
    constructor() {
        this.publicVapidKey = 'YOUR_PUBLIC_VAPID_KEY'; // You'll need to generate this
        this.registration = null;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                this.registration = await navigator.serviceWorker.register('/js/serviceWorker.js');
                console.log('Service Worker registered');
                await this.requestNotificationPermission();
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await this.subscribeUserToPush();
            }
        } catch (error) {
            console.error('Permission request failed:', error);
        }
    }

    async subscribeUserToPush() {
        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey)
            });

            // Store subscription in localStorage for demo
            // In production, send this to your server
            localStorage.setItem('pushSubscription', JSON.stringify(subscription));
        } catch (error) {
            console.error('Push subscription failed:', error);
        }
    }

    async scheduleWorkoutReminder(time) {
        const [hours, minutes] = time.split(':');
        const now = new Date();
        let reminderTime = new Date();
        reminderTime.setHours(parseInt(hours));
        reminderTime.setMinutes(parseInt(minutes));
        reminderTime.setSeconds(0);

        if (reminderTime < now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const delay = reminderTime - now;
        setTimeout(() => {
            this.showWorkoutReminder();
            this.scheduleWorkoutReminder(time);
        }, delay);
    }

    async showWorkoutReminder() {
        if (Notification.permission === 'granted') {
            const options = {
                body: "Time for your daily workout! 💪",
                icon: '/images/icons/icon-192x192.png',
                badge: '/images/icons/badge-72x72.png',
                tag: 'workout-reminder',
                data: {
                    url: '/home.html'
                },
                actions: [
                    {
                        action: 'start',
                        title: 'Start Workout'
                    },
                    {
                        action: 'snooze',
                        title: 'Snooze'
                    }
                ]
            };

            await this.registration.showNotification('Workout Time!', options);
        }
    }

    async showAchievementNotification(achievement) {
        if (Notification.permission === 'granted') {
            const options = {
                body: `Congratulations! You've earned: ${achievement.name}`,
                icon: '/images/icons/achievement-192x192.png',
                badge: '/images/icons/badge-72x72.png',
                tag: 'achievement',
                data: {
                    url: '/achievements.html'
                }
            };

            await this.registration.showNotification('New Achievement! 🏆', options);
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Initialize push notification service
const pushNotificationService = new PushNotificationService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PushNotificationService;
} 