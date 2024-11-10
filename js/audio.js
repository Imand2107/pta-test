class AudioManager {
    constructor() {
        this.sounds = {
            countdown: new Audio('sounds/countdown.mp3'),
            start: new Audio('sounds/start.mp3'),
            complete: new Audio('sounds/complete.mp3'),
            rest: new Audio('sounds/rest.mp3'),
            tick: new Audio('sounds/tick.mp3')
        };

        this.music = {
            workout1: new Audio('music/energetic-workout.mp3'),
            workout2: new Audio('music/intense-workout.mp3'),
            workout3: new Audio('music/chill-workout.mp3'),
            rest: new Audio('music/calm-rest.mp3')
        };

        // Set music tracks to loop
        Object.values(this.music).forEach(track => {
            track.loop = true;
        });

        // Preload all audio
        Object.values(this.sounds).forEach(sound => sound.load());
        Object.values(this.music).forEach(track => track.load());

        this.currentMusic = null;
        this.volume = localStorage.getItem('musicVolume') || 0.5;
        this.setVolume(this.volume);
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }

    playMusic(trackName) {
        // Stop current music if playing
        this.stopMusic();

        if (this.music[trackName]) {
            this.currentMusic = this.music[trackName];
            this.currentMusic.play();
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
    }

    stopSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].pause();
            this.sounds[soundName].currentTime = 0;
        }
    }

    stopAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }

    setVolume(value) {
        this.volume = value;
        Object.values(this.sounds).forEach(sound => {
            sound.volume = value;
        });
        Object.values(this.music).forEach(track => {
            track.volume = value;
        });
        localStorage.setItem('musicVolume', value);
    }

    toggleMute() {
        const newVolume = this.volume > 0 ? 0 : localStorage.getItem('musicVolume') || 0.5;
        this.setVolume(newVolume);
        return newVolume > 0;
    }
}

// Initialize audio manager
const audioManager = new AudioManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} 