/**
 * Motor de trilha (client/src/lib/sounds.ts) rodando contra AudioContext/Audio
 * falsos: MP3 ausente cai no ambiente procedural, o mesmo clima não reinicia,
 * trocar de clima libera os nós antigos, mute para e retoma, volume aplica.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

class FakeParam {
  value = 0;
  targets: number[] = [];
  setValueAtTime(v: number) { this.value = v; }
  linearRampToValueAtTime(v: number) { this.value = v; }
  setTargetAtTime(v: number) { this.targets.push(v); }
  cancelScheduledValues() {}
}

class FakeNode {
  connected = false;
  disconnected = false;
  connect() { this.connected = true; }
  disconnect() { this.disconnected = true; }
}

const created = { oscillators: [] as FakeOscillator[], gains: [] as FakeGain[], filters: 0 };

class FakeOscillator extends FakeNode {
  type = "sine";
  frequency = new FakeParam();
  detune = new FakeParam();
  started = false;
  stopped = false;
  start() { this.started = true; }
  stop() { this.stopped = true; }
}
class FakeGain extends FakeNode { gain = new FakeParam(); }

class FakeAudioContext {
  currentTime = 0;
  state = "running";
  destination = new FakeNode();
  createOscillator() { const o = new FakeOscillator(); created.oscillators.push(o); return o; }
  createGain() { const g = new FakeGain(); created.gains.push(g); return g; }
  createBiquadFilter() { created.filters += 1; return Object.assign(new FakeNode(), { type: "lowpass", frequency: new FakeParam(), Q: new FakeParam() }); }
  resume() { return Promise.resolve(); }
}

const audios: FakeAudio[] = [];
class FakeAudio {
  loop = false;
  volume = 0;
  listeners: Record<string, (() => void)[]> = {};
  constructor(public src: string) { audios.push(this); }
  addEventListener(type: string, fn: () => void) { (this.listeners[type] ??= []).push(fn); }
  play() { return new Promise<void>(() => {}); }
  pause() {}
  fail() { (this.listeners.error ?? []).forEach((fn) => fn()); }
}

let sound: typeof import("../../client/src/lib/sounds")["soundManager"];

beforeAll(async () => {
  const g = globalThis as Record<string, unknown>;
  g.window = globalThis;
  g.AudioContext = FakeAudioContext;
  g.Audio = FakeAudio;
  g.document = { addEventListener() {}, removeEventListener() {} };
  ({ soundManager: sound } = await import("../../client/src/lib/sounds"));
});

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/** Avança o fade/troca e faz o MP3 do contexto "não existir". */
function settleWithMissingFile() {
  vi.advanceTimersByTime(100);
  audios.at(-1)?.fail();
}

const live = () => created.oscillators.filter((o) => o.started && !o.stopped);

describe("trilha sonora", () => {
  it("sem MP3, toca o ambiente procedural do contexto", () => {
    sound.startAmbientMusic("menu");
    settleWithMissingFile();
    expect(audios.at(-1)?.src).toBe("/music/menu.mp3");
    // 4 notas x 2 vozes desafinadas + 1 LFO do filtro.
    expect(live().length).toBe(9);
    expect(created.filters).toBe(1);
  });

  it("o mesmo clima não reinicia a música", () => {
    const before = created.oscillators.length;
    sound.startAmbientMusic("menu");
    vi.advanceTimersByTime(2000);
    expect(created.oscillators.length).toBe(before);
  });

  it("trocar de clima para e libera os nós antigos", () => {
    const old = live();
    sound.startAmbientMusic("chefe");
    settleWithMissingFile();
    vi.advanceTimersByTime(1200);
    expect(old.every((o) => o.stopped)).toBe(true);
    expect(audios.at(-1)?.src).toBe("/music/chefe.mp3");
    expect(live().length).toBe(9);
  });

  it("mute para tudo e o unmute retoma o último clima pedido", () => {
    sound.enabled = false;
    vi.advanceTimersByTime(1200);
    expect(live().length).toBe(0);

    sound.startAmbientMusic("ato2"); // pedido enquanto mudo: só registra
    vi.advanceTimersByTime(200);
    expect(live().length).toBe(0);

    sound.enabled = true;
    settleWithMissingFile();
    expect(audios.at(-1)?.src).toBe("/music/ato2.mp3");
    // ato2: 5 notas x 2 vozes + LFO.
    expect(live().length).toBe(11);
  });

  it("o controle de volume chega ao ambiente procedural", () => {
    sound.setVolume(0.5);
    const master = created.gains.find((g) => g.gain.targets.includes(0.5));
    expect(master).toBeDefined();
  });
});
