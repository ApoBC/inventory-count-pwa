import { useEffect, useState } from 'react';

export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Verificar estado inicial
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('✓ Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('✗ Conexión perdida');
    };

    // Agregar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
