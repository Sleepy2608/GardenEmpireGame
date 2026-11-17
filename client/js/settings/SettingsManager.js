/**
 * GARDEN EMPIRE — CENTRALIZED SETTINGS & PREFERENCES MANAGER
 * 
 * Manages global user preferences with schema versioning, localStorage persistence,
 * event subscription bus, and bidirectional synchronization with BGM and SFX engines.
 */

export const SETTINGS_STORAGE_KEY = 'garden_empire_settings_v1';
export const LEGACY_SOUND_MUTED_KEY = 'garden_empire_sound_muted';
export const LEGACY_BGM_VOLUME_KEY = 'garden_empire_bgm_volume';

export const DEFAULT_SETTINGS = Object.freeze({
  version: 1,
  audio: Object.freeze({
    masterVolume: 0.8,
    masterMuted: false,
    bgmVolume: 0.7,
    bgmMuted: false,
    sfxVolume: 1.0,
    sfxMuted: false
  }),
  display: Object.freeze({
    particlesEnabled: true,
    reducedMotion: false,
    cardHoverZoom: true
  }),
  gameplay: Object.freeze({
    turnAlertSound: true,
    chatMessageSound: true,
    colorblindMode: false,
    botHintEnabled: false
  })
});

export class SettingsManager {
  constructor() {
    this._settings = this._cloneDefaults();
    this._listeners = new Set();
    this._bgmController = null;
    this._soundFx = null;
    this._isSyncing = false;

    this._loadSettings();
  }

  /**
   * Deep clone default settings
   * @private
   */
  _cloneDefaults() {
    return {
      version: DEFAULT_SETTINGS.version,
      audio: { ...DEFAULT_SETTINGS.audio },
      display: { ...DEFAULT_SETTINGS.display },
      gameplay: { ...DEFAULT_SETTINGS.gameplay }
    };
  }

  /**
   * Load settings from localStorage with backwards compatibility
   * @private
   */
  _loadSettings() {
    if (typeof localStorage === 'undefined') return;

    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.audio) {
            this._settings.audio = { ...this._settings.audio, ...parsed.audio };
          }
          if (parsed.display) {
            this._settings.display = { ...this._settings.display, ...parsed.display };
          }
          if (parsed.gameplay) {
            this._settings.gameplay = { ...this._settings.gameplay, ...parsed.gameplay };
          }
          return;
        }
      }
    } catch (e) {
      console.warn('[SettingsManager] Failed to parse stored settings, falling back to defaults:', e);
    }

    // Check legacy storage keys if new settings schema is not yet saved
    try {
      const legacyMuted = localStorage.getItem(LEGACY_SOUND_MUTED_KEY);
      if (legacyMuted !== null) {
        this._settings.audio.masterMuted = legacyMuted === 'true';
      }
      const legacyBgmVol = localStorage.getItem(LEGACY_BGM_VOLUME_KEY);
      if (legacyBgmVol !== null) {
        const num = parseFloat(legacyBgmVol);
        if (!isNaN(num) && num >= 0 && num <= 1) {
          this._settings.audio.bgmVolume = num;
        }
      }
    } catch (e) {
      // Ignore legacy read errors
    }
  }

  /**
   * Persist current state to localStorage
   * @private
   */
  _saveSettings() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this._settings));
      // Sync legacy key so existing navbar quick-mute continues working smoothly
      localStorage.setItem(LEGACY_SOUND_MUTED_KEY, this._settings.audio.masterMuted ? 'true' : 'false');
      localStorage.setItem(LEGACY_BGM_VOLUME_KEY, this._settings.audio.bgmVolume.toString());
    } catch (e) {
      console.warn('[SettingsManager] Could not save settings to localStorage:', e);
    }
  }

  /**
   * Subscribe to setting changes
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this._listeners.add(callback);
    }
    return () => this.removeListener(callback);
  }

  /**
   * Unsubscribe from setting changes
   * @param {Function} callback
   */
  removeListener(callback) {
    this._listeners.delete(callback);
  }

  /**
   * Notify subscribers of setting mutation
   * @private
   */
  _notify(changeDetails) {
    this._saveSettings();
    this._applyToAudioEngines();

    for (const listener of this._listeners) {
      try {
        listener(changeDetails, this.getSettings());
      } catch (err) {
        console.error('[SettingsManager] Listener error:', err);
      }
    }
  }

  /**
   * Connect BGM controller for automated volume and mute coordination
   * @param {Object} bgmController
   */
  attachBgmController(bgmController) {
    this._bgmController = bgmController;
    this._applyToAudioEngines();
  }

  /**
   * Connect SoundFX engine for automated volume and mute coordination
   * @param {Object} soundFx
   */
  attachSoundFx(soundFx) {
    this._soundFx = soundFx;
    this._applyToAudioEngines();
  }

  /**
   * Apply effective volumes directly to attached audio engines
   * @private
   */
  _applyToAudioEngines() {
    if (this._isSyncing) return;
    this._isSyncing = true;

    try {
      const effBgmVol = this.getEffectiveBgmVolume();
      const isBgmMuted = this.isBgmMuted();

      if (this._bgmController) {
        if (typeof this._bgmController.applySettingsVolume === 'function') {
          this._bgmController.applySettingsVolume(effBgmVol, isBgmMuted);
        } else if (typeof this._bgmController.setVolume === 'function') {
          this._bgmController.setVolume(this._settings.audio.bgmVolume);
          if (this._bgmController.isMuted !== isBgmMuted) {
            this._bgmController.toggleMute();
          }
        }
      }

      const effSfxVol = this.getEffectiveSfxVolume();
      const isSfxMuted = this.isSfxMuted();

      if (this._soundFx) {
        if (typeof this._soundFx.setMasterVolume === 'function') {
          this._soundFx.setMasterVolume(effSfxVol);
        }
        if (typeof this._soundFx.setMuted === 'function') {
          this._soundFx.setMuted(isSfxMuted);
        } else if (typeof this._soundFx.isMuted === 'function') {
          if (this._soundFx.isMuted() !== isSfxMuted && typeof this._soundFx.toggleMute === 'function') {
            this._soundFx.toggleMute();
          }
        }
      }
    } finally {
      this._isSyncing = false;
    }
  }

  /**
   * Return a read-only snapshot of current settings
   * @returns {Object}
   */
  getSettings() {
    return {
      version: this._settings.version,
      audio: { ...this._settings.audio },
      display: { ...this._settings.display },
      gameplay: { ...this._settings.gameplay }
    };
  }

  // =========================================================================
  // AUDIO CONTROLS
  // =========================================================================

  getMasterVolume() {
    return this._settings.audio.masterVolume;
  }

  setMasterVolume(val) {
    const clamped = Math.max(0, Math.min(1, Number(val) || 0));
    this._settings.audio.masterVolume = clamped;
    this._notify({ section: 'audio', key: 'masterVolume', value: clamped });
    return clamped;
  }

  isMasterMuted() {
    return Boolean(this._settings.audio.masterMuted);
  }

  setMasterMuted(bool) {
    const muted = Boolean(bool);
    this._settings.audio.masterMuted = muted;
    this._notify({ section: 'audio', key: 'masterMuted', value: muted });
    return muted;
  }

  toggleMasterMute() {
    return this.setMasterMuted(!this._settings.audio.masterMuted);
  }

  getBgmVolume() {
    return this._settings.audio.bgmVolume;
  }

  setBgmVolume(val) {
    const clamped = Math.max(0, Math.min(1, Number(val) || 0));
    this._settings.audio.bgmVolume = clamped;
    this._notify({ section: 'audio', key: 'bgmVolume', value: clamped });
    return clamped;
  }

  isBgmMuted() {
    return Boolean(this._settings.audio.masterMuted || this._settings.audio.bgmMuted);
  }

  setBgmMuted(bool) {
    const muted = Boolean(bool);
    this._settings.audio.bgmMuted = muted;
    this._notify({ section: 'audio', key: 'bgmMuted', value: muted });
    return muted;
  }

  toggleBgmMute() {
    return this.setBgmMuted(!this._settings.audio.bgmMuted);
  }

  getSfxVolume() {
    return this._settings.audio.sfxVolume;
  }

  setSfxVolume(val) {
    const clamped = Math.max(0, Math.min(1, Number(val) || 0));
    this._settings.audio.sfxVolume = clamped;
    this._notify({ section: 'audio', key: 'sfxVolume', value: clamped });
    return clamped;
  }

  isSfxMuted() {
    return Boolean(this._settings.audio.masterMuted || this._settings.audio.sfxMuted);
  }

  setSfxMuted(bool) {
    const muted = Boolean(bool);
    this._settings.audio.sfxMuted = muted;
    this._notify({ section: 'audio', key: 'sfxMuted', value: muted });
    return muted;
  }

  toggleSfxMute() {
    return this.setSfxMuted(!this._settings.audio.sfxMuted);
  }

  /**
   * Calculate effective BGM playback volume considering master volume and mutes
   * @returns {number} 0.0 to 1.0
   */
  getEffectiveBgmVolume() {
    if (this._settings.audio.masterMuted || this._settings.audio.bgmMuted) {
      return 0;
    }
    const eff = this._settings.audio.masterVolume * this._settings.audio.bgmVolume;
    return Math.max(0, Math.min(1, eff));
  }

  /**
   * Calculate effective SFX playback volume considering master volume and mutes
   * @returns {number} 0.0 to 1.0
   */
  getEffectiveSfxVolume() {
    if (this._settings.audio.masterMuted || this._settings.audio.sfxMuted) {
      return 0;
    }
    const eff = this._settings.audio.masterVolume * this._settings.audio.sfxVolume;
    return Math.max(0, Math.min(1, eff));
  }

  // =========================================================================
  // DISPLAY & GRAPHICS CONTROLS
  // =========================================================================

  getDisplaySetting(key) {
    return this._settings.display[key];
  }

  setDisplaySetting(key, val) {
    if (key in this._settings.display) {
      this._settings.display[key] = Boolean(val);
      this._notify({ section: 'display', key, value: Boolean(val) });
      return this._settings.display[key];
    }
    return undefined;
  }

  // =========================================================================
  // GAMEPLAY & ACCESSIBILITY CONTROLS
  // =========================================================================

  getGameplaySetting(key) {
    return this._settings.gameplay[key];
  }

  setGameplaySetting(key, val) {
    if (key in this._settings.gameplay) {
      this._settings.gameplay[key] = Boolean(val);
      this._notify({ section: 'gameplay', key, value: Boolean(val) });
      return this._settings.gameplay[key];
    }
    return undefined;
  }

  // =========================================================================
  // RESET & BULK OPERATIONS
  // =========================================================================

  /**
   * Reset all settings to default values and notify listeners
   */
  resetToDefaults() {
    this._settings = this._cloneDefaults();
    this._notify({ section: 'all', key: 'reset', value: null });
  }
}

// Global Singleton Instance
export const settingsManager = new SettingsManager();

if (typeof window !== 'undefined') {
  window.settingsManager = settingsManager;
}
