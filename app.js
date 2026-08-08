// ════════════════════════════════════════════════════════════════════════════
// app.js — Fresko Staff Portal
// ─────────────────────────────────────────────────────────────────────────
// Extracted from index.html for future modularization.
//
// NOTE: Abhi yeh file REFERENCE ke liye hai.
// index.html still self-contained hai (single-file PWA requirement).
// Agar modularize karna ho to index.html ke _gas() / _gasX() section ko
// yahan shift karo aur index.html mein <script src="app.js"></script> lagao.
//
// Current usage: appconfig.js + index.html — sirf appconfig.js lagao.
// ════════════════════════════════════════════════════════════════════════════

/*
  Architecture:
  ─────────────
  appconfig.js  → window.GAS_URL + window.APP_CONFIG constants
  app.js        → (future) GAS bridge + utility functions
  index.html    → Full SPA — CSS + HTML + JS (all modules)

  Deploy steps:
  1. GAS mein Code.gs update karo → New Deployment karo → URL copy karo
  2. appconfig.js mein GAS_URL paste karo — bas itna kafi
  3. GitHub pe push karo — GitHub Actions auto-deploy kar dega

  Modules in index.html (do NOT move without converting to ES modules):
  - _gas(action, args, cb, errCb)     — GAS API call (JSONP)
  - _gasX(action, args, ms, cb, errCb)— with custom timeout
  - _loadV(route, sub)                — SPA router
  - _bootApp()                        — boot sequence after login
  - _U                                — logged-in user object
  - _D                                — shared data cache
  - _TOKEN                            — session token
*/

// ── Example: how to call GAS from outside index.html (if modularized) ───
// (function() {
//   var GAS_URL = window.APP_CONFIG && window.APP_CONFIG.GAS_URL;
//   if (!GAS_URL) { console.error('appconfig.js load karo pehle'); return; }
//   // ... bridge functions here
// })();
