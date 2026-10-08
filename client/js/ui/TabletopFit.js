/**
 * GARDEN EMPIRE — TABLETOP 3D AUTO-FIT COMPONENT
 * Tự động tính toán và co giãn bàn chơi 3D (--mat-auto-scale) để vừa vặn 100%
 * với mọi kích thước màn hình, độ phân giải và mức zoom trình duyệt (50%, 67%, 75%, 100%).
 * Đảm bảo thanh thông tin cá nhân ở dưới đáy (#my-player-panel) KHÔNG BAO GIỜ bị che khuất.
 */
export class TabletopFit {
  static resizeObserver = null;

  static init() {
    window.addEventListener('resize', () => TabletopFit.adjustFit());
    window.addEventListener('orientationchange', () => TabletopFit.adjustFit());

    // Observe arena container with ResizeObserver for ultra-responsive adjustments
    const arena = document.getElementById('tabletop-arena');
    if (arena && window.ResizeObserver) {
      if (TabletopFit.resizeObserver) {
        TabletopFit.resizeObserver.disconnect();
      }
      TabletopFit.resizeObserver = new ResizeObserver(() => {
        TabletopFit.adjustFit();
      });
      TabletopFit.resizeObserver.observe(arena);
    }

    // Multiple micro-ticks to adapt as fonts and cards finish rendering
    TabletopFit.adjustFit();
    setTimeout(() => TabletopFit.adjustFit(), 50);
    setTimeout(() => TabletopFit.adjustFit(), 150);
    setTimeout(() => TabletopFit.adjustFit(), 400);
    setTimeout(() => TabletopFit.adjustFit(), 800);
  }

  static adjustFit() {
    const arena = document.getElementById('tabletop-arena');
    const mat = document.getElementById('tabletop-mat');
    const middleRow = document.querySelector('.tabletop-middle-row');
    const topSeat = document.getElementById('seat-top');
    const myPanel = document.getElementById('my-player-panel');

    if (!arena || !mat) return;

    // 1. Available height for playing mat in middle row
    const arenaHeight = arena.clientHeight;
    const topSeatHeight = (topSeat && !topSeat.classList.contains('hidden'))
      ? topSeat.offsetHeight + 4
      : 0;
    const myPanelHeight = myPanel ? myPanel.offsetHeight + 6 : 88;

    // Remaining vertical clearance strictly allocated for the mat
    const theoreticalAvailableHeight = arenaHeight - topSeatHeight - myPanelHeight - 8;
    const middleRowHeight = middleRow ? middleRow.clientHeight : theoreticalAvailableHeight;
    const availableHeight = Math.min(theoreticalAvailableHeight, middleRowHeight > 0 ? middleRowHeight : theoreticalAvailableHeight);

    // 2. Available width for playing mat (clearing left/right opponent seats)
    const arenaWidth = arena.clientWidth;
    const seatLeft = document.getElementById('seat-left');
    const seatRight = document.getElementById('seat-right');
    const leftWidth = (seatLeft && !seatLeft.classList.contains('hidden'))
      ? seatLeft.offsetWidth + 12
      : 0;
    const rightWidth = (seatRight && !seatRight.classList.contains('hidden'))
      ? seatRight.offsetWidth + 12
      : 0;
    const availableWidth = arenaWidth - leftWidth - rightWidth - 16;

    // 3. Base design target dimensions for unscaled mat
    // Cards layout: 960px width, ~475px height
    const naturalMatWidth = 960;
    const naturalMatHeight = 475;

    let scaleY = 1.0;
    if (availableHeight > 0) {
      scaleY = availableHeight / naturalMatHeight;
    }

    let scaleX = 1.0;
    if (availableWidth > 0) {
      scaleX = availableWidth / naturalMatWidth;
    }

    // Pick uniform scale to prevent distortion
    // Clamp: min 0.40 (ensures fit even on small screens/high zoom), max 1.0
    const finalScale = Math.max(0.40, Math.min(1.0, Math.min(scaleX, scaleY)));

    mat.style.setProperty('--mat-auto-scale', finalScale.toFixed(3));
  }
}
