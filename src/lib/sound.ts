/**
 * Web Audio API-based sound effects for Pudding Puzzles.
 * All sounds are synthesized — no audio files needed.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Correct cell fill */
export function playFill() {
  playTone(600, 0.08, "sine", 0.12);
}

/** Wrong cell — penalty */
export function playWrong() {
  playTone(200, 0.15, "square", 0.1);
  setTimeout(() => playTone(160, 0.2, "square", 0.08), 80);
}

/** Mark X */
export function playMark() {
  playTone(400, 0.06, "triangle", 0.08);
}

/** Row or column completed */
export function playLineComplete() {
  playTone(523, 0.1, "sine", 0.12);
  setTimeout(() => playTone(659, 0.1, "sine", 0.12), 80);
  setTimeout(() => playTone(784, 0.15, "sine", 0.12), 160);
}

/** Puzzle cleared celebration */
export function playClear() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.2, "sine", 0.15), i * 120);
  });
}

/** Haptic feedback (mobile) */
export function haptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
