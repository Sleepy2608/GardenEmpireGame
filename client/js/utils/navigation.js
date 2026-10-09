/**
 * Navigation & Clean URL Utility — Garden Empire
 * Removes .html extensions from URLs and provides unified routing across Vercel and local dev.
 */

// Tự động làm sạch thanh địa chỉ URL trình duyệt (bỏ .html nếu có) mà không reload trang
if (typeof window !== 'undefined' && window.location && window.location.pathname) {
  if (window.location.pathname.endsWith('.html')) {
    const cleanPath = window.location.pathname.replace(/\.html$/, '');
    const cleanUrl = cleanPath + window.location.search + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);
  }
}

/**
 * Trả về URL tương ứng theo route sạch.
 * @param {'index'|'lobby'|'room'|'waiting-room'|'game'} route 
 * @param {string|object} [params] - Query string hoặc object params
 * @returns {string}
 */
export function getRouteUrl(route, params = '') {
  // Khi chạy trên local python http.server (port 5500) không có rewrite tự động
  const isLocalStatic = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '5500';

  const routeMap = {
    'index': isLocalStatic ? 'index.html' : '/',
    'lobby': isLocalStatic ? 'lobby.html' : '/lobby',
    'room': isLocalStatic ? 'waiting-room.html' : '/room',
    'waiting-room': isLocalStatic ? 'waiting-room.html' : '/room',
    'game': isLocalStatic ? 'game.html' : '/game'
  };

  const target = routeMap[route] || route;

  let queryString = '';
  if (typeof params === 'object' && params !== null) {
    const searchParams = new URLSearchParams(params);
    queryString = searchParams.toString();
  } else if (typeof params === 'string') {
    queryString = params.startsWith('?') ? params.slice(1) : params;
  }

  const queryPart = queryString ? `?${queryString}` : '';
  return `${target}${queryPart}`;
}

/**
 * Điều hướng trang với clean URL.
 * @param {'index'|'lobby'|'room'|'waiting-room'|'game'} route 
 * @param {string|object} [params]
 */
export function navigateTo(route, params = '') {
  window.location.href = getRouteUrl(route, params);
}
