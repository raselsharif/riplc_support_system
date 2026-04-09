import { useEffect, useRef } from 'react';

// Simple polling hook with visibility awareness
export const usePolling = (callback, intervalMs = 30000, immediate = true) => {
  const savedCallback = useRef(callback);
  const timerRef = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = async () => {
      if (document.hidden) return;
      await savedCallback.current?.();
    };

    if (immediate) tick();
    timerRef.current = setInterval(tick, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalMs, immediate]);
};

export default usePolling;
