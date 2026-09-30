/*
   GARDEN EMPIRE — SYNTHETIC WEB AUDIO SOUND FX ENGINE
*/
class SoundFXEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('garden_empire_sound_muted') === 'true';
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
    localStorage.setItem('garden_empire_sound_muted', this.muted);
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

  // 5. Chiến thắng
  playVictorySound() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.4, 0.2, idx * 0.12);
    });
  }

  // 6. Lỗi / Sai lượt
  playErrorSound() {
    this.playTone(220, 'sawtooth', 0.15, 0.08, 0);
  }
}

export const SoundFX = new SoundFXEngine();
