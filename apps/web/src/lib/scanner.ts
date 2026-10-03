import { BrowserMultiFormatReader, Result, Exception } from '@zxing/browser';

export interface ScannerConfig {
  onCodeDetected?: (code: string) => void;
  onError?: (error: Error) => void;
  videoElement?: HTMLVideoElement;
  formats?: string[];
}

class BarcodeScanner {
  private reader: BrowserMultiFormatReader;
  private isScanning: boolean = false;
  private config: ScannerConfig = {};

  constructor() {
    this.reader = new BrowserMultiFormatReader();
  }

  async startCamera(config: ScannerConfig): Promise<HTMLVideoElement | null> {
    try {
      this.config = config;
      this.isScanning = true;

      if (!config.videoElement) {
        return null;
      }

      // Obtener cámaras disponibles
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error('No se encontró ninguna cámara disponible');
      }

      // Usar cámara trasera preferentemente (última en lista)
      const selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId;

      // Iniciar escaneo continuo
      await this.reader.decodeFromVideoDevice(
        selectedDeviceId,
        config.videoElement,
        (result: Result | null, error: Exception | null) => {
          if (result && result.getText()) {
            const code = result.getText().trim();
            // Validar que sea un código válido (no escaneos parciales)
            if (code.length >= 8) {
              this.isScanning = false; // Detener después de detectar
              config.onCodeDetected?.(code);
            }
          }

          if (error && !(error instanceof Exception)) {
            // Ignorar excepciones normales de zxing
          }
        }
      );

      return config.videoElement;
    } catch (error) {
      this.isScanning = false;
      const err = error instanceof Error ? error : new Error('Error al acceder a la cámara');
      config.onError?.(err);
      throw err;
    }
  }

  async stopCamera(): Promise<void> {
    try {
      this.isScanning = false;
      await this.reader.reset();
    } catch (error) {
      console.error('Error deteniendo cámara:', error);
    }
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  resumeScanning(): void {
    this.isScanning = true;
  }

  pauseScanning(): void {
    this.isScanning = false;
  }
}

export const scanner = new BarcodeScanner();
