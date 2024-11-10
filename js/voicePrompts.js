class VoicePromptManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.volume = localStorage.getItem('voiceVolume') || 1;
        this.isEnabled = localStorage.getItem('voicePromptsEnabled') !== 'false';
        this.language = localStorage.getItem('language') || 'en';
        
        // Expanded language-specific prompts
        this.prompts = {
            en: {
                exerciseComplete: "Exercise complete!",
                workoutComplete: "Congratulations! You've completed your workout!",
                restPeriod: (seconds) => `Rest period. ${seconds} seconds.`,
                startExercise: "Begin exercise",
                startReps: (reps) => `Start ${reps} repetitions`,
                getInstructions: (exercise) => {
                    if (exercise.type === 'reps') {
                        return `${exercise.name}. ${exercise.reps} repetitions. ${exercise.description}`;
                    } else {
                        return `${exercise.name}. ${exercise.duration} seconds. ${exercise.description}`;
                    }
                }
            },
            es: {
                exerciseComplete: "¡Ejercicio completado!",
                workoutComplete: "¡Felicitaciones! ¡Has completado tu entrenamiento!",
                restPeriod: (seconds) => `Período de descanso. ${seconds} segundos.`,
                startExercise: "Comienza el ejercicio",
                startReps: (reps) => `Comienza ${reps} repeticiones`,
                getInstructions: (exercise) => {
                    if (exercise.type === 'reps') {
                        return `${exercise.name}. ${exercise.reps} repeticiones. ${exercise.description}`;
                    } else {
                        return `${exercise.name}. ${exercise.duration} segundos. ${exercise.description}`;
                    }
                }
            },
            fr: {
                exerciseComplete: "Exercice terminé!",
                workoutComplete: "Félicitations! Vous avez terminé votre entraînement!",
                restPeriod: (seconds) => `Période de repos. ${seconds} secondes.`,
                startExercise: "Commencez l'exercice",
                startReps: (reps) => `Commencez ${reps} répétitions`,
                getInstructions: (exercise) => {
                    if (exercise.type === 'reps') {
                        return `${exercise.name}. ${exercise.reps} répétitions. ${exercise.description}`;
                    } else {
                        return `${exercise.name}. ${exercise.duration} secondes. ${exercise.description}`;
                    }
                }
            },
            de: {
                exerciseComplete: "Übung abgeschlossen!",
                workoutComplete: "Herzlichen Glückwunsch! Du hast dein Training beendet!",
                restPeriod: (seconds) => `Ruhezeit. ${seconds} Sekunden.`,
                startExercise: "Übung beginnen",
                startReps: (reps) => `Starte ${reps} Wiederholungen`,
                getInstructions: (exercise) => {
                    if (exercise.type === 'reps') {
                        return `${exercise.name}. ${exercise.reps} Wiederholungen. ${exercise.description}`;
                    } else {
                        return `${exercise.name}. ${exercise.duration} Sekunden. ${exercise.description}`;
                    }
                }
            },
            it: {
                exerciseComplete: "Esercizio completato!",
                workoutComplete: "Congratulazioni! Hai completato il tuo allenamento!",
                restPeriod: (seconds) => `Periodo di riposo. ${seconds} secondi.`,
                startExercise: "Inizia l'esercizio",
                startReps: (reps) => `Inizia ${reps} ripetizioni`,
                getInstructions: (exercise) => {
                    if (exercise.type === 'reps') {
                        return `${exercise.name}. ${exercise.reps} ripetizioni. ${exercise.description}`;
                    } else {
                        return `${exercise.name}. ${exercise.duration} secondi. ${exercise.description}`;
                    }
                }
            },
            pt: {
                exerciseComplete: "Exercício concluído!",
                workoutComplete: "Parabéns! Você completou seu treino!",
                restPeriod: (seconds) => `Período de descanso. ${seconds} segundos.`,
                startExercise: "Começar exercício",
                startReps: (reps) => `Começar ${reps} repetições`,
                getInstructions: (exercise) => {
                    if (exercise.type === 'reps') {
                        return `${exercise.name}. ${exercise.reps} repetições. ${exercise.description}`;
                    } else {
                        return `${exercise.name}. ${exercise.duration} segundos. ${exercise.description}`;
                    }
                }
            },
            ja: {
                exerciseComplete: "エクササイズ完了！",
                workoutComplete: "おめでとうございます！トレーニングが完了しました！",
                restPeriod: (seconds) => `休憩時間。${seconds}秒。`,
                startExercise: "エクササイズを開始",
                startReps: (reps) => `${reps}回開始`,
                getInstructions: (exercise) => {
                    if (exercise.type === 'reps') {
                        return `${exercise.name}。${exercise.reps}回。${exercise.description}`;
                    } else {
                        return `${exercise.name}。${exercise.duration}秒。${exercise.description}`;
                    }
                }
            },
            ko: {
                exerciseComplete: "운동 완료!",
                workoutComplete: "축하합니다! 운동을 완료했습니다!",
                restPeriod: (seconds) => `휴식 시간. ${seconds}초.`,
                startExercise: "운동 시작",
                startReps: (reps) => `${reps}회 시작`,
                getInstructions: (exercise) => {
                    if (exercise.type === 'reps') {
                        return `${exercise.name}. ${exercise.reps}회. ${exercise.description}`;
                    } else {
                        return `${exercise.name}. ${exercise.duration}초. ${exercise.description}`;
                    }
                }
            }
        };
        
        // Initialize voice
        this.initVoice();
    }

    initVoice() {
        // Wait for voices to be loaded
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = this.synth.getVoices();
            // Try to find a voice for the current language
            this.voice = voices.find(voice => voice.lang.startsWith(this.language)) || 
                        voices.find(voice => voice.lang.startsWith('en')) || 
                        voices[0];
        };
    }

    setLanguage(language) {
        this.language = language;
        localStorage.setItem('language', language);
        this.initVoice();
    }

    speak(text, priority = false) {
        if (!this.isEnabled) return;

        // Cancel previous non-priority speech
        if (priority) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.volume = this.volume;
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.lang = this.language;

        this.synth.speak(utterance);
    }

    setVolume(value) {
        this.volume = value;
        localStorage.setItem('voiceVolume', value);
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('voicePromptsEnabled', enabled);
        if (!enabled) {
            this.synth.cancel();
        }
    }

    getExerciseInstructions(exercise) {
        return this.prompts[this.language].getInstructions(exercise);
    }

    speakCountdown(number) {
        if (number <= 3) {
            this.speak(number.toString(), true);
        }
    }

    speakExerciseComplete() {
        this.speak(this.prompts[this.language].exerciseComplete, true);
    }

    speakRestPeriod(seconds) {
        this.speak(this.prompts[this.language].restPeriod(seconds), true);
    }

    speakWorkoutComplete() {
        this.speak(this.prompts[this.language].workoutComplete, true);
    }

    speakStartExercise() {
        this.speak(this.prompts[this.language].startExercise);
    }

    speakStartReps(reps) {
        this.speak(this.prompts[this.language].startReps(reps));
    }
}

// Initialize voice prompt manager
const voicePromptManager = new VoicePromptManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoicePromptManager;
} 