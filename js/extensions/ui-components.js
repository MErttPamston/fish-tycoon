// Enhanced UI Components - расширенные UI компоненты

class ProgressBar {
    constructor(x, y, width, height, maxValue = 100) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxValue = maxValue;
        this.value = 0;
        this.targetValue = 0;
        this.color = '#4CAF50';
        this.backgroundColor = '#CCCCCC';
        this.animated = true;
        this.animationSpeed = 0.1;
    }
    
    setValue(value) {
        this.targetValue = Math.max(0, Math.min(value, this.maxValue));
        if (!this.animated) {
            this.value = this.targetValue;
        }
    }
    
    update(dt) {
        if (this.animated && this.value !== this.targetValue) {
            const diff = this.targetValue - this.value;
            this.value += diff * Math.min(this.animationSpeed * dt, 1);
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = this.color;
        const fillWidth = (this.value / this.maxValue) * this.width;
        ctx.fillRect(this.x, this.y, fillWidth, this.height);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

class Slider {
    constructor(x, y, width, minValue = 0, maxValue = 100) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 8;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.value = (maxValue + minValue) / 2;
        this.isDragging = false;
        this.thumbRadius = 10;
    }
    
    getThumbX() {
        return this.x + ((this.value - this.minValue) / (this.maxValue - this.minValue)) * this.width;
    }
    
    contains(x, y) {
        const thumbX = this.getThumbX();
        return Math.abs(x - thumbX) <= this.thumbRadius && 
               Math.abs(y - this.y) <= this.thumbRadius + 5;
    }
    
    handleMouseDown() {
        this.isDragging = true;
    }
    
    handleMouseUp() {
        this.isDragging = false;
    }
    
    handleMouseMove(x) {
        if (!this.isDragging) return;
        
        const percent = (x - this.x) / this.width;
        this.value = this.minValue + percent * (this.maxValue - this.minValue);
        this.value = Math.max(this.minValue, Math.min(this.maxValue, this.value));
    }
    
    render(ctx) {
        const thumbX = this.getThumbX();
        
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.stroke();
        
        ctx.fillStyle = this.isDragging ? '#2196F3' : '#4CAF50';
        ctx.beginPath();
        ctx.arc(thumbX, this.y, this.thumbRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Tooltip {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.visible = false;
        this.opacity = 0;
        this.padding = 8;
        this.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.textColor = '#FFFFFF';
        this.showDelay = 0.5;
        this.timer = 0;
    }
    
    show() {
        this.visible = true;
        this.timer = 0;
        this.opacity = 0;
    }
    
    hide() {
        this.visible = false;
    }
    
    update(dt) {
        if (!this.visible) {
            this.opacity = Math.max(0, this.opacity - dt);
            return;
        }
        
        this.timer += dt;
        if (this.timer > this.showDelay) {
            this.opacity = Math.min(1, this.opacity + dt);
        }
    }
    
    render(ctx) {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        ctx.font = '12px Arial';
        const metrics = ctx.measureText(this.text);
        const width = metrics.width + this.padding * 2;
        const height = 20;
        
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y - height - 5, width, height);
        
        ctx.fillStyle = this.textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x + this.padding, this.y - height / 2 - 5);
        
        ctx.restore();
    }
}

class Modal {
    constructor(title, content, options = {}) {
        this.title = title;
        this.content = content;
        this.options = options;
        this.visible = false;
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.buttons = options.buttons || [];
        this.opacity = 0;
    }
    
    show() {
        this.visible = true;
        this.opacity = 0;
    }
    
    hide() {
        this.visible = false;
    }
    
    update(dt) {
        if (this.visible) {
            this.opacity = Math.min(1, this.opacity + dt * 2);
        } else {
            this.opacity = Math.max(0, this.opacity - dt * 2);
        }
    }
    
    render(ctx, gameWidth, gameHeight) {
        if (this.opacity <= 0) return;
        
        ctx.save();
        
        const x = (gameWidth - this.width) / 2;
        const y = (gameHeight - this.height) / 2;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * this.opacity})`;
        ctx.fillRect(0, 0, gameWidth, gameHeight);
        
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        ctx.fillRect(x, y, this.width, this.height);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.title, gameWidth / 2, y + 15);
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.content, x + 20, y + 50);
        
        ctx.restore();
    }
}

const progressBars = new Map();
const sliders = new Map();
const tooltips = new Map();
const modals = new Map();