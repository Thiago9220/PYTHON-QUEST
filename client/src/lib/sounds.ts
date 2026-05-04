/**
 * Gerenciador de Áudio com Web Audio API
 * Gera sons proceduralmente para evitar carregamento de arquivos externos (MP3/WAV)
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _enabled = true;
  private ambientOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private tavernAudio: HTMLAudioElement | null = null;
  private isAmbientPlaying = false;
  private currentMusicUrl: string | null = null;
  private fadeInterval: any = null;
  private _volume = 0.35;

  get volume() { return this._volume; }
  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.tavernAudio) {
      this.tavernAudio.volume = this._volume;
    }
  }

  private lastContext: string | undefined = undefined;

  get enabled() { return this._enabled; }
  set enabled(value: boolean) {
    const wasEnabled = this._enabled;
    this._enabled = value;
    if (!value) {
      this.stopAmbientMusic();
    } else if (value && !wasEnabled && !this.isAmbientPlaying) {
      // Voltou do mute → retoma o que estava tocando por último
      this.startAmbientMusic(this.lastContext);
    }
  }

  public init() {
    if (!this.ctx && typeof window !== "undefined") {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Som de clique mecânico (botão executar)
  public playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Tipo quadrado bem curto e grave para simular tecla mecânica
    osc.type = "square";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Som de erro (grave e curto)
  public playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.2);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Som de moedas / harpa (XP Ganho)
  public playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Arpejo ascendente (notas em Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      const startTime = t + (index * 0.08); // Quase como uma harpa rápida
      
      osc.type = "sine";
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // Fanfarra (Nova Conquista)
  public playAchievement() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Acorde majestoso: C4, G4, C5, E5
    const freqs = [261.63, 392.00, 523.25, 659.25];
    
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = idx % 2 === 0 ? "triangle" : "sine"; // Mistura para soar "mágico"
      osc.frequency.value = freq;
      
      // Ataque um pouco mais lento para ficar majestoso
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.3); // Sustain
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Decay longo
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(t);
      osc.stop(t + 2.0);
    });
    
    // Brilho no topo:
    setTimeout(() => {
      if (!this.ctx) return;
      const t2 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 1046.50; // C6
      gain.gain.setValueAtTime(0, t2);
      gain.gain.linearRampToValueAtTime(0.1, t2 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t2);
      osc.stop(t2 + 1);
    }, 200);
  }

  // Mapa de trilhas reais por contexto. Se não houver MP3 mapeado, cai no procedural.
  private static TRACKS: Record<string, string> = {
    welcome: "/music/welcome.mp3",
    biblioteca: "/music/biblioteca.mp3",
    mercado: "/music/mercado.mp3",
    floresta: "/music/floresta.mp3",
    conclave: "/music/conclave.mp3",
    castelo: "/music/castelo.mp3",
    cidade: "/music/cidade.mp3",
  };

  // --- TRILHA SONORA DINÂMICA ---
  public startAmbientMusic(contextId?: string) {
    // Sempre registra o último contexto — mesmo mutado, para retomar no unmute.
    this.lastContext = contextId;
    if (!this.enabled) return;

    const trackUrl = contextId ? SoundEngine.TRACKS[contextId] : undefined;

    if (trackUrl) {
      // Já tocando esse mesmo arquivo? Não reinicia.
      if (this.isAmbientPlaying && this.currentMusicUrl === trackUrl) return;
      this.stopAmbientMusic(() => this.playFileAmbient(trackUrl));
      return;
    }

    // Sem MP3 mapeado → procedural
    if (this.isAmbientPlaying && !this.currentMusicUrl) return;
    const type: 'default' | 'magic' | 'space' =
      contextId === "observatorio" ? "space"
      : contextId && ["floresta", "castelo", "cidade", "conclave"].includes(contextId) ? "magic"
      : "default";
    this.stopAmbientMusic(() => this.playProceduralAmbient(type));
  }

  private playFileAmbient(url: string) {
    if (!this.enabled) return;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    this.tavernAudio = audio;
    this.currentMusicUrl = url;
    this.isAmbientPlaying = true;

    const fadeIn = () => {
      let v = 0;
      const target = this._volume;
      const step = target / 30;
      const interval = setInterval(() => {
        v = Math.min(target, v + step);
        if (this.tavernAudio === audio) audio.volume = v;
        else { clearInterval(interval); return; }
        if (v >= target) clearInterval(interval);
      }, 50);
    };

    audio.play().then(fadeIn).catch(() => {
      // Autoplay bloqueado — espera gesto do usuário e tenta de novo.
      const retry = () => {
        document.removeEventListener("click", retry);
        document.removeEventListener("keydown", retry);
        document.removeEventListener("touchstart", retry);
        // Usuário pode ter mudado de tela / desativado som nesse meio tempo
        if (!this.enabled || this.tavernAudio !== audio || this.currentMusicUrl !== url) return;
        audio.play().then(fadeIn).catch(() => {});
      };
      document.addEventListener("click", retry, { once: true });
      document.addEventListener("keydown", retry, { once: true });
      document.addEventListener("touchstart", retry, { once: true });
    });
  }

  // --- O "SALVADOR": Drone Procedural Místico (Nunca Falha!) ---
  public playProceduralAmbient(type: 'default' | 'magic' | 'space' = 'default') {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    this.isAmbientPlaying = true;
    const t = this.ctx.currentTime;

    // Diferentes "climas" procedurais
    const presets = {
      default: [
        { f: 55, type: "sine" as const, vol: 0.1 },
        { f: 82.41, type: "sine" as const, vol: 0.05 }
      ],
      magic: [
        { f: 110, type: "sine" as const, vol: 0.06 }, 
        { f: 164.81, type: "sine" as const, vol: 0.04 }, // Quinta justa (E)
        { f: 220, type: "triangle" as const, vol: 0.02 } // Oitava
      ],
      space: [
        { f: 40, type: "sine" as const, vol: 0.12 },
        { f: 60, type: "sine" as const, vol: 0.08 }
      ]
    };

    const layers = presets[type] || presets.default;

    layers.forEach(layer => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();

      osc.type = layer.type;
      osc.frequency.setValueAtTime(layer.f, t);
      
      // Modulação suave para parecer "vivo"
      lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.1, t); 
      lfoGain.gain.setValueAtTime(layer.vol * 0.5, t);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(layer.vol, t + 3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      lfo.start(t);
      this.ambientOscillators.push({ osc, gain });
    });
  }

  public stopAmbientMusic(callback?: () => void) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    // Para as camadas procedurais
    const t = this.ctx?.currentTime || 0;
    this.ambientOscillators.forEach(({ osc, gain }) => {
      gain.gain.linearRampToValueAtTime(0, t + 1);
      setTimeout(() => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      }, 1100);
    });
    this.ambientOscillators = [];

    if (!this.tavernAudio) {
      this.isAmbientPlaying = false;
      this.currentMusicUrl = null;
      if (callback) setTimeout(callback, 50);
      return;
    }

    const audio = this.tavernAudio;
    let vol = audio.volume;
    this.fadeInterval = setInterval(() => {
      vol -= 0.1;
      audio.volume = Math.max(vol, 0);
      if (vol <= 0) {
        audio.pause();
        audio.src = "";
        this.tavernAudio = null;
        this.currentMusicUrl = null;
        this.isAmbientPlaying = false;
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        if (callback) callback();
      }
    }, 60);
  }
}

export const soundManager = new SoundEngine();
