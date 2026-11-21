/**
 * Gerenciador de Áudio com Web Audio API
 * Gera sons proceduralmente para evitar carregamento de arquivos externos (MP3/WAV)
 */

/** Climas de trilha: cada tela do jogo escolhe um. */
export type MusicContext = "menu" | "ato1" | "ato2" | "chefe" | "final";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _enabled = true;
  private ambientOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private ambientLfos: OscillatorNode[] = [];
  private ambientFilter: BiquadFilterNode | null = null;
  private musicGain: GainNode | null = null;
  private tavernAudio: HTMLAudioElement | null = null;
  private isAmbientPlaying = false;
  private currentMusicUrl: string | null = null;
  private currentContext: MusicContext | null = null;
  private fadeInterval: any = null;
  private _volume = 0.35;

  get volume() { return this._volume; }
  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.tavernAudio) {
      this.tavernAudio.volume = this._volume;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.1);
    }
  }

  private lastContext: MusicContext | undefined = undefined;

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
      this.ctx.resume().catch(() => {});
      // Navegadores só liberam áudio após um gesto do usuário.
      const resume = () => { this.ctx?.resume().catch(() => {}); };
      document.addEventListener("pointerdown", resume, { once: true });
      document.addEventListener("keydown", resume, { once: true });
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

  // Trilhas por contexto. Coloque os MP3 (em loop) em client/public/music/.
  // Se o arquivo não existir ou falhar, toca o ambiente procedural do contexto.
  private static TRACKS: Record<MusicContext, string> = {
    menu: "/music/menu.mp3",
    ato1: "/music/ato1.mp3",
    ato2: "/music/ato2.mp3",
    chefe: "/music/chefe.mp3",
    final: "/music/final.mp3",
  };

  // --- TRILHA SONORA DINÂMICA ---
  public startAmbientMusic(contextId?: MusicContext) {
    // Sempre registra o último contexto — mesmo mutado, para retomar no unmute.
    this.lastContext = contextId;
    if (!this.enabled || !contextId) return;
    if (this.isAmbientPlaying && this.currentContext === contextId) return;

    this.currentContext = contextId;
    const trackUrl = SoundEngine.TRACKS[contextId];
    this.stopAmbientMusic(() => {
      // O jogador pode ter trocado de tela durante o fade.
      if (this.currentContext !== contextId || this.isAmbientPlaying) return;
      this.playFileAmbient(trackUrl, contextId);
    });
  }

  private playFileAmbient(url: string, context: MusicContext) {
    if (!this.enabled) return;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    this.tavernAudio = audio;
    this.currentMusicUrl = url;
    this.isAmbientPlaying = true;

    // Arquivo ausente ou inválido → ambiente procedural do mesmo contexto.
    audio.addEventListener(
      "error",
      () => {
        if (this.tavernAudio !== audio) return;
        this.tavernAudio = null;
        this.currentMusicUrl = null;
        this.isAmbientPlaying = false;
        if (this.enabled && this.currentContext === context) {
          this.playProceduralAmbient(context);
        }
      },
      { once: true }
    );

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

  // --- Ambiente procedural: pad de sintetizador por contexto (nunca depende de arquivo) ---
  private static PRESETS: Record<
    MusicContext,
    { notes: number[]; wave: OscillatorType; cutoff: number; lfoRate: number; level: number }
  > = {
    // Lá menor com 9ª: misterioso, convidativo.
    menu: { notes: [110, 164.81, 261.63, 392], wave: "sawtooth", cutoff: 650, lfoRate: 0.05, level: 0.035 },
    // Ré menor quente e estável: foco para programar.
    ato1: { notes: [73.42, 110, 174.61, 261.63], wave: "triangle", cutoff: 900, lfoRate: 0.07, level: 0.045 },
    // Mi menor com 9ª, timbre "de vidro": a mente da máquina.
    ato2: { notes: [82.41, 123.47, 196, 293.66, 369.99], wave: "sine", cutoff: 1600, lfoRate: 0.11, level: 0.04 },
    // Trítono grave e filtro pulsando: tensão de chefe.
    chefe: { notes: [65.41, 92.5, 130.81, 185], wave: "sawtooth", cutoff: 520, lfoRate: 0.35, level: 0.04 },
    // Fá maior com 7ª: resolução esperançosa.
    final: { notes: [87.31, 130.81, 220, 329.63], wave: "triangle", cutoff: 1300, lfoRate: 0.06, level: 0.045 },
  };

  private playProceduralAmbient(context: MusicContext) {
    if (!this.ctx) this.init();
    const ctx = this.ctx;
    if (!ctx) return;

    const preset = SoundEngine.PRESETS[context];
    const t = ctx.currentTime;
    this.isAmbientPlaying = true;

    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.connect(ctx.destination);
    }
    this.musicGain.gain.setValueAtTime(this._volume, t);

    // Filtro passa-baixa "respirando" para o pad soar vivo.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(preset.cutoff, t);
    filter.Q.setValueAtTime(0.7, t);
    filter.connect(this.musicGain);

    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.setValueAtTime(preset.lfoRate, t);
    lfoDepth.gain.setValueAtTime(preset.cutoff * 0.35, t);
    lfo.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);
    lfo.start(t);
    this.ambientLfos.push(lfo);
    this.ambientFilter = filter;

    preset.notes.forEach((freq, i) => {
      // Duas vozes levemente desafinadas por nota dão largura ao pad.
      [-6, 6].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = preset.wave;
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(preset.level / (1 + i * 0.35), t + 4);
        osc.connect(gain);
        gain.connect(filter);
        osc.start(t);
        this.ambientOscillators.push({ osc, gain });
      });
    });
  }

  public stopAmbientMusic(callback?: () => void) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    // Para as camadas procedurais (fade de 1s, depois libera os nós).
    const t = this.ctx?.currentTime || 0;
    this.ambientOscillators.forEach(({ osc, gain }) => {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + 1);
      setTimeout(() => {
        try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch (e) {}
      }, 1100);
    });
    const lfos = this.ambientLfos;
    const filter = this.ambientFilter;
    setTimeout(() => {
      lfos.forEach((lfo) => { try { lfo.stop(); lfo.disconnect(); } catch (e) {} });
      try { filter?.disconnect(); } catch (e) {}
    }, 1100);
    this.ambientOscillators = [];
    this.ambientLfos = [];
    this.ambientFilter = null;

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
