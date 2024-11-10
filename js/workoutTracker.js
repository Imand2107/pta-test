class WorkoutTracker {
    constructor() {
        this.currentWorkout = {
            startTime: null,
            exercises: [],
            totalDuration: 0,
            totalCalories: 0
        };
    }

    startWorkout() {
        this.currentWorkout.startTime = new Date();
        localStorage.setItem('currentWorkout', JSON.stringify(this.currentWorkout));
    }

    addExercise(exercise, completedReps, duration) {
        const exerciseData = {
            name: exercise.name,
            type: exercise.type,
            reps: completedReps,
            duration: duration,
            calories: exercise.calories,
            timestamp: new Date()
        };

        this.currentWorkout.exercises.push(exerciseData);
        this.currentWorkout.totalDuration += duration;
        this.currentWorkout.totalCalories += exercise.calories;

        localStorage.setItem('currentWorkout', JSON.stringify(this.currentWorkout));
    }

    completeWorkout() {
        const workout = {
            ...this.currentWorkout,
            endTime: new Date(),
            date: new Date().toISOString()
        };

        // Get existing workout history
        const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
        history.push(workout);
        localStorage.setItem('workoutHistory', JSON.stringify(history));

        // Update user stats
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userData = JSON.parse(localStorage.getItem(`userData_${currentUser.id}`));
        
        userData.totalWorkouts = (userData.totalWorkouts || 0) + 1;
        userData.totalMinutes = (userData.totalMinutes || 0) + workout.totalDuration;
        userData.totalCalories = (userData.totalCalories || 0) + workout.totalCalories;

        localStorage.setItem(`userData_${currentUser.id}`, JSON.stringify(userData));

        // Clear current workout
        this.currentWorkout = {
            startTime: null,
            exercises: [],
            totalDuration: 0,
            totalCalories: 0
        };
        localStorage.removeItem('currentWorkout');
    }

    getCurrentExercise() {
        return this.currentWorkout.exercises[this.currentWorkout.exercises.length - 1];
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkoutTracker;
} 