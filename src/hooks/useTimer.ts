import { useCallback, useRef, useState } from 'react';
import { bleService } from '../services/ble';

export function useTimer() {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const start = useCallback((seconds: number) => {
    if (cancelRef.current) cancelRef.current();
    setRemaining(seconds);
    setRunning(true);
    cancelRef.current = bleService.startTimer(seconds, (r) => {
      setRemaining(r);
      if (r <= 0) setRunning(false);
    });
  }, []);

  const cancel = useCallback(() => {
    if (cancelRef.current) cancelRef.current();
    cancelRef.current = null;
    setRunning(false);
    setRemaining(0);
  }, []);

  return { remaining, running, start, cancel };
}
