// ═══════════════════════════════════════════════════════════════
//  FISH TYCOON — COMPLETE GAME ENGINE
//  Retro Arcade Style | Web Game | ~5000+ Lines
//  © 1987 AQUA SYSTEMS INC. (Fictional)
// ═══════════════════════════════════════════════════════════════

'use strict';

// ─────────────────────────────────────────────
// SECTION 1: AUDIO ENGINE (Web Audio API)
// ─────────────────────────────────────────────

const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let muted = false;
  let musicOscillators = [];
  let bgMusicInterval = null;

  function init() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(ctx.destination);

      musicGain = ctx.createGain();
      musicGain.gain.value = 0.3;
      musicGain.connect(masterGain);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.6;
      sfxGain.connect(masterGain);

      startBgMusic();
    } catch (e) {
      console.warn('AudioContext unavailable:', e);
    }
  }

  function toggleMute() {
    muted = !muted;
    if (masterGain) masterGain.gain.value = muted ? 0 : 0.7;
    return muted;
  }

  // Synthesize a tone
  function playTone(freq, duration, type = 'sine', gainVal = 0.3, delay = 0, target = sfxGain) {
    if (!ctx || muted) return;
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.connect(g);
      g.connect(target);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.01);
    } catch(e) {}
  }

  // Noise burst
  function playNoise(duration, gainVal = 0.1, delay = 0) {
    if (!ctx || muted) return;
    try {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      source.connect(filter);
      filter.connect(g);
      g.connect(sfxGain);
      source.start(ctx.currentTime + delay);
    } catch(e) {}
  }

  // ── SOUND EFFECTS ──

  function sfxCoin() {
    playTone(523, 0.1, 'sine', 0.25, 0);
    playTone(659, 0.1, 'sine', 0.25, 0.06);
    playTone(784, 0.15, 'sine', 0.3, 0.12);
  }

  function sfxCaChingBig() {
    playTone(392, 0.08, 'square', 0.15, 0);
    playTone(523, 0.08, 'square', 0.15, 0.07);
    playTone(659, 0.08, 'square', 0.15, 0.14);
    playTone(784, 0.08, 'square', 0.15, 0.21);
    playTone(1047, 0.3, 'sine', 0.3, 0.28);
  }

  function sfxSparkle() {
    for (let i = 0; i < 6; i++) {
      const freq = 800 + Math.random() * 1200;
      playTone(freq, 0.15, 'sine', 0.1, i * 0.04);
    }
  }

  function sfxClick() {
    playTone(440, 0.05, 'square', 0.1, 0);
    playTone(220, 0.05, 'square', 0.05, 0.04);
  }

  function sfxError() {
    playTone(150, 0.15, 'square', 0.2, 0);
    playTone(100, 0.15, 'sawtooth', 0.15, 0.1);
  }

  function sfxLevelUp() {
    const notes = [262, 294, 330, 349, 392, 440, 494, 523];
    notes.forEach((n, i) => {
      playTone(n, 0.15, 'square', 0.2, i * 0.07);
    });
    setTimeout(() => {
      playTone(1047, 0.4, 'sine', 0.4);
    }, notes.length * 70 + 50);
  }

  function sfxSick() {
    playTone(330, 0.1, 'sawtooth', 0.15, 0);
    playTone(294, 0.15, 'sawtooth', 0.15, 0.12);
    playTone(262, 0.2, 'sawtooth', 0.1, 0.27);
  }

  function sfxHeal() {
    playTone(523, 0.1, 'sine', 0.2, 0);
    playTone(659, 0.1, 'sine', 0.2, 0.08);
    playTone(784, 0.15, 'sine', 0.25, 0.16);
    playTone(1047, 0.2, 'sine', 0.2, 0.28);
  }

  function sfxFeed() {
    playNoise(0.15, 0.15, 0);
    playTone(440, 0.1, 'sine', 0.1, 0.05);
  }

  function sfxBreed() {
    sfxSparkle();
    playTone(523, 0.2, 'triangle', 0.3, 0.2);
    playTone(784, 0.2, 'triangle', 0.3, 0.35);
  }

  function sfxBubble() {
    const freq = 600 + Math.random() * 400;
    playTone(freq, 0.08, 'sine', 0.05);
  }

  function sfxDeath() {
    playTone(220, 0.3, 'sawtooth', 0.15, 0);
    playTone(165, 0.4, 'sawtooth', 0.12, 0.2);
    playTone(110, 0.5, 'sawtooth', 0.1, 0.5);
  }

  // ── BACKGROUND MUSIC (Chiptune Lo-Fi) ──

  const bgMelody = [
    // C minor pentatonic chillhop loop
    { freq: 262, dur: 0.4, type: 'square' },
    { freq: 0,   dur: 0.1 },
    { freq: 311, dur: 0.3, type: 'square' },
    { freq: 349, dur: 0.5, type: 'square' },
    { freq: 0,   dur: 0.2 },
    { freq: 392, dur: 0.4, type: 'square' },
    { freq: 349, dur: 0.3, type: 'square' },
    { freq: 311, dur: 0.4, type: 'square' },
    { freq: 0,   dur: 0.3 },
    { freq: 262, dur: 0.3, type: 'square' },
    { freq: 0,   dur: 0.15 },
    { freq: 294, dur: 0.4, type: 'square' },
    { freq: 262, dur: 0.6, type: 'square' },
    { freq: 0,   dur: 0.5 },
    { freq: 349, dur: 0.3, type: 'square' },
    { freq: 311, dur: 0.3, type: 'square' },
    { freq: 262, dur: 0.5, type: 'square' },
    { freq: 0,   dur: 0.8 },
  ];

  const bassLine = [
    { freq: 65, dur: 0.8, type: 'sawtooth' },
    { freq: 73, dur: 0.8, type: 'sawtooth' },
    { freq: 87, dur: 0.8, type: 'sawtooth' },
    { freq: 73, dur: 0.8, type: 'sawtooth' },
  ];

  let melodyIndex = 0;
  let melodyTime = 0;
  let bassIndex = 0;
  let bassTime = 0;

  function scheduleMelodyNote() {
    if (!ctx || muted) return;
    const note = bgMelody[melodyIndex % bgMelody.length];
    if (note.freq > 0) {
      playTone(note.freq, note.dur, note.type || 'square', 0.08, melodyTime, musicGain);
    }
    melodyTime += note.dur;
    melodyIndex++;
    if (melodyTime > ctx.currentTime + 2) {
      bgMusicInterval = setTimeout(scheduleMelodyNote, 500);
    } else {
      bgMusicInterval = setTimeout(scheduleMelodyNote, 100);
    }
  }

  function scheduleBassNote() {
    if (!ctx || muted) return;
    const note = bassLine[bassIndex % bassLine.length];
    playTone(note.freq, note.dur * 0.9, 'sawtooth', 0.04, bassTime, musicGain);
    bassTime += note.dur;
    bassIndex++;
    setTimeout(scheduleBassNote, note.dur * 1000);
  }

  // Ambient bubbles
  function scheduleAmbientBubbles() {
    if (!ctx || muted) return;
    sfxBubble();
    setTimeout(scheduleAmbientBubbles, 1500 + Math.random() * 3000);
  }

  function startBgMusic() {
    if (!ctx) return;
    melodyTime = ctx.currentTime + 0.5;
    bassTime = ctx.currentTime + 0.5;
    scheduleMelodyNote();
    scheduleBassNote();
    setTimeout(scheduleAmbientBubbles, 2000);
  }

  return {
    init,
    toggleMute,
    sfxCoin,
    sfxCaChingBig,
    sfxSparkle,
    sfxClick,
    sfxError,
    sfxLevelUp,
    sfxSick,
    sfxHeal,
    sfxFeed,
    sfxBreed,
    sfxBubble,
    sfxDeath,
    isMuted: () => muted,
  };
})();


// ─────────────────────────────────────────────
// SECTION 2: GAME DATA & FISH DEFINITIONS
// ─────────────────────────────────────────────

const FISH_TYPES = [
  {
    id: 'goldfish',
    name: 'Золотая',
    emoji: '🐟',
    color: '#FFD700',
    glowColor: 'rgba(255,215,0,0.6)',
    buyPrice: 100,
    sellPrice: 150,
    breedTime: 30000,    // ms
    maxHealth: 100,
    requiredLevel: 1,
    rarity: 'common',
    rarityIcon: '⬜',
    desc: 'Классика аквариума. Дёшево и надёжно.',
    expReward: 5,
    sickChance: 0.003,   // per tick
    foodCost: 2,
  },
  {
    id: 'neon',
    name: 'Неоновая',
    emoji: '🐠',
    color: '#00F5FF',
    glowColor: 'rgba(0,245,255,0.6)',
    buyPrice: 250,
    sellPrice: 400,
    breedTime: 25000,
    maxHealth: 80,
    requiredLevel: 3,
    rarity: 'uncommon',
    rarityIcon: '🟩',
    desc: 'Светится в темноте. Эффектная!',
    expReward: 10,
    sickChance: 0.004,
    foodCost: 3,
  },
  {
    id: 'betta',
    name: 'Бойцовая',
    emoji: '🐡',
    color: '#FF006E',
    glowColor: 'rgba(255,0,110,0.6)',
    buyPrice: 500,
    sellPrice: 800,
    breedTime: 20000,
    maxHealth: 120,
    requiredLevel: 5,
    rarity: 'uncommon',
    rarityIcon: '🟩',
    desc: 'Агрессивная красавица с пышным хвостом.',
    expReward: 15,
    sickChance: 0.002,
    foodCost: 4,
  },
  {
    id: 'clownfish',
    name: 'Рыба-клоун',
    emoji: '🤡',
    color: '#FF6B35',
    glowColor: 'rgba(255,107,53,0.6)',
    buyPrice: 750,
    sellPrice: 1200,
    breedTime: 35000,
    maxHealth: 90,
    requiredLevel: 8,
    rarity: 'rare',
    rarityIcon: '🟦',
    desc: 'Полосатая озорница. Всем поднимет настроение!',
    expReward: 20,
    sickChance: 0.003,
    foodCost: 5,
  },
  {
    id: 'seahorse',
    name: 'Морской конёк',
    emoji: '🦄',
    color: '#FF69B4',
    glowColor: 'rgba(255,105,180,0.6)',
    buyPrice: 1000,
    sellPrice: 1600,
    breedTime: 40000,
    maxHealth: 70,
    requiredLevel: 10,
    rarity: 'rare',
    rarityIcon: '🟦',
    desc: 'Нежная и романтичная. Размножается медленно.',
    expReward: 25,
    sickChance: 0.005,
    foodCost: 4,
  },
  {
    id: 'ray',
    name: 'Скат',
    emoji: '🦋',
    color: '#BF5AF2',
    glowColor: 'rgba(191,90,242,0.6)',
    buyPrice: 2000,
    sellPrice: 3500,
    breedTime: 28000,
    maxHealth: 150,
    requiredLevel: 15,
    rarity: 'epic',
    rarityIcon: '🟪',
    desc: 'Величественный скат. Экзотика чистой воды.',
    expReward: 40,
    sickChance: 0.002,
    foodCost: 8,
  },
  {
    id: 'lionfish',
    name: 'Рыба-лев',
    emoji: '👑',
    color: '#FFD700',
    glowColor: 'rgba(255,215,0,0.8)',
    buyPrice: 5000,
    sellPrice: 9000,
    breedTime: 15000,
    maxHealth: 200,
    requiredLevel: 20,
    rarity: 'legendary',
    rarityIcon: '🌟',
    desc: 'Легендарная! Размножается быстро и стоит целое состояние.',
    expReward: 80,
    sickChance: 0.001,
    foodCost: 12,
  },
  {
    id: 'robofish',
    name: 'Робо-рыба',
    emoji: '🤖',
    color: '#00F5FF',
    glowColor: 'rgba(0,245,255,1)',
    buyPrice: 15000,
    sellPrice: 28000,
    breedTime: 20000,
    maxHealth: 999,
    requiredLevel: 30,
    rarity: 'mythic',
    rarityIcon: '💎',
    desc: 'ИЗ БУДУЩЕГО. Никогда не болеет. Мечта миллионера.',
    expReward: 200,
    sickChance: 0,
    foodCost: 5,
  },
];

const RARITY_COLORS = {
  common: '#aaaaaa',
  uncommon: '#39ff14',
  rare: '#00f5ff',
  epic: '#bf5af2',
  legendary: '#ffd700',
  mythic: '#ff006e',
};

const SHOP_ITEMS = [
  {
    id: 'food_small',
    name: 'Корм (S)',
    emoji: '🍖',
    price: 50,
    desc: 'Небольшая порция корма +50',
    action: (gs) => { gs.food = Math.min(gs.food + 50, gs.maxFood); },
  },
  {
    id: 'food_large',
    name: 'Корм (L)',
    emoji: '🥩',
    price: 150,
    desc: 'Большая порция корма +200',
    action: (gs) => { gs.food = Math.min(gs.food + 200, gs.maxFood); },
  },
  {
    id: 'medicine',
    name: 'Лекарство',
    emoji: '💊',
    price: 200,
    desc: 'Лечит одну больную рыбу',
    action: (gs) => { gs.medicine++; },
  },
  {
    id: 'medicine_pack',
    name: 'Аптечка',
    emoji: '🏥',
    price: 500,
    desc: 'Лечит всех больных рыб сразу',
    action: (gs) => { gs.medicine += 5; },
  },
];

const UPGRADES = [
  {
    id: 'tank_size',
    name: 'Размер аквариума',
    emoji: '🏗️',
    desc: 'Больше места = больше рыб',
    maxLevel: 7,
    costs: [500, 1200, 2500, 5000, 10000, 20000, 40000],
    effect: (lvl) => ({ maxFish: 10 + lvl * 5 }),
    currentLevel: 0,
  },
  {
    id: 'food_storage',
    name: 'Запас корма',
    emoji: '🍱',
    desc: 'Увеличивает максимум корма',
    maxLevel: 5,
    costs: [200, 500, 1000, 2500, 5000],
    effect: (lvl) => ({ maxFood: 200 + lvl * 100 }),
    currentLevel: 0,
  },
  {
    id: 'auto_feed',
    name: 'Автокормушка',
    emoji: '🤖',
    desc: 'Автоматически кормит рыб',
    maxLevel: 3,
    costs: [1000, 3000, 8000],
    effect: (lvl) => ({ autoFeedRate: lvl }),
    currentLevel: 0,
  },
  {
    id: 'breed_speed',
    name: 'Ускоритель роста',
    emoji: '⚡',
    desc: 'Рыбы размножаются быстрее',
    maxLevel: 5,
    costs: [800, 2000, 5000, 12000, 25000],
    effect: (lvl) => ({ breedMultiplier: 1 - lvl * 0.15 }),
    currentLevel: 0,
  },
  {
    id: 'sell_bonus',
    name: 'Торговая лицензия',
    emoji: '📜',
    desc: 'Цена продажи рыб выше',
    maxLevel: 5,
    costs: [1500, 4000, 9000, 20000, 45000],
    effect: (lvl) => ({ sellMultiplier: 1 + lvl * 0.2 }),
    currentLevel: 0,
  },
  {
    id: 'immune_system',
    name: 'Иммунитет',
    emoji: '🛡️',
    desc: 'Рыбы болеют реже',
    maxLevel: 4,
    costs: [600, 1800, 5000, 12000],
    effect: (lvl) => ({ sickMultiplier: 1 - lvl * 0.2 }),
    currentLevel: 0,
  },
];

const ACHIEVEMENTS = [
  {
    id: 'first_sell',
    name: 'Первая продажа',
    emoji: '🥇',
    desc: 'Продать первую рыбу',
    check: (gs) => gs.stats.fishSold >= 1,
    unlocked: false,
  },
  {
    id: 'fish_10',
    name: 'Маленький аквариум',
    emoji: '🐟',
    desc: 'Иметь 10 рыб одновременно',
    check: (gs) => gs.fish.length >= 10,
    unlocked: false,
  },
  {
    id: 'fish_50',
    name: 'Большой аквариум',
    emoji: '🐠',
    desc: 'Иметь 50 рыб одновременно',
    check: (gs) => gs.fish.length >= 50,
    unlocked: false,
  },
  {
    id: 'gold_1000',
    name: 'Тысячник',
    emoji: '💰',
    desc: 'Заработать 1,000 монет',
    check: (gs) => gs.stats.totalEarned >= 1000,
    unlocked: false,
  },
  {
    id: 'gold_100000',
    name: 'Сотник',
    emoji: '💎',
    desc: 'Заработать 100,000 монет',
    check: (gs) => gs.stats.totalEarned >= 100000,
    unlocked: false,
  },
  {
    id: 'gold_1m',
    name: 'Миллионер',
    emoji: '🏆',
    desc: 'Заработать 1,000,000 монет',
    check: (gs) => gs.stats.totalEarned >= 1000000,
    unlocked: false,
  },
  {
    id: 'level_10',
    name: 'Опытный',
    emoji: '⭐',
    desc: 'Достичь 10 уровня',
    check: (gs) => gs.level >= 10,
    unlocked: false,
  },
  {
    id: 'level_30',
    name: 'Мастер',
    emoji: '🌟',
    desc: 'Достичь 30 уровня',
    check: (gs) => gs.level >= 30,
    unlocked: false,
  },
  {
    id: 'level_50',
    name: 'Легенда',
    emoji: '👑',
    desc: 'Достичь 50 уровня',
    check: (gs) => gs.level >= 50,
    unlocked: false,
  },
  {
    id: 'breed_100',
    name: 'Племенное хозяйство',
    emoji: '🐣',
    desc: 'Вырастить 100 рыб',
    check: (gs) => gs.stats.fishBred >= 100,
    unlocked: false,
  },
  {
    id: 'all_fish',
    name: 'Коллекционер',
    emoji: '🎭',
    desc: 'Купить все виды рыб',
    check: (gs) => {
      const ids = new Set(gs.fish.map(f => f.typeId));
      return FISH_TYPES.every(ft => ids.has(ft.id));
    },
    unlocked: false,
  },
  {
    id: 'robofish',
    name: 'Из будущего',
    emoji: '🤖',
    desc: 'Купить Робо-рыбу',
    check: (gs) => gs.fish.some(f => f.typeId === 'robofish') || gs.stats.fishSoldTypes.has('robofish'),
    unlocked: false,
  },
  {
    id: 'heal_10',
    name: 'Ветеринар',
    emoji: '💊',
    desc: 'Вылечить 10 рыб',
    check: (gs) => gs.stats.fishHealed >= 10,
    unlocked: false,
  },
  {
    id: 'no_deaths_100',
    name: 'Идеальный уход',
    emoji: '🛡️',
    desc: 'Иметь 0 смертей при 100 проданных рыбах',
    check: (gs) => gs.stats.fishSold >= 100 && gs.stats.fishDied === 0,
    unlocked: false,
  },
];

const EXP_TABLE = Array.from({ length: 51 }, (_, i) => Math.floor(100 * Math.pow(1.3, i)));

// ─────────────────────────────────────────────
// SECTION 3: GAME STATE
// ─────────────────────────────────────────────

const GameState = {
  gold: 500,
  food: 100,
  maxFood: 200,
  medicine: 0,
  fish: [],
  level: 1,
  exp: 0,
  nextFishId: 1,
  maxFish: 15,

  upgrades: UPGRADES.map(u => ({ id: u.id, level: 0 })),

  achievements: ACHIEVEMENTS.map(a => ({ id: a.id, unlocked: false })),

  breedMultiplier: 1,
  sellMultiplier: 1,
  sickMultiplier: 1,
  autoFeedRate: 0,

  stats: {
    fishSold: 0,
    fishBred: 0,
    fishHealed: 0,
    fishDied: 0,
    totalEarned: 0,
    fishSoldTypes: new Set(),
    playTime: 0,
    feedCount: 0,
  },

  selectedFishId: null,
  playStartTime: Date.now(),
  lastSaveTime: Date.now(),
  lastAutoFeed: Date.now(),
};

// ─────────────────────────────────────────────
// SECTION 4: CANVAS FISH RENDERER
// ─────────────────────────────────────────────

const Renderer = (() => {
  let canvas, ctx;
  let W, H;
  let bubbles = [];
  let particles = [];
  let decorations = [];
  let animFrame;
  let lastTimestamp = 0;
  let frameCount = 0;

  // Bubble class
  class Bubble {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = H + 10;
      this.r = 2 + Math.random() * 5;
      this.speed = 0.3 + Math.random() * 0.7;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 0.02 + Math.random() * 0.03;
      this.alpha = 0.2 + Math.random() * 0.4;
    }
    update(dt) {
      this.y -= this.speed * dt * 0.05;
      this.wobble += this.wobbleSpeed * dt * 0.05;
      this.x += Math.sin(this.wobble) * 0.3;
      if (this.y < -20) this.reset();
    }
    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180,240,255,${this.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      // Shine
      ctx.beginPath();
      ctx.arc(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.alpha * 0.5})`;
      ctx.fill();
      ctx.restore();
    }
  }

  // Particle class (spawn effects)
  class Particle {
    constructor(x, y, color, type = 'star') {
      this.x = x;
      this.y = y;
      this.color = color;
      this.type = type;
      this.vx = (Math.random() - 0.5) * 3;
      this.vy = (Math.random() - 0.5) * 3 - 1;
      this.life = 1;
      this.decay = 0.02 + Math.random() * 0.02;
      this.size = 3 + Math.random() * 4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }
    update(dt) {
      this.x += this.vx * dt * 0.05;
      this.y += this.vy * dt * 0.05;
      this.vy += 0.05 * dt * 0.05;
      this.life -= this.decay * dt * 0.05;
      this.rotation += this.rotSpeed * dt * 0.05;
      return this.life > 0;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      if (this.type === 'star') {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6;
        // Draw star shape
        const spikes = 4, outerR = this.size, innerR = this.size * 0.4;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes;
          i === 0 ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
                   : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
      } else if (this.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Canvas Fish Object (visual only)
  class CanvasFish {
    constructor(fishData) {
      this.id = fishData.id;
      this.typeId = fishData.typeId;
      this.typeData = FISH_TYPES.find(f => f.id === fishData.typeId);
      this.x = Math.random() * W;
      this.y = 60 + Math.random() * (H - 120);
      this.vx = (Math.random() < 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.8);
      this.vy = (Math.random() - 0.5) * 0.4;
      this.targetX = Math.random() * W;
      this.targetY = 60 + Math.random() * (H - 120);
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleAmp = 0.8 + Math.random() * 1.5;
      this.size = 14 + Math.random() * 10;
      this.glowPhase = Math.random() * Math.PI * 2;
      this.idleTimer = 0;
      this.sick = fishData.sick || false;
      this.health = fishData.health || 100;
      this.justBred = false;
      this.justBredTimer = 0;
      this.selected = false;
      this.sickCloudAngle = 0;
    }

    update(dt) {
      const speed = this.sick ? 0.3 : 1;

      // Drift toward target
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20) {
        // Pick new target
        this.targetX = 30 + Math.random() * (W - 60);
        this.targetY = 40 + Math.random() * (H - 80);
      }

      this.vx += (dx / dist) * 0.02 * speed * dt * 0.05;
      this.vy += (dy / dist) * 0.02 * speed * dt * 0.05;

      // Dampen velocity
      this.vx *= 0.97;
      this.vy *= 0.97;

      // Clamp speed
      const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const maxSpd = this.sick ? 0.8 : 2.5;
      if (spd > maxSpd) {
        this.vx = (this.vx / spd) * maxSpd;
        this.vy = (this.vy / spd) * maxSpd;
      }

      this.x += this.vx * dt * 0.05;
      this.y += this.vy * dt * 0.05;

      // Boundary bouncing
      if (this.x < 20) { this.x = 20; this.vx = Math.abs(this.vx); }
      if (this.x > W - 20) { this.x = W - 20; this.vx = -Math.abs(this.vx); }
      if (this.y < 30) { this.y = 30; this.vy = Math.abs(this.vy); }
      if (this.y > H - 30) { this.y = H - 30; this.vy = -Math.abs(this.vy); }

      this.wobble += 0.06 * dt * 0.05;
      this.glowPhase += 0.04 * dt * 0.05;
      this.sickCloudAngle += 0.03 * dt * 0.05;

      if (this.justBred) {
        this.justBredTimer -= dt;
        if (this.justBredTimer <= 0) this.justBred = false;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Flip based on direction
      const flipX = this.vx < 0 ? -1 : 1;
      ctx.scale(flipX, 1);

      // Glow for ready/special states
      if (this.justBred || this.selected) {
        ctx.shadowColor = this.typeData.glowColor;
        ctx.shadowBlur = 16 + Math.sin(this.glowPhase) * 6;
      }

      // Sick tint
      const alpha = this.sick ? 0.6 + Math.sin(Date.now() * 0.003) * 0.2 : 1;
      ctx.globalAlpha = alpha;

      // Fish body (emoji rendered as text)
      ctx.font = `${this.size * 2}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Tail wobble
      const tailBob = Math.sin(this.wobble) * this.wobbleAmp;
      ctx.rotate(tailBob * 0.04);

      ctx.fillText(this.typeData.emoji, 0, 0);

      ctx.restore();

      // Sick cloud
      if (this.sick) {
        ctx.save();
        ctx.translate(this.x, this.y - this.size * 1.5);
        for (let i = 0; i < 3; i++) {
          const angle = this.sickCloudAngle + i * (Math.PI * 2 / 3);
          const cx = Math.cos(angle) * 6;
          const cy = Math.sin(angle) * 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(150,150,150,0.5)';
          ctx.fill();
        }
        ctx.restore();
      }

      // Breed sparkle
      if (this.justBred) {
        ctx.save();
        ctx.translate(this.x, this.y);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + this.glowPhase;
          const r = this.size * 1.8;
          const sx = Math.cos(angle) * r;
          const sy = Math.sin(angle) * r;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fillStyle = this.typeData.glowColor;
          ctx.shadowColor = this.typeData.glowColor;
          ctx.shadowBlur = 6;
          ctx.fill();
        }
        ctx.restore();
      }

      // Selection highlight
      if (this.selected) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.rect(-this.size * 1.2, -this.size * 1.2, this.size * 2.4, this.size * 2.4);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function init() {
    canvas = document.getElementById('tank-canvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    // Generate bubbles
    for (let i = 0; i < 25; i++) {
      const b = new Bubble();
      b.y = Math.random() * H; // Start spread out
      bubbles.push(b);
    }

    // Generate decorations (seaweed, rocks)
    generateDecorations();

    // Start render loop
    requestAnimationFrame(loop);
  }

  function resize() {
    const area = document.getElementById('tank-area');
    canvas.width = area.offsetWidth;
    canvas.height = area.offsetHeight;
    W = canvas.width;
    H = canvas.height;

    // Regenerate decorations on resize
    if (decorations.length) generateDecorations();
  }

  function generateDecorations() {
    decorations = [];
    const numRocks = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numRocks; i++) {
      decorations.push({
        type: 'rock',
        x: 20 + Math.random() * (W - 40),
        y: H - 15 - Math.random() * 15,
        size: 8 + Math.random() * 16,
        color: `hsl(200, ${20 + Math.random() * 20}%, ${20 + Math.random() * 15}%)`,
      });
    }
    const numWeed = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numWeed; i++) {
      decorations.push({
        type: 'weed',
        x: 15 + Math.random() * (W - 30),
        y: H,
        height: 30 + Math.random() * 50,
        segments: 4 + Math.floor(Math.random() * 4),
        phase: Math.random() * Math.PI * 2,
        color: `hsl(${140 + Math.random() * 40}, 80%, ${20 + Math.random() * 20}%)`,
      });
    }
  }

  function spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, color, Math.random() < 0.5 ? 'star' : 'circle'));
    }
  }

  function getFishObjects() {
    return _canvasFish;
  }

  let _canvasFish = [];

  function syncFish(gameFish) {
    // Remove fish that are no longer in game
    _canvasFish = _canvasFish.filter(cf => gameFish.some(gf => gf.id === cf.id));

    // Add new fish
    gameFish.forEach(gf => {
      if (!_canvasFish.find(cf => cf.id === gf.id)) {
        const cf = new CanvasFish(gf);
        _canvasFish.push(cf);
        // Spawn particles at center
        spawnParticles(W / 2, H / 2, FISH_TYPES.find(f => f.id === gf.typeId).glowColor, 6);
      }
    });

    // Update sick/health state
    _canvasFish.forEach(cf => {
      const gf = gameFish.find(g => g.id === cf.id);
      if (gf) {
        cf.sick = gf.sick;
        cf.health = gf.health;
        cf.selected = gf.id === GameState.selectedFishId;
      }
    });
  }

  function triggerBreedEffect(fishId) {
    const cf = _canvasFish.find(f => f.id === fishId);
    if (cf) {
      cf.justBred = true;
      cf.justBredTimer = 2000;
      spawnParticles(cf.x, cf.y, cf.typeData.glowColor, 12);
    }
  }

  function drawBackground() {
    // Base gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#001a3d');
    grad.addColorStop(0.3, '#002255');
    grad.addColorStop(0.7, '#001a44');
    grad.addColorStop(1, '#001030');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Caustics effect (light ripples on bottom)
    ctx.save();
    const time = Date.now() * 0.001;
    for (let i = 0; i < 8; i++) {
      const x = (i / 8) * W + Math.sin(time * 0.7 + i) * 30;
      const y = H - 20 + Math.sin(time * 0.5 + i * 0.7) * 10;
      const grad2 = ctx.createRadialGradient(x, y, 0, x, y, 40 + i * 5);
      grad2.addColorStop(0, 'rgba(0,200,255,0.04)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  function drawDecorations(time) {
    decorations.forEach(d => {
      if (d.type === 'rock') {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.beginPath();
        ctx.ellipse(0, 0, d.size * 1.4, d.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      } else if (d.type === 'weed') {
        ctx.save();
        ctx.translate(d.x, d.y);
        const segH = d.height / d.segments;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let s = 0; s < d.segments; s++) {
          const sway = Math.sin(time * 0.7 + d.phase + s * 0.5) * (s + 1) * 3;
          const sy = -segH * (s + 1);
          ctx.quadraticCurveTo(sway, sy + segH / 2, sway * 0.8, sy);
        }
        ctx.lineWidth = 3 - d.segments * 0.1;
        ctx.strokeStyle = d.color;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  function drawGrid() {
    // Subtle grid overlay for retro feel
    ctx.save();
    ctx.strokeStyle = 'rgba(0,245,255,0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSand() {
    // Sandy bottom
    const sandGrad = ctx.createLinearGradient(0, H - 20, 0, H);
    sandGrad.addColorStop(0, 'rgba(180,140,80,0.3)');
    sandGrad.addColorStop(1, 'rgba(120,90,50,0.5)');
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, H - 10);
    // Wavy sand
    const time = Date.now() * 0.0003;
    for (let x = 0; x <= W; x += 20) {
      ctx.lineTo(x, H - 10 + Math.sin(x * 0.05 + time) * 4);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
  }

  function loop(timestamp) {
    animFrame = requestAnimationFrame(loop);
    const dt = Math.min(timestamp - lastTimestamp, 50); // cap at 50ms
    lastTimestamp = timestamp;
    frameCount++;

    const time = timestamp * 0.001;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Draw layers
    drawBackground();
    drawGrid();
    drawDecorations(time);
    drawSand();

    // Update & draw bubbles
    bubbles.forEach(b => {
      b.update(dt);
      b.draw(ctx);
    });
    if (frameCount % 120 === 0 && bubbles.length < 30) bubbles.push(new Bubble());

    // Update & draw fish
    _canvasFish.forEach(cf => {
      cf.update(dt);
      cf.draw(ctx);
    });

    // Update & draw particles
    particles = particles.filter(p => {
      p.update(dt);
      p.draw(ctx);
      return p.life > 0;
    });

    // Occasional ambient bubbles from canvas
    if (frameCount % 60 === 0 && Math.random() < 0.3) {
      AudioEngine.sfxBubble && AudioEngine.sfxBubble();
    }
  }

  function getCanvasFishAt(px, py, radius = 25) {
    return _canvasFish.find(cf => {
      const dx = cf.x - px;
      const dy = cf.y - py;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });
  }

  return { init, syncFish, triggerBreedEffect, spawnParticles, getCanvasFishAt, getFishObjects };
})();


// ─────────────────────────────────────────────
// SECTION 5: UI MANAGER
// ─────────────────────────────────────────────

const UI = (() => {

  function formatGold(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }

  function updateHeader() {
    const gs = GameState;
    document.getElementById('hdr-level').textContent = String(gs.level).padStart(2, '0');
    document.getElementById('hdr-fish').textContent = gs.fish.length;
    // Play time
    const elapsed = Math.floor((Date.now() - gs.playStartTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('hdr-time').textContent = `${mins}:${secs}`;
  }

  function updateFooter() {
    const gs = GameState;
    document.getElementById('gold-display').textContent = formatGold(gs.gold);
    document.getElementById('food-display').textContent = gs.food;

    const expNeeded = EXP_TABLE[Math.min(gs.level, 50)];
    const pct = gs.level >= 50 ? 100 : (gs.exp / expNeeded * 100);
    document.getElementById('exp-bar-fill').style.width = pct + '%';
    document.getElementById('exp-bar-text').textContent = gs.level >= 50
      ? 'MAX'
      : `${gs.exp} / ${expNeeded}`;
  }

  function buildShopPanel() {
    const gs = GameState;
    const fishList = document.getElementById('shop-fish-list');
    const itemList = document.getElementById('shop-items-list');

    fishList.innerHTML = '';
    itemList.innerHTML = '';

    FISH_TYPES.forEach(ft => {
      const locked = gs.level < ft.requiredLevel;
      const canAfford = gs.gold >= ft.buyPrice;
      const full = gs.fish.length >= gs.maxFish;

      const el = document.createElement('div');
      el.className = `shop-item${locked ? ' locked' : ''}`;
      el.innerHTML = `
        <div class="shop-item-header">
          <span class="shop-item-icon">${ft.emoji}</span>
          <span class="shop-item-name">${ft.name}</span>
          <span class="shop-item-rarity" style="color:${RARITY_COLORS[ft.rarity]}">${ft.rarityIcon}</span>
        </div>
        <div class="shop-item-desc">${ft.desc}</div>
        <div class="shop-item-footer">
          <span class="shop-price">🪙 ${formatGold(ft.buyPrice)}</span>
          ${locked
            ? `<span style="font-family:'Press Start 2P',monospace;font-size:6px;color:#666">LVL ${ft.requiredLevel}</span>`
            : `<button class="shop-buy-btn" data-fish-id="${ft.id}" ${(!canAfford || full) ? 'disabled style="opacity:0.4"' : ''}>КУПИТЬ</button>`
          }
        </div>
      `;

      if (!locked) {
        el.querySelector('.shop-buy-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          Game.buyFish(ft.id);
        });
      }

      fishList.appendChild(el);
    });

    SHOP_ITEMS.forEach(item => {
      const canAfford = gs.gold >= item.price;
      const el = document.createElement('div');
      el.className = 'shop-item';
      el.innerHTML = `
        <div class="shop-item-header">
          <span class="shop-item-icon">${item.emoji}</span>
          <span class="shop-item-name">${item.name}</span>
        </div>
        <div class="shop-item-desc">${item.desc}</div>
        <div class="shop-item-footer">
          <span class="shop-price">🪙 ${item.price}</span>
          <button class="shop-buy-btn" data-item-id="${item.id}" ${!canAfford ? 'disabled style="opacity:0.4"' : ''}>КУПИТЬ</button>
        </div>
      `;
      el.querySelector('.shop-buy-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        Game.buyItem(item.id);
      });
      itemList.appendChild(el);
    });
  }

  function buildFishPanel() {
    const gs = GameState;
    const grid = document.getElementById('fish-grid');
    const countInfo = document.getElementById('fish-count-info');

    countInfo.textContent = `Рыб: ${gs.fish.length} / ${gs.maxFish} | Больных: ${gs.fish.filter(f => f.sick).length}`;

    grid.innerHTML = '';

    if (gs.fish.length === 0) {
      grid.innerHTML = '<div style="color:var(--text-dim);font-size:14px;text-align:center;padding:20px">Аквариум пуст.<br>Купите рыбок!</div>';
      return;
    }

    gs.fish.forEach(fish => {
      const ft = FISH_TYPES.find(f => f.id === fish.typeId);
      const hpPct = (fish.health / ft.maxHealth * 100).toFixed(0);
      const el = document.createElement('div');
      el.className = `fish-card${fish.sick ? ' sick' : ''}`;
      el.dataset.fishId = fish.id;
      el.innerHTML = `
        <div class="sell-overlay"><span class="sell-overlay-text">ПРОДАТЬ</span></div>
        <span class="fish-card-emoji">${ft.emoji}</span>
        <span class="fish-card-name">${ft.name}</span>
        <span class="fish-card-val">🪙 ${formatGold(Math.floor(ft.sellPrice * gs.sellMultiplier))}</span>
        <div class="fish-health-bar">
          <div class="fish-health-fill" style="width:${hpPct}%;background:${hpPct > 60 ? 'var(--neon-green)' : hpPct > 30 ? 'var(--neon-yellow)' : 'var(--neon-pink)'}"></div>
        </div>
        ${fish.sick ? '<span style="font-size:11px;color:var(--neon-pink)">🤒 БОЛЬНАЯ</span>' : ''}
      `;
      el.addEventListener('click', () => Game.openFishModal(fish.id));
      grid.appendChild(el);
    });
  }

  function buildUpgradePanel() {
    const gs = GameState;
    const list = document.getElementById('upgrade-list');
    list.innerHTML = '';

    UPGRADES.forEach(upg => {
      const stateUpg = gs.upgrades.find(u => u.id === upg.id);
      const currentLvl = stateUpg.level;
      const maxed = currentLvl >= upg.maxLevel;
      const cost = maxed ? 0 : upg.costs[currentLvl];
      const canAfford = gs.gold >= cost;

      const el = document.createElement('div');
      el.className = `upgrade-item${maxed ? ' maxed' : ''}`;

      let pips = '';
      for (let i = 0; i < upg.maxLevel; i++) {
        pips += `<div class="upgrade-pip${i < currentLvl ? ' filled' : ''}"></div>`;
      }

      el.innerHTML = `
        <div class="upgrade-name">${upg.emoji} ${upg.name}</div>
        <div style="font-size:14px;color:var(--text-dim);margin-bottom:4px">${upg.desc}</div>
        <div class="upgrade-level">${pips}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
          <span style="font-size:14px;color:var(--text-dim)">Уровень ${currentLvl}/${upg.maxLevel}</span>
          ${maxed
            ? '<span style="font-family:\'Press Start 2P\',monospace;font-size:6px;color:var(--neon-green)">МАКСИМУМ</span>'
            : `<button class="shop-buy-btn" data-upg-id="${upg.id}" ${!canAfford ? 'disabled style="opacity:0.4"' : ''}>
                🪙 ${formatGold(cost)}
              </button>`
          }
        </div>
      `;

      if (!maxed) {
        el.querySelector('.shop-buy-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          Game.buyUpgrade(upg.id);
        });
      }

      list.appendChild(el);
    });
  }

  function buildStatsPanel() {
    const gs = GameState;
    const statsList = document.getElementById('stats-list');
    const achList = document.getElementById('achievements-list');

    const elapsed = Math.floor((Date.now() - gs.playStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;

    statsList.innerHTML = `
      <div class="stat-row">
        <span class="sl">Золото на руках</span>
        <span class="sv">🪙 ${formatGold(gs.gold)}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Всего заработано</span>
        <span class="sv">🪙 ${formatGold(gs.stats.totalEarned)}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Рыб в аквариуме</span>
        <span class="sv">${gs.fish.length}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Рыб продано</span>
        <span class="sv">${gs.stats.fishSold}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Рыб вырождено</span>
        <span class="sv">${gs.stats.fishBred}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Рыб вылечено</span>
        <span class="sv">${gs.stats.fishHealed}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Рыб погибло</span>
        <span class="sv" style="color:var(--neon-pink)">${gs.stats.fishDied}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Кормлений</span>
        <span class="sv">${gs.stats.feedCount}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Время игры</span>
        <span class="sv">${hours}h ${mins}m ${secs}s</span>
      </div>
      <div class="stat-row">
        <span class="sl">Уровень</span>
        <span class="sv">${gs.level}</span>
      </div>
      <div class="stat-row">
        <span class="sl">Опыт</span>
        <span class="sv">${gs.exp} / ${gs.level >= 50 ? '---' : EXP_TABLE[gs.level]}</span>
      </div>
    `;

    achList.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
      const stateAch = gs.achievements.find(a => a.id === ach.id);
      const unlocked = stateAch && stateAch.unlocked;
      const el = document.createElement('div');
      el.className = `achievement${unlocked ? ' unlocked' : ''}`;
      el.innerHTML = `
        <span class="ach-icon" style="opacity:${unlocked ? 1 : 0.3}">${ach.emoji}</span>
        <div class="ach-info">
          <span class="ach-name" style="color:${unlocked ? 'var(--neon-yellow)' : 'var(--text-dim)'}">${ach.name}</span>
          <span class="ach-desc">${ach.desc}</span>
        </div>
        ${unlocked ? '<span style="font-size:12px;color:var(--neon-green)">✓</span>' : '<span style="font-size:12px;color:var(--text-dim)">?</span>'}
      `;
      achList.appendChild(el);
    });
  }

  function updateActivePanel() {
    const active = document.querySelector('.tab-btn.active')?.dataset.tab;
    if (active === 'shop') buildShopPanel();
    else if (active === 'fish') buildFishPanel();
    else if (active === 'upgrade') buildUpgradePanel();
    else if (active === 'stats') buildStatsPanel();
  }

  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function spawnFloatText(x, y, text, color) {
    const tank = document.getElementById('tank-area');
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color || '#ffd60a';
    tank.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  function showLevelUp(level) {
    const overlay = document.getElementById('levelup-overlay');
    document.getElementById('levelup-num').textContent = level;
    overlay.classList.add('active');

    // Spawn star particles
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.className = 'star-particle';
      el.textContent = ['⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 4)];
      el.style.left = (10 + Math.random() * 80) + 'vw';
      el.style.top = (10 + Math.random() * 80) + 'vh';
      el.style.animationDelay = Math.random() * 0.8 + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }

    const dismiss = () => {
      overlay.classList.remove('active');
      document.removeEventListener('keydown', dismiss);
      overlay.removeEventListener('click', dismiss);
    };

    document.addEventListener('keydown', dismiss);
    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
  }

  function openFishModal(fish, onSell, onHeal) {
    const ft = FISH_TYPES.find(f => f.id === fish.typeId);
    const gs = GameState;
    const sellPrice = Math.floor(ft.sellPrice * gs.sellMultiplier);
    const healCost = 200;

    document.getElementById('modal-title-text').textContent = `${ft.emoji} ${ft.name}`;

    const body = document.getElementById('modal-body');
    const hpPct = ((fish.health / ft.maxHealth) * 100).toFixed(0);
    const breedRemain = fish.nextBreedAt ? Math.max(0, Math.ceil((fish.nextBreedAt - Date.now()) / 1000)) : 0;

    body.innerHTML = `
      <div class="modal-fish-info">
        <span class="modal-fish-icon">${ft.emoji}</span>
        <div class="modal-fish-details">
          <div class="modal-fish-name">${ft.name}</div>
          <div class="modal-stat">
            <span class="ms-label">Редкость</span>
            <span class="ms-val" style="color:${RARITY_COLORS[ft.rarity]}">${ft.rarityIcon} ${ft.rarity.toUpperCase()}</span>
          </div>
          <div class="modal-stat">
            <span class="ms-label">Здоровье</span>
            <span class="ms-val" style="color:${hpPct > 60 ? 'var(--neon-green)' : hpPct > 30 ? 'var(--neon-yellow)' : 'var(--neon-pink)'}">${fish.health}/${ft.maxHealth}</span>
          </div>
          <div class="modal-stat">
            <span class="ms-label">Статус</span>
            <span class="ms-val" style="color:${fish.sick ? 'var(--neon-pink)' : 'var(--neon-green)'}">${fish.sick ? '🤒 БОЛЬНАЯ' : '✅ ЗДОРОВА'}</span>
          </div>
          <div class="modal-stat">
            <span class="ms-label">Размножение</span>
            <span class="ms-val">${breedRemain > 0 ? `${breedRemain}с` : '✅ ГОТОВА'}</span>
          </div>
          <div class="modal-stat">
            <span class="ms-label">Цена продажи</span>
            <span class="ms-val">🪙 ${formatGold(sellPrice)}</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px">
          <span style="color:var(--text-dim)">ЗДОРОВЬЕ</span>
          <span style="color:var(--text-dim)">${hpPct}%</span>
        </div>
        <div class="prog-bar">
          <div class="prog-fill hp" style="width:${hpPct}%"></div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="modal-btn sell" id="modal-sell-btn">💰 ПРОДАТЬ<br>🪙 ${formatGold(sellPrice)}</button>
        ${fish.sick ? `<button class="modal-btn heal" id="modal-heal-btn">💊 ЛЕЧИТЬ<br>🪙 ${healCost}</button>` : ''}
        <button class="modal-btn cancel" id="modal-cancel-btn">← НАЗАД</button>
      </div>
    `;

    document.getElementById('modal-sell-btn').onclick = onSell;
    document.getElementById('modal-cancel-btn').onclick = closeModal;
    if (fish.sick) {
      document.getElementById('modal-heal-btn').onclick = onHeal;
    }

    document.getElementById('modal-overlay').classList.add('active');
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    GameState.selectedFishId = null;
  }

  function update() {
    updateHeader();
    updateFooter();
    updateActivePanel();
  }

  return {
    update,
    buildShopPanel,
    buildFishPanel,
    buildUpgradePanel,
    buildStatsPanel,
    updateActivePanel,
    showToast,
    spawnFloatText,
    showLevelUp,
    openFishModal,
    closeModal,
    formatGold,
  };
})();


// ─────────────────────────────────────────────
// SECTION 6: CORE GAME LOGIC
// ─────────────────────────────────────────────

const Game = (() => {
  let gameLoop;
  let tickInterval;
  let uiInterval;
  let saveInterval;

  function createFish(typeId) {
    const ft = FISH_TYPES.find(f => f.id === typeId);
    const gs = GameState;
    const breedTime = ft.breedTime * gs.breedMultiplier;
    return {
      id: gs.nextFishId++,
      typeId,
      health: ft.maxHealth,
      sick: false,
      nextBreedAt: Date.now() + breedTime,
      age: 0,
    };
  }

  function buyFish(typeId) {
    const gs = GameState;
    const ft = FISH_TYPES.find(f => f.id === typeId);

    if (!ft || gs.level < ft.requiredLevel) {
      AudioEngine.sfxError();
      UI.showToast('Недостаточно уровня!', 'error');
      return;
    }

    if (gs.fish.length >= gs.maxFish) {
      AudioEngine.sfxError();
      UI.showToast(`Аквариум полон! (${gs.maxFish} рыб)`, 'warn');
      return;
    }

    if (gs.gold < ft.buyPrice) {
      AudioEngine.sfxError();
      UI.showToast('Недостаточно монет!', 'error');
      return;
    }

    gs.gold -= ft.buyPrice;
    const fish = createFish(typeId);
    gs.fish.push(fish);

    AudioEngine.sfxCoin();
    AudioEngine.sfxSparkle();
    UI.showToast(`${ft.emoji} ${ft.name} куплена!`, 'success');

    Renderer.syncFish(gs.fish);
    addExp(ft.expReward);
    UI.update();
  }

  function sellFish(fishId) {
    const gs = GameState;
    const fish = gs.fish.find(f => f.id === fishId);
    if (!fish) return;

    const ft = FISH_TYPES.find(f => f.id === fish.typeId);
    const price = Math.floor(ft.sellPrice * gs.sellMultiplier);

    gs.gold += price;
    gs.stats.totalEarned += price;
    gs.stats.fishSold++;
    gs.stats.fishSoldTypes.add(fish.typeId);
    gs.fish = gs.fish.filter(f => f.id !== fishId);
    gs.selectedFishId = null;

    // Float text on tank
    const tank = document.getElementById('tank-area');
    UI.spawnFloatText(
      30 + Math.random() * (tank.offsetWidth - 60),
      50 + Math.random() * (tank.offsetHeight - 100),
      `+${UI.formatGold(price)} 🪙`,
      '#ffd60a'
    );

    AudioEngine.sfxCaChingBig();
    UI.showToast(`${ft.emoji} продана за ${UI.formatGold(price)} 🪙`, 'success');
    UI.closeModal();

    Renderer.syncFish(gs.fish);
    addExp(ft.expReward * 2);
    checkAchievements();
    UI.update();
  }

  function sellAll() {
    const gs = GameState;
    if (gs.fish.length === 0) {
      UI.showToast('Нечего продавать!', 'warn');
      AudioEngine.sfxError();
      return;
    }

    let total = 0;
    let count = 0;
    gs.fish.forEach(fish => {
      const ft = FISH_TYPES.find(f => f.id === fish.typeId);
      const price = Math.floor(ft.sellPrice * gs.sellMultiplier);
      total += price;
      gs.stats.fishSold++;
      gs.stats.fishSoldTypes.add(fish.typeId);
      gs.stats.totalEarned += price;
      count++;
    });

    gs.gold += total;
    gs.fish = [];
    gs.selectedFishId = null;

    AudioEngine.sfxCaChingBig();
    UI.showToast(`Продано ${count} рыб за ${UI.formatGold(total)} 🪙!`, 'success');

    const tank = document.getElementById('tank-area');
    UI.spawnFloatText(
      tank.offsetWidth / 2 - 40,
      tank.offsetHeight / 2,
      `+${UI.formatGold(total)} 🪙`,
      '#ffd60a'
    );

    Renderer.syncFish(gs.fish);
    checkAchievements();
    UI.update();
  }

  function healFish(fishId) {
    const gs = GameState;
    const fish = gs.fish.find(f => f.id === fishId);
    if (!fish || !fish.sick) return;

    const healCost = 200;
    if (gs.gold < healCost) {
      AudioEngine.sfxError();
      UI.showToast('Недостаточно монет для лечения!', 'error');
      return;
    }

    gs.gold -= healCost;
    fish.sick = false;
    const ft = FISH_TYPES.find(f => f.id === fish.typeId);
    fish.health = ft.maxHealth;
    gs.stats.fishHealed++;
    gs.selectedFishId = null;

    AudioEngine.sfxHeal();
    UI.showToast(`${ft.emoji} вылечена!`, 'success');
    UI.closeModal();
    checkAchievements();
    UI.update();
  }

  function healAll() {
    const gs = GameState;
    const sickFish = gs.fish.filter(f => f.sick);
    if (sickFish.length === 0) {
      UI.showToast('Нет больных рыб!', 'warn');
      AudioEngine.sfxError();
      return;
    }

    const healCost = 200 * sickFish.length;
    if (gs.gold < healCost) {
      AudioEngine.sfxError();
      UI.showToast(`Нужно ${UI.formatGold(healCost)} для лечения всех!`, 'error');
      return;
    }

    gs.gold -= healCost;
    sickFish.forEach(fish => {
      fish.sick = false;
      const ft = FISH_TYPES.find(f => f.id === fish.typeId);
      fish.health = ft.maxHealth;
      gs.stats.fishHealed++;
    });

    AudioEngine.sfxHeal();
    UI.showToast(`Вылечено ${sickFish.length} рыб!`, 'success');
    checkAchievements();
    UI.update();
  }

  function feedAll() {
    const gs = GameState;
    if (gs.food <= 0) {
      AudioEngine.sfxError();
      UI.showToast('Нет корма! Купите в магазине.', 'error');
      return;
    }

    const totalCost = gs.fish.reduce((sum, fish) => {
      const ft = FISH_TYPES.find(f => f.id === fish.typeId);
      return sum + (ft.foodCost || 2);
    }, 0);

    if (gs.food < totalCost) {
      AudioEngine.sfxError();
      UI.showToast(`Мало корма! Нужно ${totalCost}, есть ${gs.food}`, 'warn');
      return;
    }

    gs.food -= totalCost;
    gs.stats.feedCount++;

    // Reset breed timers slightly
    gs.fish.forEach(fish => {
      const ft = FISH_TYPES.find(f => f.id === fish.typeId);
      if (fish.nextBreedAt > Date.now()) {
        fish.nextBreedAt -= ft.breedTime * 0.1 * gs.breedMultiplier;
      }
    });

    AudioEngine.sfxFeed();
    UI.showToast(`Все рыбы покормлены! (-${totalCost} 🍖)`, 'success');

    // Spawn food particles on canvas click
    const tank = document.getElementById('tank-area');
    for (let i = 0; i < 15; i++) {
      const el = document.createElement('div');
      el.className = 'food-particle';
      el.style.left = (20 + Math.random() * (tank.offsetWidth - 40)) + 'px';
      el.style.top = (10 + Math.random() * 30) + 'px';
      el.style.animationDelay = Math.random() * 0.5 + 's';
      tank.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }

    UI.update();
  }

  function buyItem(itemId) {
    const gs = GameState;
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (gs.gold < item.price) {
      AudioEngine.sfxError();
      UI.showToast('Недостаточно монет!', 'error');
      return;
    }

    gs.gold -= item.price;
    item.action(gs);

    AudioEngine.sfxCoin();
    UI.showToast(`${item.emoji} ${item.name} куплено!`, 'success');
    UI.update();
  }

  function buyUpgrade(upgId) {
    const gs = GameState;
    const upg = UPGRADES.find(u => u.id === upgId);
    const stateUpg = gs.upgrades.find(u => u.id === upgId);
    if (!upg || !stateUpg) return;

    const cost = upg.costs[stateUpg.level];
    if (gs.gold < cost) {
      AudioEngine.sfxError();
      UI.showToast('Недостаточно монет!', 'error');
      return;
    }

    if (stateUpg.level >= upg.maxLevel) {
      UI.showToast('Максимальный уровень!', 'warn');
      return;
    }

    gs.gold -= cost;
    stateUpg.level++;

    // Apply upgrade effect
    applyUpgrades();

    AudioEngine.sfxSparkle();
    AudioEngine.sfxCoin();
    UI.showToast(`${upg.emoji} ${upg.name} улучшено до ур.${stateUpg.level}!`, 'success');
    addExp(20 * stateUpg.level);
    UI.update();
  }

  function applyUpgrades() {
    const gs = GameState;

    // Reset to base values
    gs.maxFish = 15;
    gs.maxFood = 200;
    gs.breedMultiplier = 1;
    gs.sellMultiplier = 1;
    gs.sickMultiplier = 1;
    gs.autoFeedRate = 0;

    gs.upgrades.forEach(stateUpg => {
      const upg = UPGRADES.find(u => u.id === stateUpg.id);
      if (!upg || stateUpg.level === 0) return;
      const effects = upg.effect(stateUpg.level);
      Object.assign(gs, effects);
    });
  }

  function openFishModal(fishId) {
    const gs = GameState;
    const fish = gs.fish.find(f => f.id === fishId);
    if (!fish) return;

    gs.selectedFishId = fishId;
    AudioEngine.sfxClick();

    UI.openFishModal(
      fish,
      () => sellFish(fishId),
      () => healFish(fishId)
    );
  }

  function addExp(amount) {
    const gs = GameState;
    if (gs.level >= 50) return;

    gs.exp += amount;

    const needed = EXP_TABLE[gs.level];
    if (gs.exp >= needed) {
      gs.exp -= needed;
      gs.level++;
      onLevelUp(gs.level);
    }
  }

  function onLevelUp(level) {
    AudioEngine.sfxLevelUp();
    UI.showLevelUp(level);
    UI.showToast(`🎉 Уровень ${level}! Новые рыбы разблокированы!`, 'success');
    checkAchievements();
  }

  function checkAchievements() {
    const gs = GameState;
    ACHIEVEMENTS.forEach((ach, idx) => {
      const stateAch = gs.achievements[idx];
      if (!stateAch.unlocked && ach.check(gs)) {
        stateAch.unlocked = true;
        setTimeout(() => {
          AudioEngine.sfxSparkle();
          UI.showToast(`🏆 Достижение: "${ach.name}" ${ach.emoji}`, 'success');
        }, 500);
      }
    });
  }

  // MAIN GAME TICK (every 500ms)
  function gameTick() {
    const gs = GameState;
    const now = Date.now();

    // Fish health decay and disease
    gs.fish.forEach(fish => {
      const ft = FISH_TYPES.find(f => f.id === fish.typeId);
      if (!ft) return;

      // Health slowly decreases if not fed (simplified: based on food level)
      if (gs.food < 10) {
        fish.health = Math.max(0, fish.health - 0.5);
      }

      // Death from zero health
      if (fish.health <= 0 && !fish.dead) {
        fish.dead = true;
        setTimeout(() => {
          gs.fish = gs.fish.filter(f => f.id !== fish.id);
          gs.stats.fishDied++;
          AudioEngine.sfxDeath();
          UI.showToast(`💀 ${ft.name} погибла!`, 'error');
          Renderer.syncFish(gs.fish);
          UI.update();
        }, 1000);
      }

      // Disease check
      if (!fish.sick && !fish.dead) {
        const sickChance = ft.sickChance * gs.sickMultiplier;
        if (Math.random() < sickChance) {
          fish.sick = true;
          AudioEngine.sfxSick();
          UI.showToast(`🤒 ${ft.name} заболела!`, 'warn');
        }
      }

      // Health regen if well-fed and healthy
      if (!fish.sick && gs.food > 50 && fish.health < ft.maxHealth) {
        fish.health = Math.min(ft.maxHealth, fish.health + 0.2);
      }

      // Breeding
      if (!fish.sick && !fish.dead && fish.nextBreedAt && now >= fish.nextBreedAt) {
        if (gs.fish.length < gs.maxFish && gs.food >= ft.foodCost) {
          // Breed!
          const newFish = createFish(fish.typeId);
          gs.fish.push(newFish);
          gs.stats.fishBred++;
          gs.food = Math.max(0, gs.food - ft.foodCost);

          fish.nextBreedAt = now + ft.breedTime * gs.breedMultiplier;

          AudioEngine.sfxBreed();
          UI.showToast(`🥚 Новая ${ft.name} появилась!`, 'success');

          Renderer.triggerBreedEffect(fish.id);
          Renderer.syncFish(gs.fish);
          addExp(ft.expReward);
          checkAchievements();
        } else if (gs.fish.length < gs.maxFish) {
          // No food — delay
          fish.nextBreedAt = now + 10000;
        } else {
          // Tank full — reset timer
          fish.nextBreedAt = now + 30000;
        }
      }
    });

    // Auto feed
    if (gs.autoFeedRate > 0) {
      const autoFeedInterval = 60000 / gs.autoFeedRate;
      if (now - gs.lastAutoFeed >= autoFeedInterval) {
        gs.lastAutoFeed = now;
        const totalCost = gs.fish.reduce((sum, fish) => {
          const ft = FISH_TYPES.find(f => f.id === fish.typeId);
          return sum + (ft ? ft.foodCost : 0);
        }, 0);
        if (gs.food >= totalCost && totalCost > 0) {
          gs.food = Math.max(0, gs.food - totalCost);
          gs.stats.feedCount++;
        }
      }
    }

    // Update play time
    gs.stats.playTime = Math.floor((Date.now() - gs.playStartTime) / 1000);

    // Sync renderer
    Renderer.syncFish(gs.fish);
  }

  function saveGame() {
    try {
      const gs = GameState;
      const saveData = {
        gold: gs.gold,
        food: gs.food,
        maxFood: gs.maxFood,
        medicine: gs.medicine,
        fish: gs.fish,
        level: gs.level,
        exp: gs.exp,
        nextFishId: gs.nextFishId,
        maxFish: gs.maxFish,
        upgrades: gs.upgrades,
        achievements: gs.achievements,
        breedMultiplier: gs.breedMultiplier,
        sellMultiplier: gs.sellMultiplier,
        sickMultiplier: gs.sickMultiplier,
        autoFeedRate: gs.autoFeedRate,
        stats: {
          ...gs.stats,
          fishSoldTypes: Array.from(gs.stats.fishSoldTypes || []),
        },
        playStartTime: gs.playStartTime,
        saveTime: Date.now(),
      };
      localStorage.setItem('fishtycoon_save', JSON.stringify(saveData));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem('fishtycoon_save');
      if (!raw) return false;

      const data = JSON.parse(raw);
      const gs = GameState;

      gs.gold = data.gold || 500;
      gs.food = data.food || 100;
      gs.maxFood = data.maxFood || 200;
      gs.medicine = data.medicine || 0;
      gs.fish = (data.fish || []).map(f => ({
        ...f,
        nextBreedAt: f.nextBreedAt || Date.now() + 30000,
      }));
      gs.level = data.level || 1;
      gs.exp = data.exp || 0;
      gs.nextFishId = data.nextFishId || 1;
      gs.maxFish = data.maxFish || 15;
      gs.upgrades = data.upgrades || UPGRADES.map(u => ({ id: u.id, level: 0 }));
      gs.achievements = data.achievements || ACHIEVEMENTS.map(a => ({ id: a.id, unlocked: false }));
      gs.breedMultiplier = data.breedMultiplier || 1;
      gs.sellMultiplier = data.sellMultiplier || 1;
      gs.sickMultiplier = data.sickMultiplier || 1;
      gs.autoFeedRate = data.autoFeedRate || 0;
      gs.stats = {
        fishSold: data.stats?.fishSold || 0,
        fishBred: data.stats?.fishBred || 0,
        fishHealed: data.stats?.fishHealed || 0,
        fishDied: data.stats?.fishDied || 0,
        totalEarned: data.stats?.totalEarned || 0,
        fishSoldTypes: new Set(data.stats?.fishSoldTypes || []),
        playTime: data.stats?.playTime || 0,
        feedCount: data.stats?.feedCount || 0,
      };
      gs.playStartTime = data.playStartTime || Date.now();

      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }

  function start() {
    const loaded = loadGame();
    applyUpgrades();

    // Init renderer
    Renderer.init();
    Renderer.syncFish(GameState.fish);

    // Game tick (500ms)
    tickInterval = setInterval(gameTick, 500);

    // UI update (1s)
    uiInterval = setInterval(() => {
      UI.update();
      checkAchievements();
    }, 1000);

    // Auto-save (30s)
    saveInterval = setInterval(saveGame, 30000);

    // Initial UI build
    UI.update();

    // Setup event handlers
    setupEventHandlers();

    if (loaded) {
      UI.showToast('Игра загружена!', 'success');
    } else {
      UI.showToast('Добро пожаловать в Fish Tycoon!', 'success');
    }
  }

  function setupEventHandlers() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById('panel-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
        AudioEngine.sfxClick();
        UI.updateActivePanel();
      });
    });

    // Footer buttons
    document.getElementById('btn-sell-all').addEventListener('click', () => {
      AudioEngine.sfxClick();
      sellAll();
    });

    document.getElementById('btn-heal-all').addEventListener('click', () => {
      AudioEngine.sfxClick();
      healAll();
    });

    document.getElementById('btn-feed-all').addEventListener('click', () => {
      AudioEngine.sfxClick();
      feedAll();
    });

    // Mute button
    document.getElementById('mute-btn').addEventListener('click', () => {
      const muted = AudioEngine.toggleMute();
      document.getElementById('mute-btn').textContent = muted ? '🔇 SFX' : '🔊 SFX';
    });

    // Modal close
    document.getElementById('modal-close-btn').addEventListener('click', UI.closeModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-overlay')) UI.closeModal();
    });

    // Click on tank to feed
    document.getElementById('tank-area').addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Check if clicked on a fish
      const clickedFish = Renderer.getCanvasFishAt(px, py);
      if (clickedFish) {
        openFishModal(clickedFish.id);
        return;
      }

      // Otherwise: spawn food
      const gs = GameState;
      if (gs.food > 0) {
        const tankEl = document.getElementById('tank-area');
        for (let i = 0; i < 8; i++) {
          const el = document.createElement('div');
          el.className = 'food-particle';
          el.style.left = (px - 20 + Math.random() * 40) + 'px';
          el.style.top = py + 'px';
          el.style.animationDelay = Math.random() * 0.3 + 's';
          tankEl.appendChild(el);
          setTimeout(() => el.remove(), 2000);
        }
        gs.food = Math.max(0, gs.food - 2);
        AudioEngine.sfxFeed();
      } else {
        AudioEngine.sfxError();
        UI.showToast('Нет корма!', 'warn');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('modal-overlay').classList.contains('active')) return;
      switch(e.key) {
        case '1': document.querySelector('[data-tab="shop"]')?.click(); break;
        case '2': document.querySelector('[data-tab="fish"]')?.click(); break;
        case '3': document.querySelector('[data-tab="upgrade"]')?.click(); break;
        case '4': document.querySelector('[data-tab="stats"]')?.click(); break;
        case 'f': feedAll(); break;
        case 's': sellAll(); break;
        case 'h': healAll(); break;
      }
    });
  }

  return {
    start,
    buyFish,
    buyItem,
    buyUpgrade,
    sellFish,
    sellAll,
    healFish,
    healAll,
    feedAll,
    openFishModal,
    saveGame,
  };
})();


// ─────────────────────────────────────────────
// SECTION 7: INTRO / BOOT SEQUENCE
// ─────────────────────────────────────────────

(function bootSequence() {
  const intro = document.getElementById('intro-screen');
  const startBtn = document.getElementById('start-btn');

  // Retro boot text effect on title
  const title = document.getElementById('intro-title');
  const originalText = 'FISH\nTYCOON';
  let charIndex = 0;

  function typeTitle() {
    if (charIndex <= originalText.length) {
      title.innerHTML = originalText.substring(0, charIndex).replace('\n', '<br>') + (charIndex < originalText.length ? '█' : '');
      charIndex++;
      setTimeout(typeTitle, 80);
    }
  }

  setTimeout(typeTitle, 500);

  // Random glitch effect
  setInterval(() => {
    if (Math.random() < 0.05) {
      title.style.transform = `translateX(${Math.random() * 4 - 2}px)`;
      title.style.textShadow = `${Math.random() * 8}px 0 #ff006e, ${-Math.random() * 8}px 0 #00f5ff, 0 0 20px #00f5ff`;
      setTimeout(() => {
        title.style.transform = '';
        title.style.textShadow = '';
      }, 100);
    }
  }, 200);

  // Coin insert sound
  startBtn.addEventListener('mouseenter', () => {
    AudioEngine.sfxClick && AudioEngine.sfxClick();
  });

  startBtn.addEventListener('click', () => {
    // Init audio on first user gesture
    AudioEngine.init();

    // Fade out intro
    intro.style.transition = 'opacity 0.5s';
    intro.style.opacity = '0';
    setTimeout(() => {
      intro.style.display = 'none';
      Game.start();
    }, 500);
  });

  // Also allow Enter/Space to start
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && intro.style.display !== 'none') {
      startBtn.click();
    }
  });
})();


// ─────────────────────────────────────────────
// SECTION 8: ADDITIONAL VISUAL EFFECTS
// ─────────────────────────────────────────────

// CRT flicker effect
(function crtFlicker() {
  const body = document.body;
  setInterval(() => {
    if (Math.random() < 0.01) {
      body.style.filter = 'brightness(0.95) contrast(1.02)';
      setTimeout(() => { body.style.filter = ''; }, 80);
    }
    // Color shift glitch
    if (Math.random() < 0.005) {
      body.style.filter = 'hue-rotate(5deg) brightness(1.05)';
      setTimeout(() => { body.style.filter = ''; }, 120);
    }
  }, 500);
})();

// Retro scanline shimmer
(function scanlineShimmer() {
  let pos = 0;
  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed; left: 0; right: 0; height: 3px;
    background: rgba(255,255,255,0.04);
    pointer-events: none; z-index: 9997;
    transition: top 0.05s linear;
  `;
  document.body.appendChild(el);

  setInterval(() => {
    pos = (pos + 4) % window.innerHeight;
    el.style.top = pos + 'px';
  }, 50);
})();

// ─────────────────────────────────────────────
// SECTION 9: RESPONSIVE CANVAS HANDLING
// ─────────────────────────────────────────────

window.addEventListener('resize', () => {
  // Canvas resize is handled in Renderer
  // Just trigger UI update
  setTimeout(() => UI.update && UI.update(), 100);
});

// Prevent context menu on right click in game area
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('#game-container')) e.preventDefault();
});

// Page visibility API — pause/resume
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    Game.saveGame && Game.saveGame();
  }
});

// Before unload save
window.addEventListener('beforeunload', () => {
  Game.saveGame && Game.saveGame();
});

// Console easter egg
console.log('%c🐠 FISH TYCOON 🐠', 'font-size:24px; color:#00f5ff; text-shadow: 0 0 10px #00f5ff');
console.log('%cАквариумный Магнат | Retro Edition 1987', 'font-size:12px; color:#aaa');
console.log('%cКлавиши: 1-4 = вкладки | F = кормить | S = продать всё | H = лечить всё', 'font-size:11px; color:#666');
