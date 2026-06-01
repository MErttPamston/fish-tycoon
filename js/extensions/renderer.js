// Advanced Rendering - расширенные графические возможности

class AdvancedRenderer {
    constructor() {
        this.gradients = {};
        this.patterns = {};
        this.shaders = {};
    }
    
    createGradient(ctx, x1, y1, x2, y2, colors) {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });
        return gradient;
    }
    
    createRadialGradient(ctx, x, y, r1, r2, colors) {
        const gradient = ctx.createRadialGradient(x, y, r1, x, y, r2);
        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });
        return gradient;
    }
    
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    drawBezierCurve(ctx, points) {
        if (points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        ctx.quadraticCurveTo(points[points.length - 2].x, points[points.length - 2].y, points[points.length - 1].x, points[points.length - 1].y);
    }
    
    drawGlowEffect(ctx, x, y, radius, glowRadius, color) {
        const gradient = ctx.createRadialGradient(x, y, radius, x, y, radius + glowRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius - glowRadius, y - radius - glowRadius, 
                     (radius + glowRadius) * 2, (radius + glowRadius) * 2);
    }
    
    drawTextWithShadow(ctx, text, x, y, fontStyle, color, shadowBlur = 4) {
        ctx.font = fontStyle;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(text, x, y);
        
        ctx.fillStyle = color;
        ctx.shadowColor = 'transparent';
        ctx.fillText(text, x, y);
    }
}

class ParallaxBackground {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.layers = [];
        this.offset = 0;
    }
    
    addLayer(image, speed, alpha = 1) {
        this.layers.push({
            image,
            speed,
            alpha,
            offset: 0
        });
    }
    
    update(dt) {
        this.offset += dt * 20;
        
        for (const layer of this.layers) {
            layer.offset = (this.offset * layer.speed) % this.gameWidth;
        }
    }
    
    render(ctx) {
        for (const layer of this.layers) {
            ctx.save();
            ctx.globalAlpha = layer.alpha;
            
            if (typeof layer.image === 'string') {
                // Можно добавить слои фона
            }
            
            ctx.restore();
        }
    }
}

class ScreenTransition {
    constructor(duration = 1) {
        this.duration = duration;
        this.elapsed = 0;
        this.progress = 0;
        this.active = false;
        this.type = 'fade';
    }
    
    start(type = 'fade') {
        this.type = type;
        this.elapsed = 0;
        this.active = true;
    }
    
    update(dt) {
        if (!this.active) return;
        
        this.elapsed += dt;
        this.progress = Math.min(this.elapsed / this.duration, 1);
        
        if (this.progress >= 1) {
            this.active = false;
        }
    }
    
    render(ctx, gameWidth, gameHeight) {
        if (!this.active && this.progress >= 1) return;
        
        ctx.save();
        
        if (this.type === 'fade') {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.progress})`;
            ctx.fillRect(0, 0, gameWidth, gameHeight);
        } else if (this.type === 'slide') {
            const slideX = -gameWidth + (gameWidth * this.progress);
            ctx.fillStyle = '#000';
            ctx.fillRect(slideX, 0, gameWidth, gameHeight);
        }
        
        ctx.restore();
    }
}

const advancedRenderer = new AdvancedRenderer();
const screenTransition = new ScreenTransition();