class AchievementTracker {
    constructor() {
        this.achievements = {
            workoutStreak: [
                { id: 'streak3', name: '3-Day Streak', description: 'Complete workouts for 3 consecutive days', threshold: 3 },
                { id: 'streak7', name: 'Week Warrior', description: 'Complete workouts for 7 consecutive days', threshold: 7 },
                { id: 'streak30', name: 'Monthly Master', description: 'Complete workouts for 30 consecutive days', threshold: 30 }
            ],
            totalWorkouts: [
                { id: 'workouts10', name: 'Getting Started', description: 'Complete 10 workouts', threshold: 10 },
                { id: 'workouts50', name: 'Fitness Enthusiast', description: 'Complete 50 workouts', threshold: 50 },
                { id: 'workouts100', name: 'Fitness Pro', description: 'Complete 100 workouts', threshold: 100 }
            ],
            caloriesBurned: [
                { id: 'calories1000', name: 'Calorie Crusher', description: 'Burn 1,000 total calories', threshold: 1000 },
                { id: 'calories5000', name: 'Fat Blaster', description: 'Burn 5,000 total calories', threshold: 5000 },
                { id: 'calories10000', name: 'Metabolism Master', description: 'Burn 10,000 total calories', threshold: 10000 }
            ],
            exerciseVariety: [
                { id: 'variety5', name: 'Jack of All Trades', description: 'Try 5 different exercises', threshold: 5 },
                { id: 'variety15', name: 'Exercise Explorer', description: 'Try 15 different exercises', threshold: 15 },
                { id: 'variety30', name: 'Fitness Adventurer', description: 'Try 30 different exercises', threshold: 30 }
            ]
        };
    }

    checkAchievements(userData) {
        const newAchievements = [];
        const userAchievements = userData.achievements || [];

        // Check workout streak achievements
        if (userData.currentStreak) {
            this.achievements.workoutStreak.forEach(achievement => {
                if (userData.currentStreak >= achievement.threshold && 
                    !userAchievements.includes(achievement.id)) {
                    newAchievements.push(achievement);
                }
            });
        }

        // Check total workouts achievements
        if (userData.totalWorkouts) {
            this.achievements.totalWorkouts.forEach(achievement => {
                if (userData.totalWorkouts >= achievement.threshold && 
                    !userAchievements.includes(achievement.id)) {
                    newAchievements.push(achievement);
                }
            });
        }

        // Check calories burned achievements
        if (userData.totalCalories) {
            this.achievements.caloriesBurned.forEach(achievement => {
                if (userData.totalCalories >= achievement.threshold && 
                    !userAchievements.includes(achievement.id)) {
                    newAchievements.push(achievement);
                }
            });
        }

        // Check exercise variety achievements
        if (userData.uniqueExercises) {
            this.achievements.exerciseVariety.forEach(achievement => {
                if (userData.uniqueExercises.length >= achievement.threshold && 
                    !userAchievements.includes(achievement.id)) {
                    newAchievements.push(achievement);
                }
            });
        }

        return newAchievements;
    }

    getMotivationalMessage(userData, language = 'en') {
        const progress = this.calculateProgress(userData);
        const messages = motivationalMessages[language] || motivationalMessages.en;

        if (progress.isStreak) {
            return messages.streak[Math.floor(Math.random() * messages.streak.length)];
        } else if (progress.reachedMilestone) {
            return messages.milestone[Math.floor(Math.random() * messages.milestone.length)];
        } else {
            return messages.workout[Math.floor(Math.random() * messages.workout.length)];
        }
    }

    calculateProgress(userData) {
        return {
            isStreak: userData.currentStreak >= 3,
            reachedMilestone: this.checkMilestones(userData),
            improvement: this.calculateImprovement(userData)
        };
    }

    checkMilestones(userData) {
        const milestones = [10, 25, 50, 100];
        return milestones.some(milestone => 
            userData.totalWorkouts === milestone || 
            userData.totalCalories >= milestone * 100
        );
    }

    calculateImprovement(userData) {
        // Calculate improvement based on recent workout performance
        // This could be expanded based on your specific needs
        return {
            workoutFrequency: this.calculateWorkoutFrequency(userData),
            calorieProgress: this.calculateCalorieProgress(userData)
        };
    }

    calculateWorkoutFrequency(userData) {
        const workouts = userData.workoutHistory || [];
        const lastWeek = workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return workoutDate >= weekAgo;
        });
        return lastWeek.length;
    }

    calculateCalorieProgress(userData) {
        const workouts = userData.workoutHistory || [];
        if (workouts.length < 2) return 0;

        const recentWorkouts = workouts.slice(-5);
        const averageCalories = recentWorkouts.reduce((sum, workout) => 
            sum + workout.totalCalories, 0) / recentWorkouts.length;
        
        const previousWorkouts = workouts.slice(-10, -5);
        const previousAverage = previousWorkouts.reduce((sum, workout) => 
            sum + workout.totalCalories, 0) / previousWorkouts.length;

        return ((averageCalories - previousAverage) / previousAverage) * 100;
    }
}

// Initialize achievement tracker
const achievementTracker = new AchievementTracker();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementTracker;
} 