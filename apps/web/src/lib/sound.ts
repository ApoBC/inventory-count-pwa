class SoundPlayer {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Inicializar AudioContext si está disponible
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new window.AudioContext();
    }
  }

  /**
   * Reproducer un beep usando Web Audio API
   * Crea un tono de 1000Hz durante 200ms
   */
  playBeep(frequency: number = 1000, duration: number = 200): void {
    if (!this.audioContext) {
      return;
    }

    try {
      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Fade in/out para suavizar
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000 - 0.01);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (error) {
      console.error('Error reproduciendo sonido:', error);
    }
  }

  /**
   * Reproducir dos beeps para indicar éxito
   */
  playSuccessSound(): void {
    this.playBeep(800, 150);
    setTimeout(() => this.playBeep(1200, 150), 200);
  }

  /**
   * Reproducir beep de error
   */
  playErrorSound(): void {
    this.playBeep(400, 300);
  }

  /**
   * Reproducir beep único (escaneo detectado)
   */
  playScanSound(): void {
    this.playBeep(1000, 100);
  }
}

export const soundPlayer = new SoundPlayer();
