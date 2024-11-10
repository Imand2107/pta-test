const motivationalMessages = {
    en: {
        workout: [
            "Great job! Keep up the momentum! 💪",
            "You're getting stronger every day! 🌟",
            "One workout closer to your goals! 🎯",
            "Amazing effort! Be proud of yourself! 🏆",
            "You showed up and crushed it! 🔥"
        ],
        milestone: [
            "You're making incredible progress! 🌟",
            "Look how far you've come! 🎉",
            "Your dedication is inspiring! 💫",
            "Keep pushing your limits! 💪",
            "You're becoming unstoppable! 🔥"
        ],
        streak: [
            "What a streak! Keep it going! 🔥",
            "You're on fire! Don't stop now! ⚡",
            "Consistency is key, and you've got it! 🎯",
            "Building healthy habits day by day! 💪",
            "Your dedication is paying off! 🌟"
        ]
    },
    es: {
        workout: [
            "¡Excelente trabajo! ¡Mantén el ritmo! 💪",
            "¡Te haces más fuerte cada día! 🌟",
            "¡Un entrenamiento más cerca de tus objetivos! 🎯",
            "¡Esfuerzo increíble! ¡Siéntete orgulloso! 🏆",
            "¡Lo lograste y lo dominaste! 🔥"
        ],
        milestone: [
            "¡Estás progresando increíblemente! 🌟",
            "¡Mira lo lejos que has llegado! 🎉",
            "¡Tu dedicación es inspiradora! 💫",
            "¡Sigue superando tus límites! 💪",
            "¡Te estás volviendo imparable! 🔥"
        ],
        streak: [
            "¡Qué racha! ¡Sigue así! 🔥",
            "¡Estás en llamas! ¡No pares ahora! ⚡",
            "¡La consistencia es clave, y la tienes! 🎯",
            "¡Construyendo hábitos saludables día a día! 💪",
            "¡Tu dedicación está dando frutos! 🌟"
        ]
    },
    fr: {
        workout: [
            "Excellent travail ! Gardez le rythme ! 💪",
            "Vous devenez plus fort chaque jour ! 🌟",
            "Un entraînement de plus vers vos objectifs ! 🎯",
            "Effort incroyable ! Soyez fier de vous ! 🏆",
            "Vous avez relevé le défi ! 🔥"
        ],
        milestone: [
            "Vos progrès sont incroyables ! 🌟",
            "Regardez tout le chemin parcouru ! 🎉",
            "Votre dévouement est inspirant ! 💫",
            "Continuez à repousser vos limites ! 💪",
            "Vous devenez inarrêtable ! 🔥"
        ],
        streak: [
            "Quelle série ! Continuez comme ça ! 🔥",
            "Vous êtes en feu ! Ne vous arrêtez pas ! ⚡",
            "La constance est la clé, et vous l'avez ! 🎯",
            "Construire des habitudes saines jour après jour ! 💪",
            "Votre dévouement porte ses fruits ! 🌟"
        ]
    },
    // Add more languages as needed
};

function getRandomMessage(type = 'workout', language = 'en') {
    const messages = motivationalMessages[language]?.[type] || motivationalMessages.en[type];
    return messages[Math.floor(Math.random() * messages.length)];
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { motivationalMessages, getRandomMessage };
} 