/**
 * GARDEN EMPIRE — BACKGROUND MUSIC (BGM) CONTROLLER
 * 
 * BGM controller managing phase-based background music, smooth sequential fading,
 * volume ducking for SFX & urgency timer, and browser autoplay unlock handling.
 */

export const BGM_PHASES = Object.freeze({
  WELCOME: 'welcome',
  LOBBY: 'lobby',
  GAME_NORMAL: 'game-normal',
  GAME_FINAL: 'game-final',
  SILENCE: 'silence'
});

export const BGM_TRACKS = Object.freeze({
  [BGM_PHASES.WELCOME]: 'assets/audio/bgm/welcome-bgm.mp3',
  [BGM_PHASES.LOBBY]: 'assets/audio/bgm/lobby-bgm.mp3',
  [BGM_PHASES.GAME_NORMAL]: 'assets/audio/bgm/game-normal-bgm.mp3',
  [BGM_PHASES.GAME_FINAL]: 'assets/audio/bgm/game-final-bgm.mp3',
  [BGM_PHASES.SILENCE]: null
});

export class BGMController {
  static PHASES = BGM_PHASES;
  static TRACKS = BGM_TRACKS;

  /**
   * @param {Object} options
   * @param {string} [options.basePath=''] Base path prepended to track URLs
   * @param {number} [options.baseVolume=0.25] Normal BGM playback volume (0.0 - 1.0)
   * @param {number} [options.duckVolume=0.08] Lowered volume when SFX is playing
   * @param {number} [options.dangerVolume=0.05] Lowered volume during <=10s turn timer
   */
  constructor(options = {}) {
    this.basePath = options.basePath || '';
    this.baseVolume = typeof options.baseVolume === 'number' ? options.baseVolume : 0.25;
    this.duckVolume = typeof options.duckVolume === 'number' ? options.duckVolume : 0.08;
    this.dangerVolume = typeof options.dangerVolume === 'number' ? options.dangerVolume : 0.05;

    this.audio = null;
    this._currentPhase = BGM_PHASES.SILENCE;
    this._isMuted = typeof localStorage !== 'undefined' && localStorage.getItem('garden_empire_sound_muted') === 'true';
    this._isDucked = false;
    this._isPlaying = false;
    this._fadeInterval = null;
    this._duckInterval = null;
    this._userInteractionBound = false;
    this._pendingPlay = false;

    this._handleUserInteraction = this._handleUserInteraction.bind(this);
  }

  /**
   * Initialize audio element and bind autoplay unlock handlers.
   * @param {HTMLAudioElement|null} [element=null] Optional existing audio element
   */
  init(element = null) {
    if (element) {
      this.audio = element;
    } else if (typeof document !== 'undefined' && document.getElementById('bgm-player')) {
      this.audio = document.getElementById('bgm-player');
    } else if (typeof Audio !== 'undefined') {
      this.audio = new Audio();
    }

    if (this.audio) {
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = this._isMuted ? 0 : this.baseVolume;

      // Ensure errors on audio playback do not break page execution
      if (typeof this.audio.addEventListener === 'function') {
        this.audio.addEventListener('error', (e) => {
          console.warn('[BGMController] Audio playback issue:', e);
        });
      }
    }

    this._setupAutoplayUnlock();
    return this;
  }

  /**
   * Current active BGM phase name
   * @returns {string}
   */
  get currentPhase() {
    return this._currentPhase;
  }

  /**
   * Whether BGM is currently muted
   * @returns {boolean}
   */
  get isMuted() {
    return this._isMuted;
  }

  /**
   * Whether audio is actively intended to be playing
   * @returns {boolean}
   */
  get isPlaying() {
    return Boolean(this._isPlaying && this.audio && !this.audio.paused);
  }

  /**
   * Current audio playback volume (0.0 - 1.0)
   * @returns {number}
   */
  get volume() {
    return this.audio ? this.audio.volume : this.baseVolume;
  }

  /**
   * Resolve track URL for a given phase
   * @param {string} phase
   * @returns {string|null}
   */
  getTrackUrl(phase) {
    const track = BGM_TRACKS[phase];
    if (!track) return null;
    return `${this.basePath}${track}`;
  }

  /**
   * Update base volume and persist to localStorage
   * @param {number} value (0.0 to 1.0)
   */
  setVolume(value) {
    const clamped = Math.max(0, Math.min(1, Number(value) || 0));
    this.baseVolume = clamped;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('garden_empire_bgm_volume', clamped.toString());
    }
    if (this.audio && !this._isMuted && !this._isDucked) {
      this.audio.volume = clamped;
    }
    return clamped;
  }

  /**
   * Apply effective volume calculated by SettingsManager.
   * @param {number} effectiveVolume (0.0 to 1.0)
   * @param {boolean} [isMuted]
   */
  applySettingsVolume(effectiveVolume, isMuted) {
    if (typeof isMuted === 'boolean') {
      this._isMuted = isMuted;
    }
    const clamped = Math.max(0, Math.min(1, Number(effectiveVolume) || 0));
    this.baseVolume = clamped;
    this.duckVolume = clamped * 0.32;
    this.dangerVolume = clamped * 0.20;

    if (this.audio) {
      if (this._isMuted) {
        this.audio.volume = 0;
      } else {
        const targetVol = this._isDucked ? this.duckVolume : this.baseVolume;
        this.audio.volume = targetVol;
      }
    }
    return clamped;
  }

  /**
   * Toggle mute state and sync with localStorage key 'garden_empire_sound_muted'
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this._isMuted = !this._isMuted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('garden_empire_sound_muted', this._isMuted.toString());
    }

    if (typeof window !== 'undefined' && window.settingsManager) {
      if (window.settingsManager.isMasterMuted() !== this._isMuted) {
        window.settingsManager.setMasterMuted(this._isMuted);
      }
    }

    if (this.audio) {
      if (this._isMuted) {
        this.audio.volume = 0;
      } else {
        const targetVol = this._isDucked ? this.duckVolume : this.baseVolume;
        this.audio.volume = targetVol;
        if (this._isPlaying && this.audio.paused) {
          this.play().catch(() => {});
        }
      }
    }

    return this._isMuted;
  }

  /**
   * Play or resume BGM audio. Handles browser autoplay restrictions gracefully.
   * @returns {Promise<void>}
   */
  async play() {
    this._isPlaying = true;
    if (!this.audio) return;

    if (this._isMuted) {
      this.audio.volume = 0;
    } else if (!this._isDucked && this.audio.volume === 0) {
      this.audio.volume = this.baseVolume;
    }

    try {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      this._pendingPlay = false;
    } catch (err) {
      // Browser blocked autoplay due to missing user gesture
      if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError') {
        this._pendingPlay = true;
      } else {
        console.warn('[BGMController] play() exception:', err);
      }
    }
  }

  /**
   * Pause BGM audio
   */
  pause() {
    this._isPlaying = false;
    this._stopFade();
    if (this.audio && typeof this.audio.pause === 'function') {
      this.audio.pause();
    }
  }

  /**
   * Smoothly fade in volume from current volume to target
   * @param {number} [duration=1000] Duration in ms
   * @param {number|null} [targetVolume=null] Target volume
   * @returns {Promise<void>}
   */
  fadeIn(duration = 1000, targetVolume = null) {
    this._stopFade();
    if (!this.audio || this._isMuted) return Promise.resolve();

    const target = targetVolume !== null ? targetVolume : (this._isDucked ? this.duckVolume : this.baseVolume);
    const startVolume = this.audio.volume;
    const stepTime = 25;
    const totalSteps = Math.max(1, Math.floor(duration / stepTime));
    const volumeStep = (target - startVolume) / totalSteps;
    let stepCount = 0;

    return new Promise((resolve) => {
      this._fadeInterval = setInterval(() => {
        stepCount++;
        const nextVolume = Math.min(target, Math.max(0, startVolume + volumeStep * stepCount));
        if (this.audio && !this._isMuted) {
          this.audio.volume = nextVolume;
        }

        if (stepCount >= totalSteps || (this.audio && this.audio.volume >= target)) {
          this._stopFade();
          if (this.audio && !this._isMuted) {
            this.audio.volume = target;
          }
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Smoothly fade out volume from current volume to 0
   * @param {number} [duration=500] Duration in ms
   * @returns {Promise<void>}
   */
  fadeOut(duration = 500) {
    this._stopFade();
    if (!this.audio || this._isMuted || this.audio.volume <= 0) return Promise.resolve();

    const startVolume = this.audio.volume;
    const stepTime = 25;
    const totalSteps = Math.max(1, Math.floor(duration / stepTime));
    const volumeStep = startVolume / totalSteps;
    let stepCount = 0;

    return new Promise((resolve) => {
      this._fadeInterval = setInterval(() => {
        stepCount++;
        const nextVolume = Math.max(0, startVolume - volumeStep * stepCount);
        if (this.audio) {
          this.audio.volume = nextVolume;
        }

        if (stepCount >= totalSteps || (this.audio && this.audio.volume <= 0)) {
          this._stopFade();
          if (this.audio) {
            this.audio.volume = 0;
          }
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Change BGM phase with smooth sequential cross-transition
   * @param {string} phase One of BGM_PHASES
   * @param {number} [fadeDuration=500] Fade transition duration in ms
   * @returns {Promise<void>}
   */
  async setPhase(phase, fadeDuration = 500) {
    if (!Object.values(BGM_PHASES).includes(phase)) {
      console.warn(`[BGMController] Unknown phase: "${phase}". Ignored.`);
      return;
    }

    // Already on the same track
    if (this._currentPhase === phase) {
      if (!this.isPlaying && this._isPlaying) {
        await this.play();
      }
      return;
    }

    // Silence phase: fade out and pause
    if (phase === BGM_PHASES.SILENCE) {
      this._currentPhase = BGM_PHASES.SILENCE;
      if (this.isPlaying) {
        await this.fadeOut(fadeDuration);
      }
      this.pause();
      return;
    }

    const trackUrl = this.getTrackUrl(phase);
    if (!trackUrl) return;

    // Fade out previous audio if currently playing
    if (this.isPlaying && this.audio && this.audio.volume > 0) {
      await this.fadeOut(Math.floor(fadeDuration / 2));
    }

    // Switch source and reset position
    this._currentPhase = phase;
    if (this.audio) {
      this.audio.src = trackUrl;
      try {
        this.audio.currentTime = 0;
      } catch (_) {}
    }

    // Start playing new track and fade in
    await this.play();
    await this.fadeIn(fadeDuration);
  }

  /**
   * Lower BGM volume when sound effects or timer tick is active
   * @param {number} [targetVolume] Default this.duckVolume (0.08)
   * @param {number} [duration=200] Duration in ms
   * @returns {Promise<void>}
   */
  duck(targetVolume = null, duration = 200) {
    if (this._isMuted || !this.audio) return Promise.resolve();
    this._isDucked = true;
    const target = typeof targetVolume === 'number' ? targetVolume : this.duckVolume;

    this._stopDuck();
    const startVolume = this.audio.volume;
    const stepTime = 25;
    const totalSteps = Math.max(1, Math.floor(duration / stepTime));
    const volumeStep = (startVolume - target) / totalSteps;
    let stepCount = 0;

    return new Promise((resolve) => {
      this._duckInterval = setInterval(() => {
        stepCount++;
        const nextVolume = Math.max(target, startVolume - volumeStep * stepCount);
        if (this.audio && !this._isMuted) {
          this.audio.volume = nextVolume;
        }

        if (stepCount >= totalSteps || (this.audio && this.audio.volume <= target)) {
          this._stopDuck();
          if (this.audio && !this._isMuted) {
            this.audio.volume = target;
          }
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Restore normal volume after SFX or timer tick finishes
   * @param {number} [duration=300] Duration in ms
   * @returns {Promise<void>}
   */
  unduck(duration = 300) {
    if (this._isMuted || !this.audio) {
      this._isDucked = false;
      return Promise.resolve();
    }
    this._isDucked = false;
    const target = this.baseVolume;

    this._stopDuck();
    const startVolume = this.audio.volume;
    const stepTime = 25;
    const totalSteps = Math.max(1, Math.floor(duration / stepTime));
    const volumeStep = (target - startVolume) / totalSteps;
    let stepCount = 0;

    return new Promise((resolve) => {
      this._duckInterval = setInterval(() => {
        stepCount++;
        const nextVolume = Math.min(target, startVolume + volumeStep * stepCount);
        if (this.audio && !this._isMuted) {
          this.audio.volume = nextVolume;
        }

        if (stepCount >= totalSteps || (this.audio && this.audio.volume >= target)) {
          this._stopDuck();
          if (this.audio && !this._isMuted) {
            this.audio.volume = target;
          }
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Internal helper: stop any running fade interval
   * @private
   */
  _stopFade() {
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }
  }

  /**
   * Internal helper: stop any running duck interval
   * @private
   */
  _stopDuck() {
    if (this._duckInterval) {
      clearInterval(this._duckInterval);
      this._duckInterval = null;
    }
  }

  /**
   * Internal helper: set up listeners for user interaction to unlock autoplay
   * @private
   */
  _setupAutoplayUnlock() {
    if (this._userInteractionBound || typeof document === 'undefined') return;
    const events = ['click', 'pointerdown', 'keydown', 'touchstart'];
    events.forEach((evt) => {
      document.addEventListener(evt, this._handleUserInteraction, { once: true, passive: true });
    });
    this._userInteractionBound = true;
  }

  /**
   * Internal listener for user gestures
   * @private
   */
  _handleUserInteraction() {
    if (this._pendingPlay && this._isPlaying) {
      this.play().catch(() => {});
    }
  }

  /**
   * Teardown and reset controller state
   */
  cleanup() {
    this._stopFade();
    this._stopDuck();
    if (this.audio) {
      this.pause();
      this.audio.src = '';
    }
    if (typeof document !== 'undefined' && this._userInteractionBound) {
      const events = ['click', 'pointerdown', 'keydown', 'touchstart'];
      events.forEach((evt) => {
        document.removeEventListener(evt, this._handleUserInteraction);
      });
      this._userInteractionBound = false;
    }
    this._currentPhase = BGM_PHASES.SILENCE;
    this._isPlaying = false;
    this._isDucked = false;
    this._pendingPlay = false;
  }
}

// Export singleton instance for app-wide sharing
export const bgmController = new BGMController();

// Expose on window object for non-module script tag compatibility
if (typeof window !== 'undefined') {
  window.BGMController = BGMController;
  window.bgmController = bgmController;
}
