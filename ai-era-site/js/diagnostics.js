const PROJECT_PREFIX = 'ai-era-site';
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const BUILD_VERSION = '20261027.1';
const diagnosticStartedAt = performance.now();
let logSequence = 0;
let emittedCount = 0;
const MAX_EVENTS_PER_SESSION = 300; // chặn log tràn; riêng 'error' luôn được gửi

/**
 * Send log record to ingest or console fallback.
 * Formatted with project prefix to distinguish in shared Axiom datasets.
 */
function emitLog(level, event, details = {}) {
  if (emittedCount >= MAX_EVENTS_PER_SESSION && level !== 'error') return;
  emittedCount++;
  logSequence++;
  const prefixedEvent = `${PROJECT_PREFIX}:${event}`;
  const record = {
    project: PROJECT_PREFIX,
    session: SESSION_ID,
    buildVersion: BUILD_VERSION,
    sequence: logSequence,
    elapsedMs: Math.round(performance.now() - diagnosticStartedAt),
    event: prefixedEvent,
    raw_event: event,
    level,
    time: new Date().toISOString(),
    page: window.location.pathname,
    visibility: document.visibilityState,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
    },
    details,
  };

  // 1. Output to browser console (readable in remote debugging and local inspection)
  const fn = console[level] || console.log;
  fn.call(console, `[${PROJECT_PREFIX}] [${level.toUpperCase()}] ${event}:`, record);

  // 2. Dispatch a custom DOM event so any global forwarder/collector can capture it
  try {
    window.dispatchEvent(new CustomEvent('app:telemetry:log', { detail: record }));
  } catch (e) {
    // Ignore in non-browser or restricted environments
  }

  // 3. Optional endpoint beacon forwarder if configured
  if (window.__AXIOM_INGEST_ENDPOINT__ && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([JSON.stringify(record)], { type: 'application/json' });
      navigator.sendBeacon(window.__AXIOM_INGEST_ENDPOINT__, blob);
    } catch (_) {}
  }
}

export const logDiagInfo = (event, details) => emitLog('info', event, details);
export const logDiagWarn = (event, details) => emitLog('warn', event, details);
export const logDiagError = (event, details) => emitLog('error', event, details);

let isInitialized = false;

export function initDiagnostics() {
  if (isInitialized) return;
  isInitialized = true;

  // Drain any early boot errors caught before module evaluation
  if (Array.isArray(window.__earlyBootErrors) && window.__earlyBootErrors.length > 0) {
    window.__earlyBootErrors.forEach((err) => {
      logDiagError('early_boot_error', err);
    });
    window.__earlyBootErrors.length = 0;
  }

  // Global uncaught errors
  window.addEventListener('error', (event) => {
    const target = event.target;
    if (target && target !== window) {
      logDiagError('resource_load_error', {
        tagName: target.tagName || 'unknown',
        resource: String(target.src || target.href || '').slice(0, 300),
      });
      return;
    }

    logDiagError('window_error', {
      message: String(event.message || '').slice(0, 1000),
      filename: String(event.filename || '').slice(0, 300),
      line: event.lineno || null,
      column: event.colno || null,
      name: String(event.error?.name || ''),
      stack: String(event.error?.stack || '').slice(0, 2000),
    });
  }, true);

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logDiagError('unhandled_rejection', {
      message: String(reason?.message || reason || '').slice(0, 1000),
      stack: String(reason?.stack || '').slice(0, 2000),
    });
  });

  // Page lifecycle events
  document.addEventListener('visibilitychange', () => {
    logDiagInfo('visibility_change', {
      state: document.visibilityState,
    });
  });

  window.addEventListener('pagehide', () => {
    logDiagInfo('pagehide', {});
  });

  window.addEventListener('pageshow', (event) => {
    logDiagInfo('pageshow', {
      persistedFromBFCache: event.persisted,
    });
  });

  window.addEventListener('orientationchange', () => {
    logDiagInfo('orientation_change', {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: screen.orientation?.type || 'unknown',
    });
  });
}
