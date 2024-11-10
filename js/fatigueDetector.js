class FatigueDetector {
    constructor() {
        this.fatigueIndicators = {
            performanceDecline: 0,
            restTimeIncrease: 0,
            formDeviation: 0,
            heartRateVariation: 0
        };
        this.baselinePerformance = null;
        this.recentPerformance = [];
        this.maxSamples = 5;
        this.fatigueTolerance = 0.7; // 70% threshold for fatigue detection
    }

    analyzeFatigue(exerciseData) {
        this.updatePerformanceMetrics(exerciseData);
        this.analyzeRestPeriods(exerciseData);
        this.analyzeFormQuality(exerciseData);
        if (exerciseData.heartRate) {
            this.analyzeHeartRate(exerciseData.heartRate);
        }

        return {
            fatigueLevel: this.calculateFatigueLevel(),
            recommendations: this.generateRecommendations(),
            shouldStop: this.checkStopCondition()
        };
    }

    updatePerformanceMetrics(exerciseData) {
        if (!this.baselinePerformance) {
            this.baselinePerformance = this.calculatePerformanceScore(exerciseData);
            return;
        }

        this.recentPerformance.push(this.calculatePerformanceScore(exerciseData));
        if (this.recentPerformance.length > this.maxSamples) {
            this.recentPerformance.shift();
        }

        const averagePerformance = this.recentPerformance.reduce((a, b) => a + b, 0) / this.recentPerformance.length;
        this.fatigueIndicators.performanceDecline = Math.max(0, (this.baselinePerformance - averagePerformance) / this.baselinePerformance);
    }

    calculatePerformanceScore(exerciseData) {
        const {
            completedReps,
            targetReps,
            duration,
            targetDuration,
            formQuality
        } = exerciseData;

        let score = 1.0;

        if (targetReps) {
            score *= completedReps / targetReps;
        }

        if (targetDuration) {
            score *= Math.min(duration / targetDuration, 1);
        }

        if (formQuality) {
            score *= formQuality;
        }

        return score;
    }

    analyzeRestPeriods(exerciseData) {
        const { restDuration, standardRestDuration } = exerciseData;
        if (restDuration && standardRestDuration) {
            this.fatigueIndicators.restTimeIncrease = Math.max(0, (restDuration - standardRestDuration) / standardRestDuration);
        }
    }

    analyzeFormQuality(exerciseData) {
        const { formQuality, previousFormQuality } = exerciseData;
        if (formQuality && previousFormQuality) {
            this.fatigueIndicators.formDeviation = Math.max(0, previousFormQuality - formQuality);
        }
    }

    analyzeHeartRate(heartRateData) {
        const { current, baseline, recovery } = heartRateData;
        if (current && baseline && recovery) {
            const recoveryRate = (current - recovery) / (current - baseline);
            this.fatigueIndicators.heartRateVariation = Math.max(0, 1 - recoveryRate);
        }
    }

    calculateFatigueLevel() {
        const weights = {
            performanceDecline: 0.4,
            restTimeIncrease: 0.2,
            formDeviation: 0.3,
            heartRateVariation: 0.1
        };

        return Object.entries(this.fatigueIndicators).reduce((total, [indicator, value]) => {
            return total + (value * weights[indicator]);
        }, 0);
    }

    generateRecommendations() {
        const fatigueLevel = this.calculateFatigueLevel();
        
        if (fatigueLevel > 0.8) {
            return {
                action: 'stop',
                message: 'High fatigue detected. Consider ending your workout.',
                adjustments: {
                    restIncrease: 60,
                    intensityReduction: 0.5
                }
            };
        } else if (fatigueLevel > 0.6) {
            return {
                action: 'modify',
                message: 'Moderate fatigue detected. Increase rest periods and reduce intensity.',
                adjustments: {
                    restIncrease: 30,
                    intensityReduction: 0.3
                }
            };
        } else if (fatigueLevel > 0.4) {
            return {
                action: 'monitor',
                message: 'Some fatigue detected. Monitor your form carefully.',
                adjustments: {
                    restIncrease: 15,
                    intensityReduction: 0.1
                }
            };
        }

        return {
            action: 'continue',
            message: 'Fatigue levels are normal. Continue your workout.',
            adjustments: null
        };
    }

    checkStopCondition() {
        const fatigueLevel = this.calculateFatigueLevel();
        return fatigueLevel > this.fatigueTolerance;
    }

    resetMetrics() {
        this.fatigueIndicators = {
            performanceDecline: 0,
            restTimeIncrease: 0,
            formDeviation: 0,
            heartRateVariation: 0
        };
        this.baselinePerformance = null;
        this.recentPerformance = [];
    }

    adjustWorkout(workout, fatigueLevel) {
        if (fatigueLevel <= 0.3) return workout;

        return {
            ...workout,
            exercises: workout.exercises.map(exercise => ({
                ...exercise,
                reps: exercise.type === 'reps' ? 
                    Math.floor(exercise.reps * (1 - fatigueLevel * 0.3)) : 
                    exercise.reps,
                duration: exercise.type === 'duration' ? 
                    Math.floor(exercise.duration * (1 - fatigueLevel * 0.3)) : 
                    exercise.duration,
                restPeriod: Math.floor(exercise.restPeriod * (1 + fatigueLevel * 0.5))
            }))
        };
    }
}

// Initialize fatigue detector
const fatigueDetector = new FatigueDetector();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FatigueDetector;
} 