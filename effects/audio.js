/**
 * Electric Sound - Zumbido eléctrico y efectos de sonido
 * Generados con Web Audio API - sin archivos externos
 */

class ElectricSound {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    this.masterGain = null;
    this.ambientOscillators = [];

    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.15; // Volumen bajo para no abrumar
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API no disponible:', e);
    }
  }

  // Reanudar el contexto tras la primera interacción (política de autoplay)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Zumbido ambiental eléctrico
  startAmbientHum() {
    if (!this.isInitialized || this.ambientOscillators.length) return;

    const ctx = this.audioContext;

    // Frecuencias de zumbido eléctrico (armónicas)
    const frequencies = [60, 120, 180, 240]; // 60 Hz base + armónicas

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle'; // Base sinusoidal, armónicas triangulares
      osc.frequency.value = freq;

      // Amplitud decreciente para cada armónica
      const baseLevel = (0.08 / (idx + 1)) * 0.5;
      gain.gain.value = baseLevel;

      // Modulación sutil de amplitud (tremolo alrededor del nivel base)
      const modOsc = ctx.createOscillator();
      const modDepth = ctx.createGain();
      modOsc.frequency.value = 4 + idx * 0.5; // LFO lento
      modDepth.gain.value = baseLevel * 0.35; // profundidad sutil
      modOsc.connect(modDepth);
      modDepth.connect(gain.gain);
      modOsc.start();

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.ambientOscillators.push({ osc, gain, modOsc });
    });
  }

  // Sonido de chispa/descarga
  spark(x, y) {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Generar ruido blanco transitorio
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    // Filtro paso-alto para el sonido de chispa
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000 + Math.random() * 2000;

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + 0.15);
  }

  // Descarga eléctrica
  discharge() {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Sonido de tipo "crack" - barrida rápida de frecuencia
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);

    // Ruido adicional
    this.spark(0, 0);
  }

  // Sonido de carga (aumento de frecuencia)
  charge() {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Detener sonidos ambientes
  stop() {
    this.ambientOscillators.forEach(({ osc, modOsc }) => {
      try {
        osc.stop();
        modOsc.stop();
      } catch (e) {}
    });
    this.ambientOscillators = [];
  }

  setVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = value;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElectricSound;
}
