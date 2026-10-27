// tests/quality-tier.test.mjs
// Automated tests for crash-loop guard & quality-tier logic across 16 scenarios (v4: iOS & CSS fxOff)

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
let docClassList = new Set();

function setupBrowserEnv(options = {}) {
  const {
    search = '',
    width = 1440,
    hidden = false,
    media = {},
    newTab = false,
    freshLocal = false,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform = 'Win32',
    maxTouchPoints = 0
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
  docClassList.clear();

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
    documentElement: {
      classList: {
        add(cls) { docClassList.add(cls); },
        remove(cls) { docClassList.delete(cls); },
        contains(cls) { return docClassList.has(cls); }
      }
    },
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
      userAgent,
      platform,
      maxTouchPoints,
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

  // 13. Mobile tắt đúng 3 nhóm CSS (core, backdrop, vignette) trên html
  {
    sharedLocalStorage.clear();
    setupBrowserEnv({ width: 375, freshLocal: true, newTab: true });
    const mod = await loadQualityTierModule();
    assert.deepEqual(mod.getFxOff(), ['core', 'backdrop', 'vignette']);
    assert.equal(docClassList.has('fx-off-core'), true);
    assert.equal(docClassList.has('fx-off-backdrop'), true);
    assert.equal(docClassList.has('fx-off-vignette'), true);
    passedCount++;
  }

  // 14. Desktop giữ nguyên hiệu ứng đầy đủ (fxOff rỗng)
  {
    setupBrowserEnv({ width: 1440, freshLocal: true, newTab: true });
    const mod = await loadQualityTierModule();
    assert.deepEqual(mod.getFxOff(), []);
    assert.equal(docClassList.has('fx-off-core'), false);
    assert.equal(docClassList.has('fx-off-backdrop'), false);
    assert.equal(docClassList.has('fx-off-vignette'), false);
    passedCount++;
  }

  // 15. ?fx=full trên mobile giữ hiệu ứng đầy đủ, ?fxoff=core,backdrop áp dụng có chọn lọc
  {
    setupBrowserEnv({ width: 375, search: '?fx=full', freshLocal: true, newTab: true });
    const mod1 = await loadQualityTierModule();
    assert.deepEqual(mod1.getFxOff(), []);

    setupBrowserEnv({ width: 1440, search: '?fxoff=core,backdrop', freshLocal: true, newTab: true });
    const mod2 = await loadQualityTierModule();
    assert.deepEqual(mod2.getFxOff(), ['core', 'backdrop']);
    assert.equal(docClassList.has('fx-off-core'), true);
    assert.equal(docClassList.has('fx-off-backdrop'), true);
    assert.equal(docClassList.has('fx-off-vignette'), false);
    passedCount++;
  }

  // 16. Phát hiện iOS (iPhone/iPad/iPadOS Desktop mode) và cờ ?on=opaque
  {
    // iPhone
    setupBrowserEnv({
      width: 414,
      freshLocal: true,
      newTab: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    });
    const modIPhone = await loadQualityTierModule();
    assert.equal(modIPhone.isIOS(), true);
    assert.equal(docClassList.has('is-ios'), true);

    // iPadOS Desktop mode: UA Macintosh, maxTouchPoints > 1
    setupBrowserEnv({
      width: 1024,
      freshLocal: true,
      newTab: true,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 5
    });
    const modIPad = await loadQualityTierModule();
    assert.equal(modIPad.isIOS(), true);

    // ?on=opaque
    setupBrowserEnv({ width: 414, search: '?tier=LOW&on=opaque', freshLocal: true, newTab: true });
    const modOpaque = await loadQualityTierModule();
    assert.equal(modOpaque.getTierConfig().opaque, true);

    passedCount++;
  }

  // 17. Tự động xoá hình phạt tích luỹ từ build cũ khi vừa nâng cấp build mới
  {
    sharedLocalStorage.setItem('aiera_g', JSON.stringify({
      strikes: 2,
      until: Date.now() + 86400000,
      build: '20261028.1' // build cũ
    }));
    setupBrowserEnv({
      width: 414,
      newTab: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    });
    const mod = await loadQualityTierModule();
    assert.equal(mod.getGuardState().strikes, 0); // Đã được auto-reset
    assert.equal(mod.getQualityTier(), 'SAFE'); // Vào đúng tier SAFE của iOS thay vì bị kẹt ở STATIC
    passedCount++;
  }

  console.log(`\n========================================`);
  console.log(`KẾT QUẢ: ${passedCount}/17 kịch bản đạt!`);
  console.log(`========================================\n`);
}

runTests().catch((err) => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
