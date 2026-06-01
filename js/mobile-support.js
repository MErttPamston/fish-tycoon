// Mobile Support - поддержка мобильных устройств
class MobileSupport {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isTouch = () => {
            return (('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) ||
                    (navigator.msMaxTouchPoints > 0));
        };
        this.touches = new Map();
        this.setupMobileUI();
        this.setupTouchHandlers();
    }
    
    setupMobileUI() {
        const canvas = document.getElementById('gameCanvas');
        const container = document.getElementById('gameContainer');
        
        // Адаптивный размер экрана
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 100);
        });
    }
    
    setupTouchHandlers() {
        const canvas = document.getElementById('gameCanvas');
        
        // Touch start
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (let touch of e.touches) {
                this.touches.set(touch.identifier, {
                    x: touch.clientX,
                    y: touch.clientY,
                    startX: touch.clientX,
                    startY: touch.clientY
                });
            }
            this.handleTouchInput(e);
        }, { passive: false });
        
        // Touch move
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let touch of e.touches) {
                if (this.touches.has(touch.identifier)) {
                    const t = this.touches.get(touch.identifier);
                    t.x = touch.clientX;
                    t.y = touch.clientY;
                }
            }
        }, { passive: false });
        
        // Touch end
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (let touch of e.changedTouches) {
                this.touches.delete(touch.identifier);
            }
        }, { passive: false });
        
        // Touch cancel
        canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.touches.clear();
        }, { passive: false });
    }
    
    handleTouchInput(e) {
        const rect = document.getElementById('gameCanvas').getBoundingClientRect();
        
        for (let touch of e.touches) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Передача координат в игру
            if (window.game) {
                window.game.mouseX = x;
                window.game.mouseY = y;
                window.game.isMousePressed = true;
            }
        }
    }
    
    getTouchPosition(index = 0) {
        const touches = Array.from(this.touches.values());
        return touches[index] || null;
    }
    
    getTouchCount() {
        return this.touches.size;
    }
    
    // Вибрация на мобильных
    vibrate(duration = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    // Полноэкранный режим
    requestFullscreen() {
        const elem = document.getElementById('gameContainer');
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
    
    // Блокировка ориентации
    lockOrientation(orientation = 'portrait') {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock(orientation).catch(err => {
                console.log('Ориентация не может быть заблокирована:', err);
            });
        }
    }
    
    // Предотвращение спящего режима
    preventSleep() {
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen').catch(err => {
                console.log('Не удалось предотвратить спящий режим:', err);
            });
        }
    }
}

const mobileSupport = new MobileSupport();

// Обновление игры для поддержки сенсорного ввода
if (window.game) {
    const originalHandleMouseDown = window.game.handleMouseDown;
    window.game.handleMouseDown = function(e) {
        if (e.touches && e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
            mobileSupport.vibrate(20);
        }
        originalHandleMouseDown.call(this, e);
    };
}