/* Shared ITARS UI. No framework or external service required. */
(() => {
'use strict';
const translations = window.ITARS_TRANSLATIONS || {};
let language = 'en';
try { language = localStorage.getItem('itars-language') === 'bm' ? 'bm' : 'en'; } catch {}
const header = document.querySelector('.site-header');
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.main-nav a').forEach(a => { if(a.getAttribute('href') === currentPage) a.setAttribute('aria-current','page'); });
const footer = document.querySelector('.site-footer');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const dialog = document.querySelector('#page-dialog');
let dialogTrigger;
function measureBars() {
  document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  document.documentElement.style.setProperty('--footer-height', `${footer.offsetHeight}px`);
}
function setLanguage(lang) {
  language = lang === 'bm' ? 'bm' : 'en';
  document.documentElement.lang = language === 'bm' ? 'ms' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const entry = translations[el.dataset.i18n];
    if (entry) el.innerHTML = entry[language];
  });
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === language)));
  menu.setAttribute('aria-label', language === 'bm' ? 'Buka menu navigasi' : 'Open navigation menu');
  dialog.querySelector('.dialog-close').setAttribute('aria-label', language === 'bm' ? 'Tutup dialog' : 'Close dialog');
  nav.setAttribute('aria-label', language === 'bm' ? 'Navigasi utama' : 'Main navigation');
  document.querySelector('.footer-inner nav').setAttribute('aria-label', language === 'bm' ? 'Navigasi footer' : 'Footer navigation');
  document.querySelector('.countdown-units')?.setAttribute('aria-label', language === 'bm' ? 'Masa ke tarikh acara' : 'Time until event date');
  try { localStorage.setItem('itars-language', language); } catch {}
  updateCountdown(); measureBars();
}
document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.lang)));
function closeMenu() { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); }
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded',String(open)); nav.classList.toggle('is-open',open);
});
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 1050) closeMenu(); measureBars(); });
if ('ResizeObserver' in window) { const observer = new ResizeObserver(measureBars); observer.observe(header); observer.observe(footer); }
/* This package contains the homepage only. Keep real future filenames, and use
   a clear notice until each standalone page is supplied. Remove its filename
   from pendingPages as soon as that file is added to the repository. */
const pendingPages = new Set();
document.querySelectorAll('[data-page-link]').forEach(a => a.addEventListener('click', e => {
  const filename = a.getAttribute('href').split('#')[0];
  if (!pendingPages.has(filename)) return;
  e.preventDefault(); closeMenu(); dialogTrigger = a; dialog.showModal();
}));
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { if (dialogTrigger) dialogTrigger.focus(); });
dialog.addEventListener('click', e => { if (e.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); });
/* Date-only countdown: Malaysian midnight at the beginning of 8 April 2027.
   This is NOT a confirmed event start time. Set eventStartISO only after
   organiser confirmation; update the visible explanatory note at that point. */
const countdownTarget = Date.parse('2027-04-08T00:00:00+08:00');
const countdownStatus = document.querySelector('#countdown-status');
function countdownParts(now) {
  let seconds = Math.max(0, Math.floor((countdownTarget - now) / 1000));
  const days = Math.floor(seconds / 86400); seconds %= 86400;
  const hours = Math.floor(seconds / 3600); seconds %= 3600;
  return {days, hours, minutes: Math.floor(seconds / 60), seconds: seconds % 60};
}
function updateCountdown() {
  if (!countdownStatus) return;
  const now = Date.now(); const parts = countdownParts(now);
  for (const [unit,value] of Object.entries(parts)) document.querySelector(`#count-${unit}`).textContent = String(value).padStart(2,'0');
  // Intl date order can vary by engine, so compare date parts independently.
  const localParts = new Intl.DateTimeFormat('en',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const date = Object.fromEntries(localParts.map(x => [x.type,x.value]));
  const eventDay = date.year === '2027' && date.month === '04' && date.day === '08';
  countdownStatus.textContent = now < countdownTarget ? '' : eventDay ? (language === 'bm' ? 'Hari acara telah tiba!' : 'It’s event day!') : (language === 'bm' ? 'Tarikh acara telah berlalu.' : 'The event date has passed.');
}
setLanguage(language);
setInterval(() => { if (!document.hidden) updateCountdown(); },1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });
/* Content remains visible without JS and when reduced motion is requested. */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  reducedMotion.addEventListener('change',e => { if(e.matches) { document.documentElement.classList.remove('js-motion'); observer.disconnect(); } });
}
})();
/* Payment account copying, with a visible fallback on older browsers. */
(() => {
const button=document.querySelector('.copy-account');if(!button)return;
button.addEventListener('click',async()=>{
 const lang=document.documentElement.lang==='ms'?'bm':'en';
 const t=window.ITARS_TRANSLATIONS;
 const status=document.querySelector('.copy-feedback');
 try{await navigator.clipboard.writeText('566010607296');status.textContent=t.accountcopied[lang];}
 catch{const account=document.querySelector('#payment-account');const range=document.createRange();range.selectNodeContents(account);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent=t.copyfallback[lang];}
});
})();
