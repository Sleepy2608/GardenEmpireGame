/**
 * Application Configuration — Phase 9.4
 * Auto-detects runtime environment:
 *   1. Docker / Nginx (same-origin) → relative paths, no CORS
 *   2. Local development (localhost:8080 direct)
 *   3. Cloud production (Render / Railway explicit URL)
 */

const hostname  = window.location.hostname;
const protocol  = window.location.protocol;          // 'http:' | 'https:'
const wsProto   = protocol === 'https:' ? 'wss:' : 'ws:';
const port      = window.location.port;

/** Running on localhost WITHOUT Nginx (direct dev server, e.g. port 5500 or file://) */
const isDirectLocalDev = Boolean(
  hostname === 'localhost' ||
  hostname === '[::1]' ||
  hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
) && port !== '3000';  // port 3000 = running through Docker/Nginx

/**
 * Running behind Nginx Reverse Proxy (Docker):
 * - http://localhost:3000  → Nginx serves static + proxies /api and /ws
 * - In this case, use RELATIVE paths — Nginx handles routing, zero CORS.
 */
const isNginxProxy = hostname === 'localhost' && port === '3000';

// ─── Cloud URLs (update when deploying to Render / Railway / VPS) ────────────
const CLOUD_HTTP = 'https://garden-empire-server.onrender.com';
const CLOUD_WS   = 'wss://garden-empire-server.onrender.com';

export const CONFIG = {
  /**
   * Base URL for REST API calls (/api/rooms, etc.)
   * - Docker/Nginx: '' (empty → relative, e.g. /api/rooms)
   * - Local dev   : 'http://localhost:8080'
   * - Cloud       : 'https://your-backend.onrender.com'
   */
  get API_BASE_URL() {
    const custom = localStorage.getItem('garden_empire_api_url');
    if (custom) return custom;
    if (isNginxProxy) return '';             // Nginx proxies /api/*
    if (isDirectLocalDev) return 'http://localhost:8080';
    return CLOUD_HTTP;
  },

  /**
   * Base URL for WebSocket connections (/ws/game)
   * - Docker/Nginx: ws://localhost:3000 (Nginx upgrades connection)
   * - Local dev   : ws://localhost:8080
   * - Cloud       : wss://your-backend.onrender.com
   */
  get WS_BASE_URL() {
    const custom = localStorage.getItem('garden_empire_ws_url');
    if (custom) return custom;
    if (isNginxProxy) return `${wsProto}//${hostname}:3000`; // via Nginx
    if (isDirectLocalDev) return 'ws://localhost:8080';
    return CLOUD_WS;
  }
};
