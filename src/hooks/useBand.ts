import { useCallback, useEffect, useState } from 'react';
import { type BandData, bleService } from '../services/ble';

const INITIAL: BandData = {
  heartRate: null,
  battery: null,
  steps: null,
  deviceName: '',
  connected: false,
};

export function useBand() {
  const [data, setData] = useState<BandData>(INITIAL);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return bleService.subscribe(setData);
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      await bleService.connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await bleService.disconnect();
  }, []);

  const vibrate = useCallback(async () => {
    try {
      await bleService.vibrate(2);
    } catch {
      setError('Failed to vibrate band');
    }
  }, []);

  return { data, connecting, error, connect, disconnect, vibrate };
}
