let currentLanguage = localStorage.getItem('language') || 'en';

const exercises = {
    weightLoss: {
        beginner: [
            {
                name: "Jumping Jacks",
                type: "countdown",
                duration: 30,
                image: "images/jumping-jacks.jpg",
                description: "Stand upright, jump while spreading legs and raising arms",
                difficulty: 1,
                targetMuscles: ["full-body"],
                equipment: "none",
                calories: 8
            },
            {
                name: "Push-ups",
                type: "reps",
                reps: 10,
                image: "images/pushups.jpg",
                description: "Standard push-up position, lower body until chest nearly touches ground",
                difficulty: 2,
                targetMuscles: ["chest", "shoulders", "triceps"],
                equipment: "none",
                calories: 7
            },
            {
                name: "Squats",
                type: "reps",
                reps: 15,
                image: "images/squats.jpg",
                description: "Stand with feet shoulder-width apart, lower your body as if sitting back into a chair",
                difficulty: 1,
                targetMuscles: ["legs", "glutes"],
                equipment: "none",
                calories: 8
            },
            {
                name: "Mountain Climbers",
                type: "countdown",
                duration: 30,
                image: "images/mountain-climbers.jpg",
                description: "In plank position, alternate bringing knees to chest in a running motion",
                difficulty: 2,
                targetMuscles: ["core", "shoulders", "cardio"],
                equipment: "none",
                calories: 10
            },
            {
                name: "Jumping Rope",
                type: "countdown",
                duration: 30,
                image: "images/exercises/jumping-rope.jpg",
                description: "Jump rope with both feet, keeping a steady rhythm",
                difficulty: 2,
                targetMuscles: ["cardio", "legs"],
                equipment: "jump rope",
                calories: 12
            },
            {
                name: "Plank",
                type: "countdown",
                duration: 30,
                image: "images/exercises/plank.jpg",
                description: "Hold a straight-arm plank position, keeping body straight",
                difficulty: 2,
                targetMuscles: ["core", "shoulders"],
                equipment: "none",
                calories: 5
            },
            {
                name: "Lunges",
                type: "reps",
                reps: 12,
                image: "images/exercises/lunges.jpg",
                description: "Step forward into a lunge position, alternating legs",
                difficulty: 2,
                targetMuscles: ["legs", "glutes"],
                equipment: "none",
                calories: 8
            }
        ],
        intermediate: [
            {
                name: "Burpees",
                type: "reps",
                reps: 12,
                image: "images/burpees.jpg",
                description: "Drop to a plank, do a push-up, jump feet forward, then jump up with hands overhead",
                difficulty: 3,
                targetMuscles: ["full-body"],
                equipment: "none",
                calories: 15
            },
            {
                name: "Mountain Climbers",
                type: "countdown",
                duration: 45,
                image: "images/exercises/mountain-climbers.jpg",
                description: "Alternate bringing knees to chest in plank position",
                difficulty: 3,
                targetMuscles: ["core", "cardio"],
                equipment: "none",
                calories: 12
            },
            {
                name: "Jump Squats",
                type: "reps",
                reps: 15,
                image: "images/exercises/jump-squats.jpg",
                description: "Perform a squat, then jump explosively upward",
                difficulty: 3,
                targetMuscles: ["legs", "cardio"],
                equipment: "none",
                calories: 15
            }
        ]
    },
    muscleGain: {
        beginner: [
            {
                name: "Diamond Push-ups",
                type: "reps",
                reps: 8,
                image: "images/diamond-pushups.jpg",
                description: "Push-ups with hands close together forming a diamond shape",
                difficulty: 2,
                targetMuscles: ["chest", "triceps"],
                equipment: "none",
                calories: 8
            },
            {
                name: "Dips",
                type: "reps",
                reps: 10,
                image: "images/dips.jpg",
                description: "Using a chair or sturdy surface, lower body with arms then push back up",
                difficulty: 2,
                targetMuscles: ["triceps", "chest", "shoulders"],
                equipment: "chair",
                calories: 9
            },
            {
                name: "Wall Push-ups",
                type: "reps",
                reps: 12,
                image: "images/exercises/wall-pushups.jpg",
                description: "Perform push-ups against a wall for reduced difficulty",
                difficulty: 1,
                targetMuscles: ["chest", "shoulders"],
                equipment: "none",
                calories: 5
            },
            {
                name: "Glute Bridge",
                type: "reps",
                reps: 15,
                image: "images/exercises/glute-bridge.jpg",
                description: "Lie on back, lift hips up while squeezing glutes",
                difficulty: 1,
                targetMuscles: ["glutes", "core"],
                equipment: "none",
                calories: 6
            }
        ],
        intermediate: [
            {
                name: "Pike Push-ups",
                type: "reps",
                reps: 10,
                image: "images/exercises/pike-pushups.jpg",
                description: "Push-ups with hips raised in an inverted V position",
                difficulty: 3,
                targetMuscles: ["shoulders", "triceps"],
                equipment: "none",
                calories: 8
            },
            {
                name: "Bulgarian Split Squats",
                type: "reps",
                reps: 12,
                image: "images/exercises/bulgarian-split-squats.jpg",
                description: "Single-leg squats with rear foot elevated",
                difficulty: 3,
                targetMuscles: ["legs", "glutes"],
                equipment: "bench",
                calories: 10
            }
        ]
    },
    endurance: {
        beginner: [
            {
                name: "High Knees",
                type: "countdown",
                duration: 45,
                image: "images/high-knees.jpg",
                description: "Run in place bringing knees up to waist level",
                difficulty: 2,
                targetMuscles: ["legs", "cardio"],
                equipment: "none",
                calories: 12
            },
            {
                name: "Marching in Place",
                type: "countdown",
                duration: 60,
                image: "images/exercises/marching.jpg",
                description: "March in place with high knees",
                difficulty: 1,
                targetMuscles: ["cardio", "legs"],
                equipment: "none",
                calories: 8
            },
            {
                name: "Step Touches",
                type: "countdown",
                duration: 45,
                image: "images/exercises/step-touches.jpg",
                description: "Step side to side, touching floor with opposite foot",
                difficulty: 1,
                targetMuscles: ["cardio", "legs"],
                equipment: "none",
                calories: 7
            }
        ],
        intermediate: [
            {
                name: "Burpee Variations",
                type: "reps",
                reps: 10,
                image: "images/exercises/burpee-variations.jpg",
                description: "Modified burpees with different variations",
                difficulty: 3,
                targetMuscles: ["full-body", "cardio"],
                equipment: "none",
                calories: 15
            }
        ]
    },
    flexibility: {
        beginner: [
            {
                name: "Standing Forward Bend",
                type: "countdown",
                duration: 30,
                image: "images/forward-bend.jpg",
                description: "Bend forward from hips, reaching toward toes",
                difficulty: 1,
                targetMuscles: ["hamstrings", "back"],
                equipment: "none",
                calories: 3
            },
            {
                name: "Cat-Cow Stretch",
                type: "countdown",
                duration: 30,
                image: "images/exercises/cat-cow.jpg",
                description: "Alternate between arching and rounding back on hands and knees",
                difficulty: 1,
                targetMuscles: ["back", "core"],
                equipment: "none",
                calories: 2
            },
            {
                name: "Shoulder Rolls",
                type: "reps",
                reps: 10,
                image: "images/exercises/shoulder-rolls.jpg",
                description: "Roll shoulders forward and backward",
                difficulty: 1,
                targetMuscles: ["shoulders", "upper back"],
                equipment: "none",
                calories: 1
            }
        ],
        intermediate: {
            name: "Downward Dog",
            type: "countdown",
            duration: 45,
            image: "images/exercises/downward-dog.jpg",
            description: "Form an inverted V with body, pressing heels toward ground",
            difficulty: 2,
            targetMuscles: ["full-body", "shoulders"],
            equipment: "none",
            calories: 4
        }
    }
};

function getRecommendedExercises(goals, fitnessLevel, bmi) {
    let recommendedExercises = [];
    let workoutPlan = [];
    
    goals.forEach(goal => {
        if (exercises[goal] && exercises[goal][fitnessLevel]) {
            recommendedExercises = [...recommendedExercises, ...exercises[goal][fitnessLevel]];
        }
    });
    
    // Adjust workout based on BMI
    if (bmi < 18.5) {
        workoutPlan = recommendedExercises.filter(ex => 
            ex.targetMuscles.includes("full-body") || 
            ex.targetMuscles.includes("chest") || 
            ex.targetMuscles.includes("legs")
        );
    } else if (bmi > 25) {
        workoutPlan = recommendedExercises.filter(ex => 
            ex.targetMuscles.includes("cardio") || 
            ex.targetMuscles.includes("full-body")
        );
    } else {
        workoutPlan = recommendedExercises;
    }
    
    // Translate exercises if needed
    if (currentLanguage !== 'en') {
        workoutPlan = workoutPlan.map(exercise => {
            const translation = translateExercise(exercise.name, currentLanguage);
            if (translation) {
                return {
                    ...exercise,
                    name: translation.name,
                    description: translation.description
                };
            }
            return exercise;
        });
    }
    
    return shuffleArray(workoutPlan).slice(0, 8);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateLanguage(language) {
    currentLanguage = language;
    // Trigger exercise list refresh if needed
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { exercises, getRecommendedExercises, updateLanguage };
} 