/**
 * Application Configuration
 * Allows dynamic switching between local development and production backend
 */
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// Default backend URLs:
// Khi deploy backend lên Render/Railway, bạn có thể thay domain vào đây hoặc lưu vào localStorage
const PROD_BACKEND_HTTP = 'https://garden-empire-server.onrender.com';
const PROD_BACKEND_WS = 'wss://garden-empire-server.onrender.com';

const LOCAL_BACKEND_HTTP = 'http://localhost:8080';
const LOCAL_BACKEND_WS = 'ws://localhost:8080';

export const CONFIG = {
  get API_BASE_URL() {
    const customUrl = localStorage.getItem('garden_empire_api_url');
    if (customUrl) return customUrl;
    return isLocalhost ? LOCAL_BACKEND_HTTP : PROD_BACKEND_HTTP;
  },

  get WS_BASE_URL() {
    const customWs = localStorage.getItem('garden_empire_ws_url');
    if (customWs) return customWs;
    return isLocalhost ? LOCAL_BACKEND_WS : PROD_BACKEND_WS;
  }
};
