// Performance Monitor - мониторинг производительности

class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = Date.now();
        this.frameTimeHistory = [];
        this.maxHistory = 60;
        this.currentFrameTime = 0;
    }
    
    update() {
        const now = Date.now();
        const deltaTime = now - this.lastTime;
        this.currentFrameTime = deltaTime;
        
        this.frameTimeHistory.push(deltaTime);
        if (this.frameTimeHistory.length > this.maxHistory) {
            this.frameTimeHistory.shift();
        }
        
        this.frameCount++;
        if (deltaTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
    
    getAverageFrameTime() {
        if (this.frameTimeHistory.length === 0) return 0;
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.frameTimeHistory.length;
    }
    
    getMemoryUsage() {
        if (performance && performance.memory) {
            return {
                usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
                totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
                jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
            };
        }
        return null;
    }
    
    render(ctx, x = 10, y = 10) {
        ctx.save();
        ctx.fillStyle = '#000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const info = [
            `FPS: ${this.fps}`,
            `Frame Time: ${this.currentFrameTime.toFixed(2)}ms`,
            `Avg Frame Time: ${this.getAverageFrameTime().toFixed(2)}ms`
        ];
        
        const memory = this.getMemoryUsage();
        if (memory) {
            info.push(`Memory: ${memory.usedJSHeapSize} / ${memory.totalJSHeapSize} MB`);
        }
        
        for (let i = 0; i < info.length; i++) {
            ctx.fillText(info[i], x, y + i * 15);
        }
        
        ctx.restore();
    }
}

class ResourceManager {
    constructor() {
        this.textures = new Map();
        this.sounds = new Map();
        this.fonts = new Map();
        this.loaded = 0;
        this.total = 0;
    }
    
    loadTexture(name, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.textures.set(name, img);
                this.loaded++;
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
            this.total++;
        });
    }
    
    getTexture(name) {
        return this.textures.get(name);
    }
    
    getLoadProgress() {
        return this.total > 0 ? (this.loaded / this.total) * 100 : 0;
    }
}

class CacheSystem {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.accessOrder = [];
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            this.accessOrder = this.accessOrder.filter(k => k !== key);
        }
        
        this.cache.set(key, value);
        this.accessOrder.push(key);
        
        while (this.cache.size > this.maxSize) {
            const oldestKey = this.accessOrder.shift();
            this.cache.delete(oldestKey);
        }
    }
    
    get(key) {
        if (this.cache.has(key)) {
            this.accessOrder = this.accessOrder.filter(k => k !== key);
            this.accessOrder.push(key);
            return this.cache.get(key);
        }
        return undefined;
    }
    
    has(key) {
        return this.cache.has(key);
    }
    
    clear() {
        this.cache.clear();
        this.accessOrder = [];
    }
    
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            percentage: (this.cache.size / this.maxSize) * 100
        };
    }
}

class DataSerializer {
    static toJSON(obj) {
        return JSON.stringify(obj);
    }
    
    static fromJSON(json) {
        return JSON.parse(json);
    }
    
    static compress(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }
    
    static decompress(str) {
        return decodeURIComponent(escape(atob(str)));
    }
    
    static export(data, filename = 'save.json') {
        const json = this.toJSON(data);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    static import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = this.fromJSON(e.target.result);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

const performanceMonitor = new PerformanceMonitor();
const resourceManager = new ResourceManager();
const cache = new CacheSystem();