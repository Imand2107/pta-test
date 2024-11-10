class AdminAnalytics {
    constructor() {
        this.metrics = {
            activeUsers: {
                daily: 0,
                weekly: 0,
                monthly: 0
            },
            workoutMetrics: {
                totalWorkouts: 0,
                averageDuration: 0,
                totalCalories: 0,
                popularExercises: []
            },
            userMetrics: {
                totalUsers: 0,
                newUsers: 0,
                retentionRate: 0,
                completionRate: 0
            },
            appMetrics: {
                crashes: 0,
                loadTime: 0,
                errorRate: 0,
                syncSuccess: 0
            }
        };
    }

    async calculateMetrics() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        // Calculate active users
        this.metrics.activeUsers = {
            daily: this.getActiveUsers(users, now - oneDay),
            weekly: this.getActiveUsers(users, now - oneWeek),
            monthly: this.getActiveUsers(users, now - oneMonth)
        };

        // Calculate workout metrics
        this.metrics.workoutMetrics = await this.calculateWorkoutMetrics(users);

        // Calculate user metrics
        this.metrics.userMetrics = this.calculateUserMetrics(users);

        // Calculate app metrics
        this.metrics.appMetrics = await this.calculateAppMetrics();

        return this.metrics;
    }

    getActiveUsers(users, since) {
        return users.filter(user => {
            const userData = JSON.parse(localStorage.getItem(`userData_${user.id}`) || '{}');
            const lastActive = new Date(userData.lastActive || 0);
            return lastActive.getTime() > since;
        }).length;
    }

    async calculateWorkoutMetrics(users) {
        let totalWorkouts = 0;
        let totalDuration = 0;
        let totalCalories = 0;
        const exerciseCounts = {};

        users.forEach(user => {
            const workoutHistory = JSON.parse(localStorage.getItem(`workoutHistory_${user.id}`) || '[]');
            
            totalWorkouts += workoutHistory.length;
            workoutHistory.forEach(workout => {
                totalDuration += workout.totalDuration;
                totalCalories += workout.totalCalories;
                
                workout.exercises.forEach(exercise => {
                    exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
                });
            });
        });

        const popularExercises = Object.entries(exerciseCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return {
            totalWorkouts,
            averageDuration: totalWorkouts ? totalDuration / totalWorkouts : 0,
            totalCalories,
            popularExercises
        };
    }

    calculateUserMetrics(users) {
        const now = new Date();
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        const newUsers = users.filter(user => 
            (now - new Date(user.dateJoined)) < oneMonth
        ).length;

        const activeUsers = users.filter(user => {
            const userData = JSON.parse(localStorage.getItem(`userData_${user.id}`) || '{}');
            return userData.lastActive && (now - new Date(userData.lastActive)) < oneMonth;
        }).length;

        return {
            totalUsers: users.length,
            newUsers,
            retentionRate: users.length ? (activeUsers / users.length) * 100 : 0,
            completionRate: this.calculateCompletionRate(users)
        };
    }

    calculateCompletionRate(users) {
        let completedWorkouts = 0;
        let startedWorkouts = 0;

        users.forEach(user => {
            const workoutHistory = JSON.parse(localStorage.getItem(`workoutHistory_${user.id}`) || '[]');
            workoutHistory.forEach(workout => {
                startedWorkouts++;
                if (workout.endTime) completedWorkouts++;
            });
        });

        return startedWorkouts ? (completedWorkouts / startedWorkouts) * 100 : 0;
    }

    async calculateAppMetrics() {
        // In a real app, these would come from server logs or monitoring service
        return {
            crashes: parseInt(localStorage.getItem('appCrashes') || '0'),
            loadTime: parseFloat(localStorage.getItem('avgLoadTime') || '0'),
            errorRate: parseFloat(localStorage.getItem('errorRate') || '0'),
            syncSuccess: parseFloat(localStorage.getItem('syncSuccessRate') || '100')
        };
    }

    logError(error) {
        const errors = JSON.parse(localStorage.getItem('appErrors') || '[]');
        errors.push({
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        });
        localStorage.setItem('appErrors', JSON.stringify(errors));
    }

    logCrash() {
        const crashes = parseInt(localStorage.getItem('appCrashes') || '0');
        localStorage.setItem('appCrashes', crashes + 1);
    }

    logLoadTime(time) {
        const times = JSON.parse(localStorage.getItem('loadTimes') || '[]');
        times.push(time);
        localStorage.setItem('loadTimes', JSON.stringify(times));
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        localStorage.setItem('avgLoadTime', avgTime);
    }
}

// Initialize analytics
const adminAnalytics = new AdminAnalytics();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAnalytics;
} 