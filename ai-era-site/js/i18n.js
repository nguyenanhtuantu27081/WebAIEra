// js/i18n.js — Internationalisation: English ↔ Vietnamese
// Uses data-i18n attributes on DOM elements + localStorage persistence.

const translations = {
  vi: {
    // Nav
    'nav-status': 'SYSTEM ONLINE · 6 DỊCH VỤ',

    // Core label
    'core-name': 'AI Era',
    'core-sub': 'Core Intelligence',

    // Intro
    'intro-badge': 'AI ERA · NỀN TẢNG GIẢI PHÁP AI THẾ HỆ MỚI',
    'intro-h1': 'Trí tuệ cho mọi quyết định kinh doanh.',
    'intro-p': 'AIERA Solutions (AI Era) là công ty công nghệ Việt Nam xây dựng hệ sinh thái giải pháp trí tuệ nhân tạo cho doanh nghiệp — tự động hóa, AI Agent, phân tích định lượng tài chính, AI SEO và phần mềm quản lý, cùng xoay quanh một lõi trí tuệ chung.',

    // HUD
    'hud-title': 'Spatial telemetry',
    'hud-live': 'LIVE',
    'hud-camera': 'CAMERA DIST',
    'hud-rotx': 'ROTATION X',
    'hud-roty': 'ROTATION Y',
    'hud-focus': 'FOCUS',
    'hud-copy': 'Scroll để bay. Kéo để xoay 360°. Shift+kéo để lăn. Bấm vào node để khám phá.',

    // Controls
    'ctrl-drag': 'KÉO · XOAY 360°',
    'ctrl-shift': 'SHIFT+KÉO · LĂN',
    'ctrl-wheel': 'CUỘN · BAY / ZOOM',
    'ctrl-reset': 'ĐẶT LẠI',
    'ctrl-contact': 'LIÊN HỆ NGAY',
    'cta-status': 'TƯ VẤN 24/7',

    // Focus panel
    'focus-kicker-prefix': 'AI ERA',
    'focus-link': 'Xem chi tiết',
    'focus-back': 'Quay về lõi AI Era',

    // Contact footer
    'footer-kicker': 'LIÊN HỆ VỚI CHÚNG TÔI',
    'footer-title': 'Kết nối ngay với AI Era',
    'footer-chat-now': 'Chat ngay',
    'footer-phone-label': 'Điện thoại',
    'footer-subtitle': 'AIERA SOLUTIONS · NEXT-GEN AI PLATFORM',
    'footer-back-top': '↑ TRỞ VỀ AI ERA core',
  },
  en: {
    // Nav
    'nav-status': 'SYSTEM ONLINE · 6 SERVICES',

    // Core label
    'core-name': 'AI Era',
    'core-sub': 'Core Intelligence',

    // Intro
    'intro-badge': 'AI ERA · NEXT-GEN AI PLATFORM',
    'intro-h1': 'Intelligence for Every Decision.',
    'intro-p': 'AIERA Solutions (AI Era) is a Vietnamese technology company building an AI ecosystem for businesses — automation, AI agents, quantitative finance analysis, AI SEO and management software, all powered by one shared intelligence core.',

    // HUD
    'hud-title': 'Spatial telemetry',
    'hud-live': 'LIVE',
    'hud-camera': 'CAMERA DIST',
    'hud-rotx': 'ROTATION X',
    'hud-roty': 'ROTATION Y',
    'hud-focus': 'FOCUS',
    'hud-copy': 'Scroll to fly through space. Drag to rotate 360°. Shift+drag to roll. Click a node to explore.',

    // Controls
    'ctrl-drag': 'DRAG · ROTATE 360°',
    'ctrl-shift': 'SHIFT+DRAG · ROLL',
    'ctrl-wheel': 'WHEEL · FLY / ZOOM',
    'ctrl-reset': 'RESET VIEW',
    'ctrl-contact': 'CONTACT US',
    'cta-status': 'ONLINE 24/7',

    // Focus panel
    'focus-kicker-prefix': 'AI ERA',
    'focus-link': 'View details',
    'focus-back': 'Return to AI Era core',

    // Contact footer
    'footer-kicker': 'GET IN TOUCH',
    'footer-title': 'Connect with AI Era',
    'footer-chat-now': 'Chat now',
    'footer-phone-label': 'Phone',
    'footer-subtitle': 'INTELLIGENCE ECOSYSTEM',
    'footer-back-top': '↑ RETURN TO AI ERA CORE',
  }
};

// Node translations (kept separate so nodes.js can import directly)
export const nodeTranslations = {
  vi: [
    { name: 'Công nghệ tài chính & Định lượng AI', shortDesc: 'Mô hình định lượng, tín hiệu kỹ thuật và machine learning hỗ trợ nhà đầu tư ra quyết định trên thị trường chứng khoán Việt Nam.' },
    { name: 'Phần mềm quản lý doanh nghiệp ngành', shortDesc: 'Giải pháp phần mềm quản lý nghiệp vụ lõi cho Spa, Nail, Nha khoa, Phòng khám, Gym.' },
    { name: 'Landing Page & Hosting', shortDesc: 'Thiết kế landing page chuyển đổi cao kèm gói hosting miễn phí, triển khai chiến dịch nhanh, chi phí tối ưu.' },
    { name: 'Thiết kế website chuẩn SEO & AI Search / AI Overviews', shortDesc: 'Kiến trúc semantic, tốc độ cao, tối ưu AI discovery giúp doanh nghiệp hiện diện bền vững trên Google và AI search.' },
    { name: 'Digital Marketing & Nội dung AI', shortDesc: 'Chạy quảng cáo Meta/TikTok/Google Maps, tự động hoá nội dung bằng AI đa nền tảng.' },
    { name: 'Tự động hóa AI & AI Agent', shortDesc: 'Tự động hoá quy trình nghiệp vụ và triển khai AI Agent xử lý khách hàng, dữ liệu và tác vụ đa bước.' },
  ],
  en: [
    { name: 'Fintech & AI Quant Finance', shortDesc: 'Quantitative models, algorithmic signals and machine learning powering smarter investment decisions on financial markets.' },
    { name: 'Enterprise Industry Software', shortDesc: 'Core management software for Spa, Nail, Dental, Clinic and Gym businesses.' },
    { name: 'Landing Page & Hosting', shortDesc: 'High-conversion landing pages with free hosting, rapid campaign deployment and cost-effective pricing.' },
    { name: 'SEO-Optimised Website & AI Search / AI Overviews', shortDesc: 'Semantic architecture, high performance, AI-discovery optimisation for sustainable presence on Google and AI search.' },
    { name: 'Digital Marketing & AI Content', shortDesc: 'Run Meta / TikTok / Google Maps ads and automate multi-platform content with AI.' },
    { name: 'AI Automation & AI Agent', shortDesc: 'Automate business processes and deploy AI Agents that handle customers, data and multi-step tasks.' },
  ]
};

// Focus/HUD translations
export const focusTranslations = {
  vi: {
    core: 'CORE',
    free: 'FREE',
    node: 'NODE',
    focusLabel: 'FOCUS'
  },
  en: {
    core: 'CORE',
    free: 'FREE',
    node: 'NODE',
    focusLabel: 'FOCUS'
  }
};

/* ---------- helpers ---------- */
const STORAGE_KEY = 'aiera_lang';

export function getCurrentLang() {
  try { return localStorage.getItem(STORAGE_KEY) || 'vi'; }
  catch { return 'vi'; }
}

// Callbacks registered by other modules (e.g. nodes.js)
const _listeners = [];
export function onLanguageChange(fn) { _listeners.push(fn); }

export function setLanguage(lang) {
  if (!translations[lang]) return;

  // 1. Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] != null) {
      el.textContent = translations[lang][key];
    }
  });

  // 2. Update <html lang>
  document.documentElement.lang = lang === 'vi' ? 'vi' : 'en';

  // 3. Toggle active state on language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // 4. Persist
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}

  // 5. Notify listeners
  _listeners.forEach(fn => fn(lang));
}

/* ---------- init on DOM ready ---------- */
export function initI18n() {
  const lang = getCurrentLang();

  // Wire up buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.getAttribute('data-lang'));
    });
  });

  // Apply saved language
  setLanguage(lang);
}
