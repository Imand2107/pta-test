class AIWorkoutRecommender {
    constructor() {
        this.userPreferences = {};
        this.workoutHistory = [];
        this.fitnessMetrics = {};
        this.learningRate = 0.1;
        this.adaptationThreshold = 5; // Number of workouts before adapting
    }

    async getUserData(userId) {
        const userData = JSON.parse(localStorage.getItem(`userData_${userId}`) || '{}');
        const workoutHistory = JSON.parse(localStorage.getItem(`workoutHistory_${userId}`) || '[]');
        return { ...userData, workoutHistory };
    }

    findPreferredExercises(history) {
        const exerciseScores = {};
        history.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!exerciseScores[exercise.name]) {
                    exerciseScores[exercise.name] = {
                        count: 0,
                        completionRate: 0,
                        difficulty: 0
                    };
                }
                exerciseScores[exercise.name].count++;
                exerciseScores[exercise.name].completionRate += exercise.completed ? 1 : 0;
                exerciseScores[exercise.name].difficulty += exercise.difficulty || 0;
            });
        });

        // Calculate average scores
        Object.keys(exerciseScores).forEach(name => {
            const score = exerciseScores[name];
            score.completionRate /= score.count;
            score.difficulty /= score.count;
        });

        return exerciseScores;
    }

    calculateOptimalDuration(history) {
        if (history.length === 0) return 30; // Default duration

        const recentWorkouts = history.slice(-5);
        const averageDuration = recentWorkouts.reduce((sum, workout) => 
            sum + workout.totalDuration, 0) / recentWorkouts.length;
        
        // Adjust based on completion rate
        const completionRate = recentWorkouts.filter(w => w.completed).length / recentWorkouts.length;
        return Math.round(averageDuration * (completionRate > 0.8 ? 1.1 : 0.9));
    }

    findBestPerforming(history) {
        const exerciseStats = {};
        history.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!exerciseStats[exercise.name]) {
                    exerciseStats[exercise.name] = {
                        totalReps: 0,
                        totalSets: 0,
                        maxReps: 0,
                        improvements: 0
                    };
                }
                
                const stats = exerciseStats[exercise.name];
                stats.totalReps += exercise.reps || 0;
                stats.totalSets++;
                stats.maxReps = Math.max(stats.maxReps, exercise.reps || 0);
                
                if (stats.totalSets > 1) {
                    const avgReps = stats.totalReps / (stats.totalSets - 1);
                    if (exercise.reps > avgReps) stats.improvements++;
                }
            });
        });

        return Object.entries(exerciseStats)
            .map(([name, stats]) => ({
                name,
                improvementRate: stats.improvements / (stats.totalSets - 1),
                averageReps: stats.totalReps / stats.totalSets
            }))
            .sort((a, b) => b.improvementRate - a.improvementRate);
    }

    calculateOptimalIntensity(progress) {
        const baseIntensity = progress.fitnessScore / 100;
        const recentPerformance = progress.enduranceImprovement / 100;
        return Math.min(1, Math.max(0.3, baseIntensity + recentPerformance));
    }

    calculateRestPeriods(fitnessLevel) {
        const basePeriods = {
            beginner: 60,
            intermediate: 45,
            advanced: 30
        };

        return basePeriods[fitnessLevel] || 45;
    }

    suggestExerciseVariations(recentWorkouts) {
        const variations = [];
        const exerciseTypes = new Set(recentWorkouts.map(w => w.type));

        exerciseTypes.forEach(type => {
            const similarExercises = exercises[type] || [];
            variations.push(...similarExercises.filter(e => 
                !recentWorkouts.some(w => w.name === e.name)
            ));
        });

        return variations.slice(0, 3); // Return top 3 variations
    }

    calculateStrengthProgress(userData) {
        if (!userData.workoutHistory?.length) return 0;
        
        const recentWorkouts = userData.workoutHistory.slice(-10);
        const strengthExercises = recentWorkouts.flatMap(w => 
            w.exercises.filter(e => e.type === 'strength')
        );

        if (strengthExercises.length === 0) return 0;

        const initialWeight = strengthExercises[0].weight || 0;
        const currentWeight = strengthExercises[strengthExercises.length - 1].weight || 0;
        
        return ((currentWeight - initialWeight) / initialWeight) * 100;
    }

    calculateEnduranceProgress(userData) {
        if (!userData.workoutHistory?.length) return 0;

        const recentWorkouts = userData.workoutHistory.slice(-10);
        const cardioExercises = recentWorkouts.flatMap(w => 
            w.exercises.filter(e => e.type === 'cardio')
        );

        if (cardioExercises.length === 0) return 0;

        const initialDuration = cardioExercises[0].duration || 0;
        const currentDuration = cardioExercises[cardioExercises.length - 1].duration || 0;
        
        return ((currentDuration - initialDuration) / initialDuration) * 100;
    }

    calculateWeightProgress(userData) {
        if (!userData.weightHistory?.length) return 0;
        
        const initialWeight = userData.weightHistory[0].weight;
        const currentWeight = userData.weightHistory[userData.weightHistory.length - 1].weight;
        const targetWeight = userData.targetWeight;

        if (!targetWeight) return 0;

        const totalChange = Math.abs(targetWeight - initialWeight);
        const currentChange = Math.abs(currentWeight - initialWeight);
        
        return (currentChange / totalChange) * 100;
    }

    calculateOverallFitnessScore(userData) {
        const strengthScore = this.calculateStrengthProgress(userData);
        const enduranceScore = this.calculateEnduranceProgress(userData);
        const weightScore = this.calculateWeightProgress(userData);
        
        // Weight the scores based on user goals
        const weights = {
            strength: userData.goals.includes('muscleGain') ? 0.4 : 0.2,
            endurance: userData.goals.includes('endurance') ? 0.4 : 0.2,
            weight: userData.goals.includes('weightLoss') ? 0.4 : 0.2
        };

        return (
            strengthScore * weights.strength +
            enduranceScore * weights.endurance +
            weightScore * weights.weight
        );
    }

    estimateCalorieBurn(exercises, intensity) {
        return exercises.reduce((total, exercise) => {
            const baseCals = exercise.calories || 0;
            return total + (baseCals * intensity);
        }, 0);
    }

    selectExercises(userData, recentWorkouts) {
        const preferredExercises = this.findPreferredExercises(recentWorkouts);
        const bestPerforming = this.findBestPerforming(recentWorkouts);
        
        // Mix of preferred, best performing, and new exercises
        const selectedExercises = [];
        const exercisePool = [...exercises[userData.fitnessLevel]];
        
        // Add some preferred exercises
        selectedExercises.push(...Object.keys(preferredExercises)
            .sort((a, b) => preferredExercises[b].completionRate - preferredExercises[a].completionRate)
            .slice(0, 3)
            .map(name => exercisePool.find(e => e.name === name))
            .filter(e => e));

        // Add some best performing exercises
        selectedExercises.push(...bestPerforming
            .slice(0, 2)
            .map(e => exercisePool.find(ex => ex.name === e.name))
            .filter(e => e));

        // Add some new exercises
        const newExercises = exercisePool
            .filter(e => !selectedExercises.some(se => se.name === e.name))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        selectedExercises.push(...newExercises);

        return selectedExercises;
    }
}

// Initialize AI recommender
const aiRecommender = new AIWorkoutRecommender();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIWorkoutRecommender;
} 