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

/** Running on localhost direct backend without Nginx (e.g. port 8080) */
const isDirectLocalDev = (hostname === 'localhost' || hostname === '127.0.0.1') && port === '8080';

/**
 * Running behind Nginx Reverse Proxy (Docker):
 * - If running on localhost on port 3000 (or any web port other than 8080)
 * - Nginx serves static assets and proxies /api and /ws cleanly with zero CORS
 */
const isNginxProxy = (hostname === 'localhost' || hostname === '127.0.0.1') && port !== '8080';

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
    if (isNginxProxy) return `${wsProto}//${window.location.host}`; // Dynamic host:port via Nginx
    if (isDirectLocalDev) return 'ws://localhost:8080';
    return CLOUD_WS;
  }
};
