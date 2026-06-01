// Main Game - основной класс игры
class FishTycoonGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 1280;
        this.height = 720;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Аквариум
        this.aquariumX = 20;
        this.aquariumY = 60;
        this.aquariumWidth = 800;
        this.aquariumHeight = 500;
        this.gridSize = 50;
        
        // Состояние
        this.running = true;
        this.lastTime = Date.now();
        this.fps = 60;
        this.deltaTime = 0;
        
        // Ввод
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMousePressed = false;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        
        // Системы
        this.fishSystem = new FishSystem(this.aquariumWidth, this.aquariumHeight);
        this.uiManager = new UIManager(this.width, this.height);
        this.gameState = gameState;
        
        // Фон
        this.createBackground();
        
        // Обработчики событий
        this.setupEventListeners();
        
        // Начальные рыбы
        this.initializeStartingFishes();
        
        // Запуск игры
        this.startGame();
    }
    
    createBackground() {
        // Цвета фона
        this.bgColor1 = '#E0F6FF'; // основной цвет воды
        this.bgColor2 = '#B3E5FC'; // более темная полоса
    }
    
    initializeStartingFishes() {
        // Добавление стартовых рыб
        for (let i = 0; i < 3; i++) {
            this.fishSystem.addFishRandom('golden');
        }
        this.gameState.fishCount = 3;
    }
    
    setupEventListeners() {
        // Мышь
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Клавиатура
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Резюме аудиоконтекста
        document.addEventListener('click', () => audioManager.resumeAudioContext());
        
        // Запуск музыки
        audioManager.playBackgroundMusic();
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }
    
    handleMouseDown(e) {
        this.isMousePressed = true;
        this.mouseDownX = this.mouseX;
        this.mouseDownY = this.mouseY;
        
        // Проверка клика на кнопку
        this.uiManager.update(this.mouseX, this.mouseY, true);
        
        // Проверка клика на рыбу в аквариуме
        if (this.isInAquarium(this.mouseX, this.mouseY)) {
            const relX = this.mouseX - this.aquariumX;
            const relY = this.mouseY - this.aquariumY;
            this.fishSystem.selectFish(relX, relY);
        }
    }
    
    handleMouseUp(e) {
        this.isMousePressed = false;
        
        // Проверка клика на меню
        if (this.uiManager.menuOpen) {
            this.handleMenuClick(this.mouseX, this.mouseY);
        }
    }
    
    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'escape':
                if (this.uiManager.menuOpen) {
                    this.uiManager.closeMenu();
                }
                break;
            case 'r':
                this.resetGame();
                break;
            case 's':
                this.gameState.save();
                console.log('Игра сохранена');
                break;
        }
    }
    
    handleMenuClick(x, y) {
        if (this.uiManager.currentMenu === 'shop') {
            this.handleShopClick(x, y);
        } else if (this.uiManager.currentMenu === 'expand') {
            this.handleExpandClick(x, y);
        } else if (this.uiManager.currentMenu) {
            this.handleGenericMenuClick(x, y);
        }
    }
    
    handleShopClick(x, y) {
        // Проверка клика на кнопку покупки
        const windowWidth = 500;
        const windowX = (this.width - windowWidth) / 2;
        const closeButtonX = windowX + windowWidth - 80;
        const closeButtonY = (this.height - 600) / 2 + 600 - 40;
        
        if (x >= closeButtonX && x <= closeButtonX + 70 &&
            y >= closeButtonY && y <= closeButtonY + 30) {
            this.uiManager.closeMenu();
            return;
        }
        
        // Проверка клика на кнопки покупки
        const fishes = [
            'golden', 'neon', 'fighter', 'clownfish',
            'seahorse', 'stingray', 'lionfish', 'robofish'
        ];
        
        for (let i = 0; i < fishes.length; i++) {
            const buyX = windowX + 430;
            const buyY = (this.height - 600) / 2 + 60 + i * 35 - 12;
            
            if (x >= buyX && x <= buyX + 50 &&
                y >= buyY && y <= buyY + 24) {
                if (this.gameState.buyFish(fishes[i])) {
                    const fish = this.fishSystem.addFishRandom(fishes[i]);
                    this.gameState.fishCount++;
                    particleSystem.emitSparkles(fish.x + this.aquariumX, fish.y + this.aquariumY, 5);
                }
            }
        }
    }
    
    handleExpandClick(x, y) {
        const windowWidth = 400;
        const windowX = (this.width - windowWidth) / 2;
        const closeButtonX = windowX + windowWidth - 70;
        const closeButtonY = (this.height - 300) / 2 + 300 - 40;
        
        if (x >= closeButtonX && x <= closeButtonX + 60 &&
            y >= closeButtonY && y <= closeButtonY + 30) {
            this.uiManager.closeMenu();
            return;
        }
        
        // Кнопка расширения
        const expandX = windowX + 50;
        const expandY = (this.height - 300) / 2 + 170;
        
        if (x >= expandX && x <= expandX + (windowWidth - 100) &&
            y >= expandY && y <= expandY + 40) {
            if (this.gameState.expandAquarium()) {
                this.fishSystem.aquariumWidth += 100;
                this.fishSystem.aquariumHeight += 80;
                this.aquariumWidth += 100;
                this.aquariumHeight += 80;
                this.uiManager.closeMenu();
            }
        }
    }
    
    handleGenericMenuClick(x, y) {
        const windowHeight = 400;
        const windowX = (this.width - 450) / 2;
        const closeButtonX = windowX + 450 - 80;
        const closeButtonY = (this.height - windowHeight) / 2 + windowHeight - 40;
        
        if (x >= closeButtonX && x <= closeButtonX + 70 &&
            y >= closeButtonY && y <= closeButtonY + 30) {
            this.uiManager.closeMenu();
        }
    }
    
    isInAquarium(x, y) {
        return x >= this.aquariumX && x <= this.aquariumX + this.aquariumWidth &&
               y >= this.aquariumY && y <= this.aquariumY + this.aquariumHeight;
    }
    
    update(dt) {
        // Обновление состояния игры
        this.gameState.update(dt);
        
        // Обновление системы рыб
        this.fishSystem.update(dt);
        this.gameState.fishCount = this.fishSystem.fishes.length;
        
        // Обновление частиц
        particleSystem.update(dt);
        
        // Обновление UI
        this.uiManager.update(this.mouseX, this.mouseY, this.isMousePressed);
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Фон
        this.renderBackground();
        
        // Аквариум
        this.renderAquarium();
        
        // Рыбы
        this.ctx.save();
        this.ctx.translate(this.aquariumX, this.aquariumY);
        this.fishSystem.render(this.ctx);
        this.ctx.restore();
        
        // Пузырьки
        this.renderBubbles();
        
        // Частицы
        particleSystem.render(this.ctx);
        
        // UI
        this.uiManager.render(this.ctx, this.gameState);
        
        // FPS
        if (window.debug) {
            this.renderDebugInfo();
        }
    }
    
    renderBackground() {
        // Градиент воды
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#B3E5FC');
        gradient.addColorStop(0.5, '#81D4FA');
        gradient.addColorStop(1, '#4FC3F7');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    renderAquarium() {
        this.ctx.save();
        
        // Стекло аквариума
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 4;
        this.ctx.fillStyle = 'rgba(200, 230, 255, 0.1)';
        this.ctx.fillRect(this.aquariumX, this.aquariumY, this.aquariumWidth, this.aquariumHeight);
        this.ctx.strokeRect(this.aquariumX, this.aquariumY, this.aquariumWidth, this.aquariumHeight);
        
        // Дно аквариума
        this.ctx.fillStyle = '#D4A574';
        this.ctx.fillRect(
            this.aquariumX,
            this.aquariumY + this.aquariumHeight - 30,
            this.aquariumWidth,
            30
        );
        
        // Песок
        this.ctx.fillStyle = '#E8B4A8';
        for (let i = 0; i < 20; i++) {
            const x = this.aquariumX + Math.random() * this.aquariumWidth;
            const y = this.aquariumY + this.aquariumHeight - 30 + Math.random() * 25;
            this.ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 2 + 1);
        }
        
        // Водоросли
        this.renderSeaweed();
        
        this.ctx.restore();
    }
    
    renderSeaweed() {
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 5; i++) {
            const x = this.aquariumX + (i + 1) * this.aquariumWidth / 6;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.aquariumY + this.aquariumHeight - 30);
            
            for (let j = 0; j < 5; j++) {
                x += Math.sin(j * 0.5) * 10;
                this.ctx.lineTo(x, this.aquariumY + this.aquariumHeight - 30 - (j + 1) * 20);
            }
            this.ctx.stroke();
        }
    }
    
    renderBubbles() {
        this.ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
        this.ctx.strokeStyle = 'rgba(135, 206, 235, 0.5)';
        this.ctx.lineWidth = 1;
        
        const bubbleCount = 10;
        for (let i = 0; i < bubbleCount; i++) {
            const x = this.aquariumX + 50 + (i % 7) * 100;
            const y = this.aquariumY + 100 + ((this.gameState.gameTime * 30 + i * 50) % this.aquariumHeight);
            const radius = 3 + Math.sin(this.gameState.gameTime + i) * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    renderDebugInfo() {
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 15);
        this.ctx.fillText(`Рыб: ${this.fishSystem.fishes.length}`, 10, 30);
        this.ctx.fillText(`Частиц: ${particleSystem.particles.length}`, 10, 45);
    }
    
    resetGame() {
        if (confirm('Вы уверены? Это удалит все сохраненные данные.')) {
            this.gameState.reset();
            this.fishSystem.fishes = [];
            this.initializeStartingFishes();
            this.uiManager.closeMenu();
        }
    }
    
    startGame() {
        const gameLoop = () => {
            const now = Date.now();
            this.deltaTime = (now - this.lastTime) / 1000;
            this.lastTime = now;
            
            // Ограничение deltaTime
            if (this.deltaTime > 0.1) this.deltaTime = 0.1;
            
            this.update(this.deltaTime);
            this.render();
            
            requestAnimationFrame(gameLoop);
        };
        
        // Прелоадинг завершен, скрыть сообщение
        const loading = document.querySelector('#loading');
        if (loading) loading.style.display = 'none';
        
        gameLoop();
    }
}

// Запуск игры при загрузке
window.addEventListener('DOMContentLoaded', () => {
    const game = new FishTycoonGame();
    window.game = game;
    
    // Для отладки
    window.debug = false;
});