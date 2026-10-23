/**
 * Application Configuration — Phase 9.4
 * Auto-detects runtime environment:
 *   1. Local development (localhost / 127.0.0.1) -> connects to backend at http://localhost:8080
 *   2. Cloud production (Render / Railway / Vercel -> explicit CLOUD_HTTP / CLOUD_WS)
 */

const hostname  = window.location.hostname;
const protocol  = window.location.protocol;          // 'http:' | 'https:'
const wsProto   = protocol === 'https:' ? 'wss:' : 'ws:';
const isLocal   = hostname === 'localhost' || hostname === '127.0.0.1';

// ─── Cloud URLs (Production Backend on Render) ──────────────────────────────
const CLOUD_HTTP = 'https://gardenempiregame.onrender.com';
const CLOUD_WS   = 'wss://gardenempiregame.onrender.com';

export const CONFIG = {
  /**
   * Base URL for REST API calls (/api/rooms, etc.)
   * - Local dev   : 'http://localhost:8080'
   * - Cloud       : 'https://gardenempiregame.onrender.com'
   */
  get API_BASE_URL() {
    const custom = localStorage.getItem('garden_empire_api_url');
    if (custom) return custom;
    if (isLocal) return 'http://localhost:8080';
    return CLOUD_HTTP;
  },

  /**
   * Base URL for WebSocket connections (/ws/game)
   * - Local dev   : ws://localhost:8080
   * - Cloud       : wss://gardenempiregame.onrender.com
   */
  get WS_BASE_URL() {
    const custom = localStorage.getItem('garden_empire_ws_url');
    if (custom) return custom;
    if (isLocal) return 'ws://localhost:8080';
    return CLOUD_WS;
  }
};

