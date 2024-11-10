class ShareService {
    constructor() {
        this.shareData = {
            title: 'Personal Fitness Trainer Achievement',
            text: 'I just unlocked a new achievement in my fitness journey!',
            url: window.location.href
        };
    }

    async shareAchievement(achievement, stats) {
        const text = this.generateShareText(achievement, stats);
        
        if (navigator.share) {
            try {
                await navigator.share({
                    ...this.shareData,
                    text: text
                });
                return true;
            } catch (err) {
                console.log('Error sharing:', err);
                return this.fallbackShare(text);
            }
        } else {
            return this.fallbackShare(text);
        }
    }

    generateShareText(achievement, stats) {
        return `🏆 I just unlocked "${achievement.name}" in Personal Fitness Trainer!\n` +
               `${achievement.description}\n` +
               `📊 My Stats:\n` +
               `🔥 ${stats.streak} day streak\n` +
               `💪 ${stats.totalWorkouts} workouts completed\n` +
               `🎯 ${stats.totalCalories} calories burned\n` +
               `#PersonalFitnessTrainer #FitnessGoals #Achievement`;
    }

    fallbackShare(text) {
        // Create temporary input for copying text
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        
        try {
            document.execCommand('copy');
            alert('Share text copied to clipboard! You can now paste it in your favorite social media app.');
            return true;
        } catch (err) {
            console.log('Error copying text:', err);
            return false;
        } finally {
            document.body.removeChild(input);
        }
    }

    async generateShareImage(achievement, stats) {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw achievement info
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(achievement.name, canvas.width/2, 200);

        ctx.font = '32px Arial';
        ctx.fillText(achievement.description, canvas.width/2, 280);

        // Draw stats
        ctx.font = 'bold 36px Arial';
        ctx.fillText(`${stats.streak} Day Streak`, canvas.width/2, 380);
        ctx.fillText(`${stats.totalWorkouts} Workouts`, canvas.width/2, 440);
        ctx.fillText(`${stats.totalCalories} Calories Burned`, canvas.width/2, 500);

        // Add logo/branding
        ctx.font = '24px Arial';
        ctx.fillText('Personal Fitness Trainer', canvas.width/2, 580);

        return canvas.toDataURL('image/png');
    }
}

// Initialize share service
const shareService = new ShareService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShareService;
} 