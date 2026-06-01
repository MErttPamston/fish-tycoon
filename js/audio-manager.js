// Audio Manager - управление звуками и музыкой
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.sounds = {};
        this.musicPlaying = false;
        this.initialized = false;
        this.init();
    }
    
    init() {
        // Инициализация Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
        this.initialized = true;
    }
    
    // Создание синтезированного звука
    playSound(type, duration = 0.3, frequency = 440) {
        if (!this.initialized || this.audioContext.state === 'suspended') return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        switch(type) {
            case 'coin':
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + duration);
                break;
            case 'cha-ching':
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(800, now + duration * 0.5);
                osc.frequency.setValueAtTime(1000, now + duration);
                break;
            case 'sparkle':
                osc.type = 'square';
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + duration);
                break;
            case 'tap':
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + duration * 0.5);
                gain.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.5);
                break;
            case 'levelup':
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + duration * 0.3);
                osc.frequency.setValueAtTime(784, now + duration * 0.6);
                osc.frequency.setValueAtTime(1047, now + duration);
                break;
            case 'error':
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + duration);
                break;
            case 'heal':
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(1000, now + duration * 0.5);
                osc.frequency.setValueAtTime(800, now + duration);
                break;
        }
        
        osc.start(now);
        osc.stop(now + duration);
    }
    
    // Воспроизведение фоновой музыки
    playBackgroundMusic() {
        if (this.musicPlaying) return;
        this.musicPlaying = true;
        this.createLoFiMusic();
    }
    
    // Создание Lo-Fi музыки
    createLoFiMusic() {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        
        // Простая мелодия в Lo-Fi стиле
        const notes = [523, 587, 659, 523]; // C, D, E, C (простой паттерн)
        const duration = 0.5;
        const delay = 2;
        
        const playNote = (freq, time) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            filter.type = 'lowpass';
            filter.frequency.value = 1200;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            gain.gain.setValueAtTime(0.1 * this.musicVolume * this.masterVolume, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
            
            osc.frequency.value = freq;
            osc.start(time);
            osc.stop(time + duration);
        };
        
        // Воспроизведение мелодии в цикле
        let currentTime = now;
        const loopDuration = 8;
        
        const loop = () => {
            for (let i = 0; i < notes.length; i++) {
                playNote(notes[i], currentTime + i * 0.5);
            }
            currentTime += loopDuration;
            setTimeout(loop, loopDuration * 1000);
        };
        
        loop();
    }
    
    // Остановка музыки
    stopMusic() {
        this.musicPlaying = false;
    }
    
    // Установка громкости
    setVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
    }
    
    // Резюме аудиоконтекста при взаимодействии
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Создание глобального экземпляра
const audioManager = new AudioManager();