// Extended Features - расширенные возможности
class AchievementSystem {
    constructor() {
        this.achievements = {
            'first_sell': {
                id: 'first_sell',
                name: '[MEDAL] Первая продажа',
                description: 'Продайте свою первую рыбу',
                unlocked: false,
                reward: 50
            },
            'millionaire': {
                id: 'millionaire',
                name: '[MONEY] Миллионер',
                description: 'Заработайте 1,000,000 монет',
                unlocked: false,
                reward: 500
            },
            'collector': {
                id: 'collector',
                name: '[ALL] Коллекционер',
                description: 'Откройте все виды рыб',
                unlocked: false,
                reward: 300
            },
            'level_50': {
                id: 'level_50',
                name: '[STAR] Легенда',
                description: 'Основные 50 уровней',
                unlocked: false,
                reward: 1000
            },
            'breeder': {
                id: 'breeder',
                name: '[FISH] Население',
                description: 'Овладеть 100 рыбами',
                unlocked: false,
                reward: 250
            }
        };
    }
    
    checkAchievements(gameState) {
        if (gameState.totalMoney >= 1000000) {
            this.unlockAchievement('millionaire');
        }
        
        if (gameState.level >= 50) {
            this.unlockAchievement('level_50');
        }
        
        if (gameState.fishCount >= 100) {
            this.unlockAchievement('breeder');
        }
    }
    
    unlockAchievement(id) {
        if (this.achievements[id] && !this.achievements[id].unlocked) {
            this.achievements[id].unlocked = true;
            audioManager.playSound('levelup', 0.8);
            console.log(`[UNLOCK] Достижение разблокировано: ${this.achievements[id].name}`);
        }
    }
    
    getUnlockedCount() {
        return Object.values(this.achievements).filter(a => a.unlocked).length;
    }
}

class GameSettings {
    constructor() {
        this.volume = 0.7;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.brightness = 1;
        this.particlesEnabled = true;
        this.load();
    }
    
    save() {
        const settings = {
            volume: this.volume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            brightness: this.brightness,
            particlesEnabled: this.particlesEnabled
        };
        localStorage.setItem('fishTycoonSettings', JSON.stringify(settings));
    }
    
    load() {
        const settings = localStorage.getItem('fishTycoonSettings');
        if (settings) {
            const data = JSON.parse(settings);
            this.volume = data.volume || 0.7;
            this.musicVolume = data.musicVolume || 0.5;
            this.sfxVolume = data.sfxVolume || 0.7;
            this.brightness = data.brightness || 1;
            this.particlesEnabled = data.particlesEnabled !== false;
        }
    }
}

class EventSystem {
    constructor() {
        this.events = {};
    }
    
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
    
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }
    
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }
}

class NotificationSystem {
    constructor(gameWidth, gameHeight) {
        this.notifications = [];
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
    }
    
    show(message, type = 'info', duration = 3) {
        this.notifications.push({
            message,
            type,
            duration,
            life: duration,
            opacity: 1
        });
    }
    
    update(dt) {
        this.notifications = this.notifications.filter(n => {
            n.life -= dt;
            n.opacity = Math.max(0, n.life / n.duration);
            return n.life > 0;
        });
    }
    
    render(ctx) {
        for (let i = 0; i < this.notifications.length; i++) {
            const notif = this.notifications[i];
            const y = 80 + i * 50;
            
            ctx.save();
            ctx.globalAlpha = notif.opacity;
            
            let color = '#3498DB';
            if (notif.type === 'success') color = '#2ECC71';
            if (notif.type === 'warning') color = '#F39C12';
            if (notif.type === 'error') color = '#E74C3C';
            
            ctx.fillStyle = color;
            ctx.fillRect(this.gameWidth - 300, y, 280, 40);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(notif.message, this.gameWidth - 290, y + 20);
            
            ctx.restore();
        }
    }
}

class AnimationHelper {
    static ease(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    static easeIn(t) {
        return t * t;
    }
    
    static easeOut(t) {
        return t * (2 - t);
    }
    
    static bounce(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (1 - t) * (1 - t) * (1 - t) * (1 - t);
    }
    
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
}

class WeatherSystem {
    constructor() {
        this.currentWeather = 'sunny';
        this.weatherDuration = 10;
        this.weatherTimer = 0;
        this.weatherEffects = {
            'sunny': { color: 'rgba(255, 255, 200, 0.1)', speed: 1 },
            'cloudy': { color: 'rgba(150, 150, 150, 0.2)', speed: 0.7 },
            'rainy': { color: 'rgba(100, 100, 150, 0.3)', speed: 1.5 }
        };
    }
    
    update(dt) {
        this.weatherTimer += dt;
        if (this.weatherTimer > this.weatherDuration) {
            this.changeWeather();
            this.weatherTimer = 0;
        }
    }
    
    changeWeather() {
        const weathers = Object.keys(this.weatherEffects);
        this.currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
    }
    
    getEffect() {
        return this.weatherEffects[this.currentWeather];
    }
}

const achievementSystem = new AchievementSystem();
const gameSettings = new GameSettings();
const eventSystem = new EventSystem();
const notificationSystem = new NotificationSystem(1280, 720);
const weatherSystem = new WeatherSystem();