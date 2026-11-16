/*
   GARDEN EMPIRE — SYNTHETIC WEB AUDIO SOUND FX ENGINE
*/
class SoundFXEngine {
  constructor() {
    this.ctx = null;
    this.muted = typeof localStorage !== 'undefined' && localStorage.getItem('garden_empire_sound_muted') === 'true';
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('garden_empire_sound_muted', this.muted);
    }
    if (typeof window !== 'undefined' && window.bgmController) {
      if (window.bgmController.isMuted !== this.muted) {
        window.bgmController.toggleMute();
      }
    }
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1, startDelay = 0) {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startDelay);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startDelay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + startDelay);
      osc.stop(this.ctx.currentTime + startDelay + duration);
    } catch (e) {
      // Ignore audio failure
    }
  }

  // 1. Nhặt token
  playTokenSound() {
    this.playTone(523.25, 'sine', 0.1, 0.12, 0); // C5
    this.playTone(659.25, 'sine', 0.12, 0.1, 0.06); // E5
  }

  // 2. Mua thẻ cây trồng
  playBuySound() {
    this.playTone(440.0, 'triangle', 0.15, 0.15, 0); // A4
    this.playTone(554.37, 'triangle', 0.18, 0.15, 0.08); // C#5
    this.playTone(659.25, 'triangle', 0.22, 0.15, 0.16); // E5
    this.playTone(880.0, 'sine', 0.35, 0.18, 0.24); // A5
  }

  // 3. Giữ thẻ cây
  playReserveSound() {
    this.playTone(783.99, 'sine', 0.18, 0.1, 0); // G5
    this.playTone(659.25, 'sine', 0.25, 0.08, 0.08); // E5
  }

  // 4. Đón khách thăm vườn
  playVisitorSound() {
    this.playTone(587.33, 'triangle', 0.2, 0.18, 0); // D5
    this.playTone(739.99, 'triangle', 0.25, 0.18, 0.1); // F#5
    this.playTone(880.0, 'triangle', 0.3, 0.2, 0.2); // A5
    this.playTone(1174.66, 'sine', 0.5, 0.22, 0.32); // D6
  }

  // 5. Chiến thắng & Fanfare
  playVictorySound() {
    if (this.muted) return;
    try {
      if (typeof Audio !== 'undefined') {
        const fanfare = new Audio('assets/audio/sfx/victory-fanfare.mp3');
        fanfare.volume = 0.5;
        fanfare.play().catch(() => {});
      }
    } catch (_) {}

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.4, 0.2, idx * 0.12);
    });
  }

  // 6. Lỗi / Sai lượt
  playErrorSound() {
    this.playTone(220, 'sawtooth', 0.15, 0.08, 0);
  }

  // 7. Tin nhắn chat mới (âm thanh pop nhẹ nhàng)
  playChatSound() {
    this.playTone(587.33, 'sine', 0.08, 0.08, 0);    // D5
    this.playTone(880.00, 'sine', 0.12, 0.06, 0.04); // A5
  }

  // 8. Đếm ngược tích tắc / nhịp tim (<= 10s lượt đi)
  playTickTock(isUrgent = false) {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const freq = isUrgent ? 880 : 520;
      const duration = 0.04;
      const gainVal = isUrgent ? 0.09 : 0.05;
      this.playTone(freq, 'sine', duration, gainVal, 0);
      if (isUrgent) {
        // Heartbeat second beat
        this.playTone(freq * 0.85, 'sine', duration, gainVal * 0.7, 0.07);
      }
    } catch (_) {}
  }

  // 9. Âm thanh lướt qua khi bị tự động bỏ lượt do hết giờ (AFK Whoosh)
  playWhooshSkip() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (_) {}
  }

  // 10. Âm thanh búa phán quyết khi người chơi bị truất quyền (2 Strikes Kicked)
  playGavelStrike() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }
}

export const SoundFX = new SoundFXEngine();
