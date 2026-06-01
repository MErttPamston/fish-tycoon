// Fish System - система рыб
class Fish {
    constructor(type, x, y, gridSize = 50) {
        this.type = type; // тип рыбы
        this.x = x; // позиция X
        this.y = y; // позиция Y
        this.gridSize = gridSize;
        this.health = 100; // здоровье
        this.maxHealth = 100;
        this.hunger = 100; // сытость
        this.maxHunger = 100;
        this.age = 0; // возраст
        this.breedCooldown = 0; // время до размножения
        this.speed = Math.random() * 40 + 30; // скорость плавания
        this.direction = Math.random() > 0.5 ? 1 : -1; // направление
        this.vx = this.direction * this.speed;
        this.vy = (Math.random() - 0.5) * 20;
        this.rotation = 0;
        this.isSelected = false;
        this.isSick = false;
        this.sickTime = 0;
        this.fishData = this.getFishData(type);
        this.animationFrame = 0;
        this.animationCounter = 0;
    }
    
    getFishData(type) {
        const fishTypes = {
            'golden': {
                name: 'Золотая рыбка',
                color: '#FFD700',
                price: 100,
                sellPrice: 150,
                breedTime: 30,
                hungerRate: 0.8,
                size: 25,
                level: 1
            },
            'neon': {
                name: 'Неоновая рыба',
                color: '#00FFFF',
                glowColor: '#0080FF',
                price: 250,
                sellPrice: 400,
                breedTime: 25,
                hungerRate: 0.6,
                size: 30,
                level: 5
            },
            'fighter': {
                name: 'Бойцовая рыба',
                color: '#FF0000',
                price: 500,
                sellPrice: 800,
                breedTime: 20,
                hungerRate: 0.7,
                size: 35,
                level: 10
            },
            'clownfish': {
                name: 'Рыба-клоун',
                color: '#FF6347',
                stripeColor: '#FFFFFF',
                price: 150,
                sellPrice: 250,
                breedTime: 28,
                hungerRate: 0.75,
                size: 22,
                level: 3
            },
            'seahorse': {
                name: 'Морской конёк',
                color: '#FFB6C1',
                price: 1000,
                sellPrice: 1500,
                breedTime: 40,
                hungerRate: 0.5,
                size: 20,
                level: 15
            },
            'stingray': {
                name: 'Скат',
                color: '#9370DB',
                price: 800,
                sellPrice: 1200,
                breedTime: 35,
                hungerRate: 0.65,
                size: 40,
                level: 20
            },
            'lionfish': {
                name: 'Рыба-лев',
                color: '#FFD700',
                spineColor: '#FF4500',
                price: 5000,
                sellPrice: 9000,
                breedTime: 15,
                hungerRate: 0.9,
                size: 45,
                level: 30
            },
            'robofish': {
                name: 'Робо-рыба',
                color: '#C0C0C0',
                circuitColor: '#00FF00',
                price: 10000,
                sellPrice: 15000,
                breedTime: 10,
                hungerRate: 0.3,
                size: 38,
                level: 50
            }
        };
        return fishTypes[type] || fishTypes['golden'];
    }
    
    update(dt, aquariumWidth, aquariumHeight) {
        // Увеличение возраста
        this.age += dt;
        
        // Голод и здоровье
        this.hunger -= this.fishData.hungerRate * dt;
        if (this.hunger < 0) this.hunger = 0;
        
        if (this.hunger < 20) {
            this.health -= 5 * dt;
        } else {
            this.health = Math.min(this.maxHealth, this.health + 10 * dt);
        }
        
        // Болезнь
        if (this.isSick) {
            this.sickTime -= dt;
            if (this.sickTime <= 0) {
                this.isSick = false;
                audioManager.playSound('heal', 0.5);
                particleSystem.emitHealing(this.x, this.y);
            }
            this.health -= 15 * dt;
        }
        
        // Смерть
        if (this.health <= 0) {
            return false; // рыба мертва
        }
        
        // Размножение
        if (this.breedCooldown > 0) {
            this.breedCooldown -= dt;
        }
        
        // Движение
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Отражение от границ
        if (this.x - this.fishData.size < 0 || this.x + this.fishData.size > aquariumWidth) {
            this.vx = -this.vx;
            this.direction = -this.direction;
        }
        if (this.y - this.fishData.size < 0 || this.y + this.fishData.size > aquariumHeight) {
            this.vy = -this.vy;
        }
        
        // Зацикливание координат
        this.x = Math.max(this.fishData.size, Math.min(aquariumWidth - this.fishData.size, this.x));
        this.y = Math.max(this.fishData.size, Math.min(aquariumHeight - this.fishData.size, this.y));
        
        // Небольшое изменение Y для вертикального движения
        if (Math.random() < 0.02) {
            this.vy = (Math.random() - 0.5) * 30;
        }
        
        // Анимация
        this.animationCounter += dt;
        if (this.animationCounter > 0.2) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationCounter = 0;
        }
        
        return true; // рыба жива
    }
    
    feed(amount = 30) {
        this.hunger = Math.min(this.maxHunger, this.hunger + amount);
    }
    
    heal(amount = 50) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.isSick = false;
    }
    
    makeSick() {
        if (!this.isSick) {
            this.isSick = true;
            this.sickTime = 10 + Math.random() * 10;
        }
    }
    
    canBreed() {
        return this.breedCooldown <= 0 && this.hunger > 50 && this.health > 50;
    }
    
    breed() {
        if (this.canBreed()) {
            this.breedCooldown = this.fishData.breedTime;
            this.hunger -= 30;
            return true;
        }
        return false;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Отражение относительно направления
        if (this.direction === -1) {
            ctx.scale(-1, 1);
        }
        
        // Поворот
        ctx.rotate(this.vy * 0.02);
        
        // Полупрозрачность при болезни
        if (this.isSick) {
            ctx.globalAlpha = 0.6;
        }
        
        const size = this.fishData.size;
        
        // Отрисовка в зависимости от типа
        switch(this.type) {
            case 'golden':
                this.drawGoldenFish(ctx, size);
                break;
            case 'neon':
                this.drawNeonFish(ctx, size);
                break;
            case 'fighter':
                this.drawFighterFish(ctx, size);
                break;
            case 'clownfish':
                this.drawClownfish(ctx, size);
                break;
            case 'seahorse':
                this.drawSeahorse(ctx, size);
                break;
            case 'stingray':
                this.drawStingray(ctx, size);
                break;
            case 'lionfish':
                this.drawLionfish(ctx, size);
                break;
            case 'robofish':
                this.drawRobofish(ctx, size);
                break;
        }
        
        // Полоса здоровья если выбрана
        if (this.isSelected) {
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.strokeRect(-size - 5, -size - 15, (size + 5) * 2, 3);
            ctx.fillRect(-size - 5, -size - 15, ((size + 5) * 2) * (this.health / this.maxHealth), 3);
        }
        
        // Облако болезни
        if (this.isSick) {
            ctx.fillStyle = '#808080';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(-size * 0.5, -size - 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, -size - 15, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(size * 0.5, -size - 10, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawGoldenFish(ctx, size) {
        // Тело
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.beginPath();
        ctx.arc(-size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Хвост
        ctx.beginPath();
        ctx.moveTo(size * 0.5, 0);
        ctx.lineTo(size * 1.2, -size * 0.4);
        ctx.lineTo(size * 1.2, size * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Глаз
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-size * 0.6, -size * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Плавник
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(0, size * 0.6);
        ctx.lineTo(size * 0.3, size * 1.2);
        ctx.lineTo(size * 0.1, size * 0.8);
        ctx.closePath();
        ctx.fill();
    }
    
    drawNeonFish(ctx, size) {
        // Свечение
        ctx.shadowColor = this.fishData.glowColor;
        ctx.shadowBlur = 15;
        
        // Тело
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.9, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.beginPath();
        ctx.arc(-size * 0.5, 0, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
        
        // Полоска
        ctx.strokeStyle = this.fishData.glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.3);
        ctx.lineTo(size * 0.3, -size * 0.3);
        ctx.stroke();
        
        // Хвост
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.moveTo(size * 0.5, 0);
        ctx.lineTo(size * 1.1, -size * 0.35);
        ctx.lineTo(size * 1.1, size * 0.35);
        ctx.closePath();
        ctx.fill();
        
        // Глаз
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-size * 0.6, -size * 0.15, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-size * 0.6, -size * 0.15, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawFighterFish(ctx, size) {
        // Тело
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.1, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Голова
        ctx.beginPath();
        ctx.arc(-size * 0.6, 0, size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        
        // Большой хвост
        ctx.beginPath();
        ctx.moveTo(size * 0.6, 0);
        ctx.lineTo(size * 1.5, -size * 0.5);
        ctx.lineTo(size * 1.5, size * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // Плавник на спине
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.6);
        ctx.lineTo(size * 0.2, -size * 1.1);
        ctx.lineTo(size * 0.4, -size * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Глаз
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(-size * 0.7, -size * 0.2, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawClownfish(ctx, size) {
        // Тело
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.85, size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Белые полоски
        ctx.strokeStyle = this.fishData.stripeColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-size * 0.2, 0, size * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Голова
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.arc(-size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Хвост
        ctx.beginPath();
        ctx.moveTo(size * 0.5, 0);
        ctx.lineTo(size * 1.1, -size * 0.35);
        ctx.lineTo(size * 1.1, size * 0.35);
        ctx.closePath();
        ctx.fill();
        
        // Глаз
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-size * 0.6, -size * 0.15, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSeahorse(ctx, size) {
        ctx.strokeStyle = this.fishData.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Голова и тело
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, -size * 0.8);
        ctx.quadraticCurveTo(0, -size * 0.3, 0, size * 0.3);
        ctx.stroke();
        
        // Рыло
        ctx.beginPath();
        ctx.moveTo(-size * 0.1, -size * 0.9);
        ctx.lineTo(-size * 0.4, -size * 0.95);
        ctx.stroke();
        
        // Спинной плавник
        ctx.fillStyle = this.fishData.color;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(-size * 0.15 + i * size * 0.1, -size * 0.5);
            ctx.lineTo(-size * 0.1 + i * size * 0.1, -size * 0.9);
            ctx.lineTo(-size * 0.05 + i * size * 0.1, -size * 0.5);
            ctx.closePath();
            ctx.fill();
        }
        
        // Хвост (закрученный)
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        ctx.quadraticCurveTo(size * 0.2, size * 0.5, size * 0.1, size * 0.7);
        ctx.stroke();
        
        // Глаз
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-size * 0.15, -size * 0.8, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawStingray(ctx, size) {
        // Тело (ромб)
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.8);
        ctx.lineTo(size * 0.9, 0);
        ctx.lineTo(0, size * 0.8);
        ctx.lineTo(-size * 0.9, 0);
        ctx.closePath();
        ctx.fill();
        
        // Хвост
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.fishData.color;
        ctx.beginPath();
        ctx.moveTo(0, size * 0.8);
        ctx.quadraticCurveTo(size * 0.3, size * 1.2, size * 0.1, size * 1.5);
        ctx.stroke();
        
        // Глаз
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(size * 0.3, -size * 0.3, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(size * 0.3, -size * 0.3, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawLionfish(ctx, size) {
        // Тело
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.95, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Шипы
        ctx.strokeStyle = this.fishData.spineColor;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI - Math.PI * 0.5;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * size * 0.7, Math.sin(angle) * size * 0.7 + Math.sin(this.animationFrame * 0.5) * 3);
            ctx.lineTo(Math.cos(angle) * size * 1.3, Math.sin(angle) * size * 1.3);
            ctx.stroke();
        }
        
        // Голова
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.arc(-size * 0.5, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Хвост
        ctx.beginPath();
        ctx.moveTo(size * 0.5, 0);
        ctx.lineTo(size * 1.1, -size * 0.35);
        ctx.lineTo(size * 1.1, size * 0.35);
        ctx.closePath();
        ctx.fill();
        
        // Глаз
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-size * 0.6, -size * 0.15, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawRobofish(ctx, size) {
        // Тело (квадратное)
        ctx.fillStyle = this.fishData.color;
        ctx.fillRect(-size * 0.8, -size * 0.5, size * 1.6, size);
        
        // Схема
        ctx.strokeStyle = this.fishData.circuitColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.rect(-size * 0.5, -size * 0.3, size, size * 0.6);
        ctx.stroke();
        
        // Светящиеся точки
        ctx.fillStyle = this.fishData.circuitColor;
        ctx.globalAlpha = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(-size * 0.3 + i * size * 0.3, 0, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Хвост (острый)
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.fishData.color;
        ctx.beginPath();
        ctx.moveTo(size * 0.8, 0);
        ctx.lineTo(size * 1.3, -size * 0.4);
        ctx.lineTo(size * 1.3, size * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Глаза
        ctx.fillStyle = this.fishData.circuitColor;
        ctx.beginPath();
        ctx.arc(-size * 0.5, -size * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-size * 0.5, size * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class FishSystem {
    constructor(aquariumWidth, aquariumHeight) {
        this.fishes = [];
        this.aquariumWidth = aquariumWidth;
        this.aquariumHeight = aquariumHeight;
        this.selectedFish = null;
    }
    
    addFish(type, x, y) {
        const fish = new Fish(type, x, y);
        this.fishes.push(fish);
        return fish;
    }
    
    addFishRandom(type) {
        const x = Math.random() * (this.aquariumWidth - 100) + 50;
        const y = Math.random() * (this.aquariumHeight - 100) + 50;
        return this.addFish(type, x, y);
    }
    
    selectFish(x, y) {
        if (this.selectedFish) {
            this.selectedFish.isSelected = false;
        }
        
        for (let i = this.fishes.length - 1; i >= 0; i--) {
            const fish = this.fishes[i];
            const dist = Math.hypot(fish.x - x, fish.y - y);
            if (dist < fish.fishData.size + 10) {
                fish.isSelected = true;
                this.selectedFish = fish;
                return fish;
            }
        }
        
        this.selectedFish = null;
        return null;
    }
    
    update(dt) {
        // Обновление рыб
        this.fishes = this.fishes.filter(fish => {
            return fish.update(dt, this.aquariumWidth, this.aquariumHeight);
        });
        
        // Размножение
        const breedingFishes = this.fishes.filter(f => f.canBreed());
        if (breedingFishes.length >= 2) {
            const fish1 = breedingFishes[Math.floor(Math.random() * breedingFishes.length)];
            const fish2 = breedingFishes[Math.floor(Math.random() * breedingFishes.length)];
            
            if (fish1 !== fish2 && fish1.type === fish2.type) {
                fish1.breed();
                fish2.breed();
                
                // Создание новой рыбы
                const newX = (fish1.x + fish2.x) / 2 + (Math.random() - 0.5) * 20;
                const newY = (fish1.y + fish2.y) / 2 + (Math.random() - 0.5) * 20;
                this.addFish(fish1.type, newX, newY);
                
                audioManager.playSound('sparkle', 0.4);
                particleSystem.emitSparkles(newX, newY, 10);
            }
        }
        
        // Случайная болезнь
        if (Math.random() < 0.001 && this.fishes.length > 0) {
            const randomFish = this.fishes[Math.floor(Math.random() * this.fishes.length)];
            randomFish.makeSick();
            audioManager.playSound('error', 0.3);
        }
    }
    
    render(ctx) {
        for (const fish of this.fishes) {
            fish.render(ctx);
        }
    }
    
    feedAll(amount) {
        for (const fish of this.fishes) {
            fish.feed(amount);
        }
    }
    
    healFish(fish, amount) {
        if (fish) {
            fish.heal(amount);
        }
    }
    
    getInfo(fish) {
        if (!fish) return null;
        return {
            name: fish.fishData.name,
            health: Math.floor(fish.health),
            hunger: Math.floor(fish.hunger),
            age: Math.floor(fish.age),
            isSick: fish.isSick,
            canBreed: fish.canBreed()
        };
    }
}

const fishSystem = new FishSystem(800, 500);