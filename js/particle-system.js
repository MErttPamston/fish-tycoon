// Particle System - система частиц для эффектов
class Particle {
    constructor(x, y, vx, vy, life, color, type = 'circle') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.initialLife = life;
        this.life = life;
        this.color = color;
        this.type = type;
        this.size = 4;
        this.opacity = 1;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 50 * dt; // гравитация
        this.life -= dt;
        this.opacity = Math.max(0, this.life / this.initialLife);
    }
    
    isAlive() {
        return this.life > 0;
    }
}

class FloatingText {
    constructor(x, y, text, color = '#FFD700') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1;
        this.initialLife = 1;
        this.vy = -60;
        this.fontSize = 20;
    }
    
    update(dt) {
        this.y += this.vy * dt;
        this.life -= dt;
    }
    
    isAlive() {
        return this.life > 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
    }
    
    emitBubbles(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = 20 + Math.random() * 40;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 30;
            const life = 1 + Math.random() * 1;
            
            const particle = new Particle(x, y, vx, vy, life, '#87CEEB', 'circle');
            this.particles.push(particle);
        }
    }
    
    emitSparkles(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = 50 + Math.random() * 100;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.5 + Math.random() * 0.5;
            
            const colors = ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const particle = new Particle(x, y, vx, vy, life, color, 'star');
            this.particles.push(particle);
        }
    }
    
    emitHealing(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = 40 + Math.random() * 60;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.8;
            
            const particle = new Particle(x, y, vx, vy, life, '#00FF00', 'circle');
            this.particles.push(particle);
        }
    }
    
    emitMoneyFloating(x, y, amount) {
        const text = new FloatingText(x, y, `+${amount} 💰`, '#FFD700');
        this.floatingTexts.push(text);
    }
    
    emitXPFloating(x, y, amount) {
        const text = new FloatingText(x, y, `+${amount} XP`, '#00FF00');
        this.floatingTexts.push(text);
    }
    
    update(dt) {
        // Обновление частиц
        this.particles = this.particles.filter(p => {
            p.update(dt);
            return p.isAlive();
        });
        
        // Обновление плавающих текстов
        this.floatingTexts = this.floatingTexts.filter(t => {
            t.update(dt);
            return t.isAlive();
        });
    }
    
    render(ctx) {
        // Рендеринг частиц
        for (const particle of this.particles) {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            
            if (particle.type === 'circle') {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (particle.type === 'star') {
                this.drawStar(ctx, particle.x, particle.y, 5, particle.size, particle.size * 0.5);
            }
            ctx.restore();
        }
        
        // Рендеринг плавающих текстов
        for (const text of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = text.life / text.initialLife;
            ctx.fillStyle = text.color;
            ctx.font = `bold ${text.fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(text.text, text.x, text.y);
            ctx.restore();
        }
    }
    
    drawStar(ctx, x, y, points, outerRadius, innerRadius) {
        let step = Math.PI / points;
        ctx.beginPath();
        ctx.moveTo(x, y - outerRadius);
        for (let i = 0; i < points * 2; i++) {
            let r = i % 2 === 0 ? outerRadius : innerRadius;
            ctx.lineTo(x + Math.sin(i * step) * r, y - Math.cos(i * step) * r);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    clear() {
        this.particles = [];
        this.floatingTexts = [];
    }
}

const particleSystem = new ParticleSystem();