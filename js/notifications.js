class NotificationManager {
    constructor() {
        this.checkPermission();
    }

    async checkPermission() {
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return;
        }

        if (Notification.permission !== "granted") {
            await Notification.requestPermission();
        }
    }

    scheduleWorkoutReminder(time) {
        const [hours, minutes] = time.split(':');
        const now = new Date();
        let reminderTime = new Date();
        reminderTime.setHours(parseInt(hours));
        reminderTime.setMinutes(parseInt(minutes));
        reminderTime.setSeconds(0);

        // If the time has already passed today, schedule for tomorrow
        if (reminderTime < now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime - now;
        
        setTimeout(() => {
            this.showNotification();
            // Schedule next reminder for tomorrow
            this.scheduleWorkoutReminder(time);
        }, timeUntilReminder);
    }

    showNotification() {
        if (Notification.permission === "granted") {
            const notification = new Notification("Time to Work Out! 💪", {
                body: "Your daily workout is waiting for you!",
                icon: "/images/logo.png",
                badge: "/images/badge.png"
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
                window.location.href = 'home.html';
            };
        }
    }

    cancelReminders() {
        // Clear all scheduled reminders
        // Note: This is a simplified version. In a real app, you'd need to store
        // and manage timeout IDs to properly cancel specific reminders
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
} 