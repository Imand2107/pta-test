const exerciseTranslations = {
    en: {
        // English translations are already in exercises.js
    },
    es: {
        "Jumping Jacks": {
            name: "Saltos de Tijera",
            description: "De pie, salta abriendo piernas y levantando brazos"
        },
        "Push-ups": {
            name: "Flexiones",
            description: "En posición de plancha, baja el cuerpo hasta que el pecho casi toque el suelo"
        },
        // Add more Spanish translations...
    },
    fr: {
        "Jumping Jacks": {
            name: "Sauts de Jumping Jack",
            description: "Debout, sautez en écartant les jambes et en levant les bras"
        },
        "Push-ups": {
            name: "Pompes",
            description: "En position de planche, abaissez le corps jusqu'à ce que la poitrine touche presque le sol"
        },
        // Add more French translations...
    },
    de: {
        "Jumping Jacks": {
            name: "Hampelmann",
            description: "Im Stand springen und dabei Beine spreizen und Arme heben"
        },
        "Push-ups": {
            name: "Liegestütze",
            description: "In Plank-Position, senken Sie den Körper, bis die Brust fast den Boden berührt"
        },
        // Add more German translations...
    },
    // Add more languages...
};

function translateExercise(exerciseName, language = 'en') {
    if (language === 'en') return null; // Use default English name/description
    
    const translation = exerciseTranslations[language]?.[exerciseName];
    return translation || null;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { exerciseTranslations, translateExercise };
} 