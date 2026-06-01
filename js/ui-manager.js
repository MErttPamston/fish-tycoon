// UI Manager - управление пользовательским интерфейсом
class UIButton {
    constructor(x, y, width, height, text, callback, style = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.callback = callback;
        this.isHovered = false;
        this.isPressed = false;
        this.style = {
            bgColor: '#4A90E2',
            hoverColor: '#357ABD',
            textColor: '#FFFFFF',
            borderRadius: 8,
            ...style
        };
    }
    
    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    update(mouseX, mouseY, isPressed) {
        this.isHovered = this.contains(mouseX, mouseY);
        if (this.isHovered && isPressed) {
            this.isPressed = true;
            this.callback();
        } else {
            this.isPressed = false;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Фон
        ctx.fillStyle = this.isHovered ? this.style.hoverColor : this.style.bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Граница
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Текст
        ctx.fillStyle = this.style.textColor;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
        
        ctx.restore();
    }
}

class UIPanel {
    constructor(x, y, width, height, title = '') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.title = title;
        this.backgroundColor = '#F0F4F8';
        this.borderColor = '#2C3E50';
    }
    
    render(ctx) {
        ctx.save();
        
        // Фон
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Граница
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Заголовок
        if (this.title) {
            ctx.fillStyle = this.borderColor;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(this.title, this.x + 10, this.y + 8);
        }
        
        ctx.restore();
    }
}

class UIManager {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.buttons = [];
        this.panels = [];
        this.menuOpen = false;
        this.currentMenu = null;
        this.setupUI();
    }
    
    setupUI() {
        // Основные кнопки (нижняя часть экрана)
        const buttonHeight = 35;
        const buttonWidth = 120;
        const startY = this.gameHeight - 45;
        const spacing = 10;
        let currentX = 20;
        
        // Кнопка Магазин
        this.buttons.push(new UIButton(
            currentX, startY, buttonWidth, buttonHeight,
            '🛒 Магазин',
            () => this.openShopMenu()
        ));
        currentX += buttonWidth + spacing;
        
        // Кнопка Статистика
        this.buttons.push(new UIButton(
            currentX, startY, buttonWidth, buttonHeight,
            '📊 Статистика',
            () => this.openStatsMenu()
        ));
        currentX += buttonWidth + spacing;
        
        // Кнопка Расширить
        this.buttons.push(new UIButton(
            currentX, startY, buttonWidth, buttonHeight,
            '🏠 Расширить',
            () => this.openExpandMenu()
        ));
        currentX += buttonWidth + spacing;
        
        // Кнопка Кормить
        this.buttons.push(new UIButton(
            currentX, startY, buttonWidth, buttonHeight,
            '🍖 Кормить',
            () => this.feedFishes()
        ));
        currentX += buttonWidth + spacing;
        
        // Кнопка Лечить
        this.buttons.push(new UIButton(
            currentX, startY, buttonWidth, buttonHeight,
            '💊 Лечить',
            () => this.healSelectedFish()
        ));
    }
    
    openShopMenu() {
        this.menuOpen = true;
        this.currentMenu = 'shop';
        audioManager.playSound('tap', 0.3);
    }
    
    openStatsMenu() {
        this.menuOpen = true;
        this.currentMenu = 'stats';
        audioManager.playSound('tap', 0.3);
    }
    
    openExpandMenu() {
        this.menuOpen = true;
        this.currentMenu = 'expand';
        audioManager.playSound('tap', 0.3);
    }
    
    feedFishes() {
        audioManager.playSound('coin', 0.3);
        return 'feed';
    }
    
    healSelectedFish() {
        audioManager.playSound('heal', 0.5);
        return 'heal';
    }
    
    closeMenu() {
        this.menuOpen = false;
        this.currentMenu = null;
        audioManager.playSound('tap', 0.3);
    }
    
    update(mouseX, mouseY, isPressed) {
        for (const button of this.buttons) {
            button.update(mouseX, mouseY, isPressed);
        }
    }
    
    render(ctx, gameState) {
        // Верхняя панель с информацией
        this.renderTopPanel(ctx, gameState);
        
        // Кнопки внизу
        for (const button of this.buttons) {
            button.render(ctx);
        }
        
        // Меню
        if (this.menuOpen && this.currentMenu) {
            this.renderMenu(ctx, gameState);
        }
    }
    
    renderTopPanel(ctx, gameState) {
        ctx.save();
        
        // Фон панели
        ctx.fillStyle = 'rgba(44, 62, 80, 0.9)';
        ctx.fillRect(0, 0, this.gameWidth, 50);
        
        // Текст
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Название игры и уровень
        ctx.fillText(`🐠 FISH TYCOON | ЛВЛ ${gameState.level}`, 20, 25);
        
        // Деньги
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`💰 ${gameState.money}`, this.gameWidth - 250, 25);
        
        // Опыт
        ctx.fillText(`XP: ${gameState.experience}/${gameState.experienceForNextLevel}`, this.gameWidth - 500, 25);
        
        // Кол-во рыб
        ctx.fillText(`🐟 ${gameState.fishCount}`, this.gameWidth - 100, 25);
        
        // Полоса опыта
        const expBarWidth = 150;
        const expPercent = gameState.experience / gameState.experienceForNextLevel;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.gameWidth - 500, 35, expBarWidth, 8);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.gameWidth - 500, 35, expBarWidth * expPercent, 8);
        
        ctx.restore();
    }
    
    renderMenu(ctx, gameState) {
        ctx.save();
        
        // Полупрозрачный фон
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        if (this.currentMenu === 'shop') {
            this.renderShopMenu(ctx, gameState);
        } else if (this.currentMenu === 'stats') {
            this.renderStatsMenu(ctx, gameState);
        } else if (this.currentMenu === 'expand') {
            this.renderExpandMenu(ctx, gameState);
        }
        
        ctx.restore();
    }
    
    renderShopMenu(ctx, gameState) {
        const windowWidth = 500;
        const windowHeight = 600;
        const x = (this.gameWidth - windowWidth) / 2;
        const y = (this.gameHeight - windowHeight) / 2;
        
        // Окно
        ctx.fillStyle = '#F0F4F8';
        ctx.fillRect(x, y, windowWidth, windowHeight);
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, windowWidth, windowHeight);
        
        // Заголовок
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🛒 МАГАЗИН', this.gameWidth / 2, y + 30);
        
        // Виды рыб
        const fishes = [
            { type: 'golden', emoji: '🟡' },
            { type: 'neon', emoji: '🔷' },
            { type: 'fighter', emoji: '🔴' },
            { type: 'clownfish', emoji: '🟠' },
            { type: 'seahorse', emoji: '🩷' },
            { type: 'stingray', emoji: '🟣' },
            { type: 'lionfish', emoji: '⭐' },
            { type: 'robofish', emoji: '🤖' }
        ];
        
        let itemY = y + 60;
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        for (let i = 0; i < fishes.length; i++) {
            const fishType = fishes[i];
            const fish = new Fish(fishType.type, 0, 0);
            const canBuy = gameState.money >= fish.fishData.price && gameState.level >= fish.fishData.level;
            
            ctx.fillStyle = canBuy ? '#333' : '#999';
            ctx.fillText(`${fishType.emoji} ${fish.fishData.name}`, x + 20, itemY);
            ctx.fillText(`LVL ${fish.fishData.level}`, x + 280, itemY);
            ctx.fillText(`${fish.fishData.price} 💰`, x + 350, itemY);
            
            // Кнопка покупки
            const buyX = x + 430;
            const buyY = itemY - 12;
            ctx.fillStyle = canBuy ? '#4A90E2' : '#CCC';
            ctx.fillRect(buyX, buyY, 50, 24);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Купить', buyX + 25, buyY + 12);
            
            itemY += 35;
        }
        
        // Кнопка закрытия
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(x + windowWidth - 80, y + windowHeight - 40, 70, 30);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Закрыть', x + windowWidth - 45, y + windowHeight - 25);
    }
    
    renderStatsMenu(ctx, gameState) {
        const windowWidth = 450;
        const windowHeight = 400;
        const x = (this.gameWidth - windowWidth) / 2;
        const y = (this.gameHeight - windowHeight) / 2;
        
        // Окно
        ctx.fillStyle = '#F0F4F8';
        ctx.fillRect(x, y, windowWidth, windowHeight);
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, windowWidth, windowHeight);
        
        // Заголовок
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📊 СТАТИСТИКА', this.gameWidth / 2, y + 30);
        
        // Информация
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        let infoY = y + 70;
        
        const stats = [
            `Текущий уровень: ${gameState.level}`,
            `Всего рыб: ${gameState.fishCount}`,
            `Всего заработано: ${gameState.totalMoney} 💰`,
            `Аквариум: ${gameState.aquariumSize}x${gameState.aquariumSize}`,
            `Опыт: ${gameState.experience}`,
            `Время игры: ${gameState.playTime} сек`
        ];
        
        for (const stat of stats) {
            ctx.fillStyle = '#333';
            ctx.fillText(stat, x + 30, infoY);
            infoY += 35;
        }
        
        // Кнопка закрытия
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(x + windowWidth - 80, y + windowHeight - 40, 70, 30);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Закрыть', x + windowWidth - 45, y + windowHeight - 25);
    }
    
    renderExpandMenu(ctx, gameState) {
        const windowWidth = 400;
        const windowHeight = 300;
        const x = (this.gameWidth - windowWidth) / 2;
        const y = (this.gameHeight - windowHeight) / 2;
        
        // Окно
        ctx.fillStyle = '#F0F4F8';
        ctx.fillRect(x, y, windowWidth, windowHeight);
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, windowWidth, windowHeight);
        
        // Заголовок
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏠 РАСШИРЕНИЕ', this.gameWidth / 2, y + 30);
        
        // Информация
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.fillText(`Текущий размер: ${gameState.aquariumSize}x${gameState.aquariumSize}`, this.gameWidth / 2, y + 80);
        ctx.fillText(`Следующий размер: ${gameState.aquariumSize + 1}x${gameState.aquariumSize + 1}`, this.gameWidth / 2, y + 110);
        ctx.fillText(`Стоимость: ${gameState.expandCost} 💰`, this.gameWidth / 2, y + 140);
        
        if (gameState.aquariumSize >= 10) {
            ctx.fillStyle = '#E74C3C';
            ctx.fillText('Максимальный размер достигнут!', this.gameWidth / 2, y + 180);
        } else {
            const canExpand = gameState.money >= gameState.expandCost;
            ctx.fillStyle = canExpand ? '#4A90E2' : '#CCC';
            ctx.fillRect(x + 50, y + 170, windowWidth - 100, 40);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('Расширить', this.gameWidth / 2, y + 195);
        }
        
        // Кнопка закрытия
        ctx.fillStyle = '#E74C3C';
        ctx.fillRect(x + windowWidth - 70, y + windowHeight - 40, 60, 30);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Закрыть', x + windowWidth - 40, y + windowHeight - 25);
    }
}

const uiManager = new UIManager(1280, 720);