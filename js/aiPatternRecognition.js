class AIPatternRecognition {
    constructor() {
        this.patterns = {
            timePreference: new Map(), // Time of day preferences
            exerciseSequence: new Map(), // Exercise combinations that work well
            restPeriods: new Map(), // Optimal rest periods
            performanceTrends: new Map() // Exercise performance patterns
        };
        this.learningRate = 0.1;
    }

    analyzeWorkoutPatterns(workoutHistory) {
        return {
            timePatterns: this.analyzeTimePreferences(workoutHistory),
            sequencePatterns: this.analyzeExerciseSequences(workoutHistory),
            restPatterns: this.analyzeRestPeriods(workoutHistory),
            performancePatterns: this.analyzePerformanceTrends(workoutHistory)
        };
    }

    analyzeTimePreferences(workoutHistory) {
        const timeSlots = new Map();
        workoutHistory.forEach(workout => {
            const hour = new Date(workout.startTime).getHours();
            const slot = Math.floor(hour / 4); // 6 4-hour slots per day
            timeSlots.set(slot, (timeSlots.get(slot) || 0) + 1);
        });
        
        // Find most preferred time slot
        return Array.from(timeSlots.entries())
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 0;
    }

    analyzeExerciseSequences(workoutHistory) {
        const sequences = new Map();
        workoutHistory.forEach(workout => {
            const exercises = workout.exercises;
            for (let i = 0; i < exercises.length - 1; i++) {
                const pair = `${exercises[i].name}|${exercises[i + 1].name}`;
                sequences.set(pair, (sequences.get(pair) || 0) + 1);
            }
        });
        
        return Array.from(sequences.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([pair]) => pair.split('|'));
    }

    analyzeRestPeriods(workoutHistory) {
        const restPeriods = new Map();
        workoutHistory.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (exercise.restPeriod) {
                    restPeriods.set(
                        exercise.name,
                        (restPeriods.get(exercise.name) || []).concat(exercise.restPeriod)
                    );
                }
            });
        });

        // Calculate optimal rest periods
        return new Map(Array.from(restPeriods.entries()).map(([name, periods]) => [
            name,
            Math.round(periods.reduce((a, b) => a + b, 0) / periods.length)
        ]));
    }

    analyzePerformanceTrends(workoutHistory) {
        const trends = new Map();
        workoutHistory.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (!trends.has(exercise.name)) {
                    trends.set(exercise.name, {
                        improvements: 0,
                        declines: 0,
                        lastPerformance: null
                    });
                }

                const trend = trends.get(exercise.name);
                if (trend.lastPerformance !== null) {
                    if (exercise.performance > trend.lastPerformance) {
                        trend.improvements++;
                    } else if (exercise.performance < trend.lastPerformance) {
                        trend.declines++;
                    }
                }
                trend.lastPerformance = exercise.performance;
            });
        });

        return trends;
    }

    predictOptimalWorkout(userData, patterns) {
        const timeSlot = this.predictBestTime(patterns.timePatterns);
        const exercises = this.selectExercisesBasedOnPatterns(userData, patterns);
        const restPeriods = this.optimizeRestPeriods(exercises, patterns.restPatterns);
        const difficulty = this.calculateOptimalDifficulty(userData, patterns.performancePatterns);

        return {
            recommendedTime: timeSlot,
            exercises,
            restPeriods,
            difficulty,
            estimatedDuration: this.calculateWorkoutDuration(exercises, restPeriods)
        };
    }

    predictBestTime(timePatterns) {
        // Convert slot back to time range
        const slot = timePatterns;
        const startHour = slot * 4;
        return {
            start: startHour,
            end: startHour + 4
        };
    }

    selectExercisesBasedOnPatterns(userData, patterns) {
        const selectedExercises = [];
        const availableExercises = [...exercises[userData.fitnessLevel]];
        
        // Start with successful sequences
        patterns.sequencePatterns.forEach(([first, second]) => {
            if (selectedExercises.length < 6) {
                const firstEx = availableExercises.find(e => e.name === first);
                const secondEx = availableExercises.find(e => e.name === second);
                if (firstEx && secondEx) {
                    selectedExercises.push(firstEx, secondEx);
                }
            }
        });

        // Fill remaining slots with exercises that show good performance trends
        while (selectedExercises.length < 8) {
            const remainingExercises = availableExercises.filter(
                ex => !selectedExercises.includes(ex)
            );
            
            if (remainingExercises.length === 0) break;
            
            const nextExercise = this.selectNextBestExercise(
                remainingExercises,
                patterns.performancePatterns
            );
            
            if (nextExercise) {
                selectedExercises.push(nextExercise);
            }
        }

        return selectedExercises;
    }

    selectNextBestExercise(exercises, performancePatterns) {
        return exercises.sort((a, b) => {
            const patternA = performancePatterns.get(a.name) || { improvements: 0, declines: 0 };
            const patternB = performancePatterns.get(b.name) || { improvements: 0, declines: 0 };
            
            const scoreA = patternA.improvements - patternA.declines;
            const scoreB = patternB.improvements - patternB.declines;
            
            return scoreB - scoreA;
        })[0];
    }

    optimizeRestPeriods(exercises, restPatterns) {
        return exercises.map(exercise => ({
            exercise: exercise.name,
            restPeriod: restPatterns.get(exercise.name) || 60 // Default 60 seconds
        }));
    }

    calculateOptimalDifficulty(userData, performancePatterns) {
        const averageImprovement = Array.from(performancePatterns.values())
            .reduce((sum, { improvements, declines }) => 
                sum + (improvements - declines), 0) / performancePatterns.size;

        // Adjust difficulty based on improvement rate
        let baseDifficulty = userData.fitnessLevel === 'beginner' ? 0.6 :
                            userData.fitnessLevel === 'intermediate' ? 0.75 : 0.9;

        return Math.min(1, Math.max(0.4, baseDifficulty + (averageImprovement * 0.1)));
    }

    calculateWorkoutDuration(exercises, restPeriods) {
        const exerciseTime = exercises.reduce((total, exercise) => 
            total + (exercise.duration || exercise.reps * 3), 0);
        const totalRestTime = restPeriods.reduce((total, { restPeriod }) => 
            total + restPeriod, 0);
        
        return exerciseTime + totalRestTime;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPatternRecognition;
} 