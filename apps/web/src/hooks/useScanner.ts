import { useEffect, useRef, useState, useCallback } from 'react';
import { scanner } from '@/lib/scanner';
import { soundPlayer } from '@/lib/sound';
import { getProductByCode, cacheProduct } from '@/offline/db';
import { api } from '@/lib/api';
import { Product } from '@/types';

interface UseScannerOptions {
  sessionId: string;
  onCodeScanned?: (product: Product, code: string) => void;
  onError?: (error: Error) => void;
}

export function useScanner({ sessionId, onCodeScanned, onError }: UseScannerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const initializeScanner = useCallback(async () => {
    if (!videoRef.current || isInitializing) return;

    setIsInitializing(true);
    setError(null);

    try {
      // Solicitar permisos de cámara
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Cámara trasera
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Iniciar scanner
        await scanner.startCamera({
          videoElement: videoRef.current,
          onCodeDetected: handleCodeDetected,
          onError: (err) => {
            setError(err.message);
            onError?.(err);
          },
        });

        setIsScanning(true);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al inicializar scanner');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, onError]);

  const handleCodeDetected = useCallback(
    async (code: string) => {
      // Evitar escaneos duplicados rápidos
      if (lastScannedCode === code) {
        return;
      }

      setLastScannedCode(code);
      soundPlayer.playScanSound();

      try {
        let product: Product | undefined;

        // 1. Intentar obtener del caché local
        const cachedProduct = await getProductByCode(code);
        if (cachedProduct) {
          product = cachedProduct;
        } else {
          // 2. Si no está en caché, obtener de API
          try {
            product = await api.get<Product>(`/items/barcode/${code}`);
            // Guardar en caché
            if (product) {
              await cacheProduct(product);
            }
          } catch (apiError) {
            // Si falla API y no hay caché, mostrar error
            soundPlayer.playErrorSound();
            setError(`Producto no encontrado: ${code}`);
            setLastScannedCode(null);
            return;
          }
        }

        if (product) {
          // Vibración haptica
          if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]); // Patrón de vibración
          }

          // Sonido de éxito
          soundPlayer.playSuccessSound();

          // Llamar callback
          onCodeScanned?.(product, code);

          // Resetear después de 2 segundos para permitir siguiente escaneo
          setTimeout(() => {
            setLastScannedCode(null);
            scanner.resumeScanning();
          }, 2000);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Error procesando código');
        setError(err.message);
        onError?.(err);
        setLastScannedCode(null);
        scanner.resumeScanning();
      }
    },
    [lastScannedCode, onCodeScanned, onError]
  );

  const stopScanning = useCallback(async () => {
    try {
      await scanner.stopCamera();
      setIsScanning(false);

      // Detener stream de video
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.error('Error deteniendo scanner:', err);
    }
  }, []);

  const resumeScanning = useCallback(() => {
    scanner.resumeScanning();
  }, []);

  const pauseScanning = useCallback(() => {
    scanner.pauseScanning();
  }, []);

  useEffect(() => {
    return () => {
      // Limpiar al desmontar
      stopScanning();
    };
  }, [stopScanning]);

  return {
    videoRef,
    isInitializing,
    isScanning,
    error,
    lastScannedCode,
    initializeScanner,
    stopScanning,
    resumeScanning,
    pauseScanning,
    clearError: () => setError(null),
  };
}
