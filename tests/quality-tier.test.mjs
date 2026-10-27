// tests/quality-tier.test.mjs
// Automated tests for crash-loop guard & quality-tier logic across 12 scenarios

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

let sharedLocalStorage = new MemoryStorage();
let currentSessionStorage = new MemoryStorage();
let currentSearch = '';
let currentWidth = 1440;
let currentHidden = false;
let currentMediaMatches = {};
let listeners = new Map();

function setupBrowserEnv(options = {}) {
  const {
    search = '',
    width = 1440,
    hidden = false,
    media = {},
    newTab = false,
    freshLocal = false
  } = options;

  if (freshLocal) {
    sharedLocalStorage = new MemoryStorage();
  }
  if (newTab) {
    currentSessionStorage = new MemoryStorage();
  }

  currentSearch = search;
  currentWidth = width;
  currentHidden = hidden;
  currentMediaMatches = media;
  listeners.clear();

  globalThis.window = {
    sessionStorage: currentSessionStorage,
    localStorage: sharedLocalStorage,
    innerWidth: currentWidth,
    innerHeight: 900,
    devicePixelRatio: 1,
    addEventListener(event, fn) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(fn);
    },
    matchMedia(query) {
      return { matches: !!currentMediaMatches[query] };
    }
  };

  globalThis.document = {
    hidden: currentHidden,
    addEventListener(event, fn) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(fn);
    }
  };

  globalThis.location = {
    search: currentSearch
  };

  globalThis.sessionStorage = currentSessionStorage;
  globalThis.localStorage = sharedLocalStorage;
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      connection: {}
    },
    configurable: true,
    writable: true
  });
}

async function loadQualityTierModule() {
  const targetPath = path.resolve(process.cwd(), 'ai-era-site/js/quality-tier.js');
  const cacheBustUrl = `${pathToFileURL(targetPath).href}?t=${Date.now()}_${Math.random()}`;
  return await import(cacheBustUrl);
}

function triggerEvent(name, payload = {}) {
  const fns = listeners.get(name) || [];
  for (const fn of fns) {
    fn(payload);
  }
}

async function runTests() {
  let passedCount = 0;

  // 1. Desktop mở lần đầu không bị phạt oan -> ULTRA hoặc HIGH
  {
    setupBrowserEnv({ width: 1440, freshLocal: true, newTab: true });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'HIGH');
    assert.equal(mod.getTierReason(), 'desktop');
    assert.equal(mod.getGuardState().strikes || 0, 0);
    passedCount++;
  }

  // 2. Thoát sạch (pagehide) và tải lại bình thường không bị tính strike
  {
    triggerEvent('pagehide');
    setupBrowserEnv({ width: 1440 });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'HIGH');
    assert.equal(mod.getGuardState().strikes || 0, 0);
    passedCount++;
  }

  // 3. Tab chết đột ngột (crash giả lập lần 1) -> lần tải kế tiếp hạ SAFE
  {
    currentSessionStorage.setItem('aiera_s', JSON.stringify({
      inflight: true,
      alive: Date.now() - 2000,
      hidden: false
    }));
    setupBrowserEnv({ width: 1440 });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'SAFE');
    assert.equal(mod.getTierReason(), 'crash_guard');
    assert.equal(mod.getGuardState().strikes, 1);
    passedCount++;
  }

  // 4. Crash tiếp lần 2 -> hạ STATIC
  {
    currentSessionStorage.setItem('aiera_s', JSON.stringify({
      inflight: true,
      alive: Date.now() - 2000,
      hidden: false
    }));
    setupBrowserEnv({ width: 1440 });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'STATIC');
    assert.equal(mod.getTierReason(), 'crash_guard');
    assert.equal(mod.getGuardState().strikes, 2);
    assert.equal(mod.isStaticMode(), true);
    passedCount++;
  }

  // 5. Mở tab mới khi đang chịu phạt -> tab mới cũng nhận STATIC từ shared localStorage
  {
    setupBrowserEnv({ width: 1440, newTab: true });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'STATIC');
    assert.equal(mod.getGuardState().strikes, 2);
    passedCount++;
  }

  // 6. Tab bị OS kill khi đang ở nền (hidden: true) KHÔNG tính strike thêm
  {
    currentSessionStorage.setItem('aiera_s', JSON.stringify({
      inflight: true,
      alive: Date.now() - 2000,
      hidden: true
    }));
    setupBrowserEnv({ width: 1440 });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getGuardState().strikes, 2); // không tăng lên 3
    passedCount++;
  }

  // 7. ?reset=1 xoá hình phạt và khôi phục
  {
    setupBrowserEnv({ width: 1440, search: '?reset=1' });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'HIGH');
    assert.equal(mod.getGuardState().strikes || 0, 0);
    passedCount++;
  }

  // 8. Hết hạn phạt 24h -> tự giải toả
  {
    sharedLocalStorage.setItem('aiera_g', JSON.stringify({
      strikes: 2,
      until: Date.now() - 1000,
      lastCrashAt: Date.now() - 86401000
    }));
    setupBrowserEnv({ width: 1440, newTab: true });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'HIGH');
    assert.equal(mod.getGuardState().strikes || 0, 0);
    passedCount++;
  }

  // 9. Query param override (?tier=LOW, ?tier=STATIC, ?safe=1) có hiệu lực
  {
    setupBrowserEnv({ width: 1440, search: '?tier=LOW' });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'LOW');
    assert.equal(mod.getTierReason(), 'query:tier');
    passedCount++;
  }

  // 10. Bisect query ?on=pulse,composer bật đúng cờ trong getTierConfig()
  {
    setupBrowserEnv({ width: 1440, search: '?tier=LOW&on=pulse,composer' });
    const mod = await loadQualityTierModule();
    const cfg = mod.getTierConfig();
    assert.equal(cfg.pulseLines, true);
    assert.equal(cfg.postProcessing, true);
    assert.equal(cfg.nodeLights, false);
    passedCount++;
  }

  // 11. reportContextLost() ghi strike vào localStorage và chỉ ghi 1 lần/lần tải
  {
    sharedLocalStorage.clear();
    setupBrowserEnv({ width: 1440, freshLocal: true, newTab: true });
    const mod = await loadQualityTierModule();
    mod.reportContextLost();
    mod.reportContextLost(); // lần 2 trong cùng page
    const g = JSON.parse(sharedLocalStorage.getItem('aiera_g') || '{}');
    assert.equal(g.strikes, 1);
    passedCount++;
  }

  // 12. Mobile detection: viewport < 768 hoặc coarse pointer cho LOW
  {
    sharedLocalStorage.clear();
    setupBrowserEnv({ width: 375, freshLocal: true, newTab: true });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getQualityTier(), 'LOW');
    assert.equal(mod.getTierReason(), 'mobile');
    assert.equal(mod.isMobileLike(), true);
    passedCount++;
  }

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ: ${passedCount}/12 kịch bản đạt!`);
  console.log(`========================================\n`);
}

runTests().catch((err) => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
