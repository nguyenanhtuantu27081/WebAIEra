// js/main.js — Entry point NHẸ của trang chủ.
// Chỉ import quality-tier + diagnostics (không kéo Three.js). Quyết định chế độ TRƯỚC khi tạo bất kỳ
// WebGL context nào, để một thiết bị đã crash không bao giờ phải chạy lại đường code gây crash.
import { initDiagnostics, logDiagInfo, logDiagError, BUILD_VERSION } from './diagnostics.js';
import { getQualityTier, getTierReason, getGuardState, isStaticMode } from './quality-tier.js';

initDiagnostics();
logDiagInfo('home_boot', {
  userAgent: navigator.userAgent, // chỉ gửi 1 lần ở home_boot
  tier: getQualityTier(),
  reason: getTierReason(),
  guard: getGuardState(),
  deviceMemoryGB: navigator.deviceMemory ?? null,
  hardwareConcurrency: navigator.hardwareConcurrency ?? null,
});

// ?diag=1: hiện nhãn debug trên màn hình (dùng khi test trên điện thoại không có remote debugging)
if (new URLSearchParams(location.search).get('diag') === '1') {
  const g = getGuardState();
  const el = document.createElement('pre');
  el.id = 'diagOverlay';
  el.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;margin:0;padding:6px 8px;font:11px/1.35 monospace;color:#0f0;background:rgba(0,0,0,.75);border-radius:6px;pointer-events:none;white-space:pre-wrap;max-width:90vw';
  el.textContent = `build ${BUILD_VERSION}\ntier ${g.tier} (${g.reason})\nstrikes ${g.strikes || 0} until ${g.until ? new Date(g.until).toISOString() : '-'}\nbisect [${g.bisect}]\ndpr ${devicePixelRatio} vp ${innerWidth}x${innerHeight}`;
  document.body.appendChild(el);
}

async function startStatic(why) {
  document.documentElement.classList.add('no-webgl');
  try {
    const { initStaticFallback } = await import('./static-fallback.js');
    initStaticFallback();
    logDiagInfo('home_static_started', { why });
  } catch (err) {
    logDiagError('home_static_failed', { message: String(err?.message || err) });
  }
}

if (isStaticMode()) {
  startStatic(getTierReason());
} else {
  import('./three-app.js').catch((err) => {
    // Lỗi tạo renderer / module → không để trang trắng: chuyển sang bản tĩnh
    logDiagError('home_three_app_failed', { message: String(err?.message || err), name: String(err?.name || '') });
    startStatic('three_app_failed');
  });
}
