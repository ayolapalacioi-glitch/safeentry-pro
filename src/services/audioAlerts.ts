// ==============================================================================
// ALARMAS Y SEÑALES AUDITIVAS INDUSTRIALES (WEB AUDIO API NATIVO)
// Diseñado para feedback en tiempo real en torniquetes y quioscos de portería
// ==============================================================================

class SoundService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tono de Ingreso Autorizado (Chime armónico doble ascendente)
  public playAccessGranted() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.12); // A5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Navegadores con autoplay estricto
    }
  }

  // Tono de Advertencia / Pre-alerta (Tono doble medio)
  public playAccessWarning() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.15].forEach(offset => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now + offset); // E5

        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } catch {
      // Silencio seguro
    }
  }

  // Tono de Bloqueo / Peligro (Buzzer industrial disonante)
  public playAccessDenied() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.2].forEach(offset => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now + offset); // A3 disonante

        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      });
    } catch {
      // Silencio seguro
    }
  }
}

export const soundService = new SoundService();
