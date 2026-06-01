// Game State - управление состоянием игры
class GameState {
    constructor() {
        this.level = 1;
        this.experience = 0;
        this.experienceForNextLevel = 100;
        this.money = 500;
        this.totalMoney = 0;
        this.fishCount = 0;
        this.aquariumSize = 3;
        this.maxAquariumSize = 10;
        this.playTime = 0;
        this.gameTime = 0;
        this.expandCost = 1000;
        this.lastSaveTime = 0;
        this.achievements = [];
        this.fishInventory = {};
        this.load();
    }
    
    addMoney(amount) {
        this.money += amount;
        this.totalMoney += amount;
        audioManager.playSound('cha-ching', 0.5);
        particleSystem.emitMoneyFloating(
            Math.random() * 200 + 500,
            Math.random() * 200 + 100,
            amount
        );
    }
    
    removeMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            return true;
        }
        audioManager.playSound('error', 0.3);
        return false;
    }
    
    addExperience(amount) {
        this.experience += amount;
        particleSystem.emitXPFloating(
            Math.random() * 200 + 500,
            Math.random() * 200 + 100,
            amount
        );
        
        // Проверка повышения уровня
        while (this.experience >= this.experienceForNextLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.experience -= this.experienceForNextLevel;
        this.level++;
        this.experienceForNextLevel = Math.floor(this.experienceForNextLevel * 1.5);
        audioManager.playSound('levelup', 0.8);
        particleSystem.emitSparkles(640, 360, 20);
    }
    
    buyFish(type) {
        const fish = new Fish(type, 0, 0);
        if (fish.fishData.level > this.level) {
            return false; // Уровень недостаточный
        }
        if (!this.removeMoney(fish.fishData.price)) {
            return false; // Не хватает денег
        }
        
        this.addExperience(10);
        this.fishInventory[type] = (this.fishInventory[type] || 0) + 1;
        audioManager.playSound('coin', 0.3);
        return true;
    }
    
    sellFish(fish) {
        const sellPrice = fish.fishData.sellPrice;
        this.addMoney(sellPrice);
        this.addExperience(20);
        
        // Удаление из инвентаря
        if (this.fishInventory[fish.type]) {
            this.fishInventory[fish.type]--;
        }
    }
    
    expandAquarium() {
        if (this.aquariumSize >= this.maxAquariumSize) {
            return false;
        }
        
        if (!this.removeMoney(this.expandCost)) {
            return false;
        }
        
        this.aquariumSize++;
        this.expandCost = Math.floor(this.expandCost * 1.5);
        this.addExperience(50);
        audioManager.playSound('levelup', 0.5);
        return true;
    }
    
    update(dt) {
        this.gameTime += dt;
        this.playTime = Math.floor(this.gameTime);
        
        // Периодическое сохранение
        if (this.gameTime - this.lastSaveTime > 30) {
            this.save();
            this.lastSaveTime = this.gameTime;
        }
    }
    
    save() {
        const saveData = {
            level: this.level,
            experience: this.experience,
            experienceForNextLevel: this.experienceForNextLevel,
            money: this.money,
            totalMoney: this.totalMoney,
            aquariumSize: this.aquariumSize,
            expandCost: this.expandCost,
            achievements: this.achievements,
            fishInventory: this.fishInventory
        };
        localStorage.setItem('fishTycoonSave', JSON.stringify(saveData));
    }
    
    load() {
        const saveData = localStorage.getItem('fishTycoonSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.level = data.level || 1;
            this.experience = data.experience || 0;
            this.experienceForNextLevel = data.experienceForNextLevel || 100;
            this.money = data.money || 500;
            this.totalMoney = data.totalMoney || 0;
            this.aquariumSize = data.aquariumSize || 3;
            this.expandCost = data.expandCost || 1000;
            this.achievements = data.achievements || [];
            this.fishInventory = data.fishInventory || {};
        }
    }
    
    reset() {
        this.level = 1;
        this.experience = 0;
        this.experienceForNextLevel = 100;
        this.money = 500;
        this.totalMoney = 0;
        this.aquariumSize = 3;
        this.expandCost = 1000;
        this.achievements = [];
        this.fishInventory = {};
        localStorage.removeItem('fishTycoonSave');
    }
}

const gameState = new GameState();