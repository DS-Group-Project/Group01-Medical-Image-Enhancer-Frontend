import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for polling a callback function at a specified interval.
 * 
 * @param {Function} callback - The function to call periodically.
 * @param {number} interval - The interval in milliseconds.
 * @param {boolean} [enabled=false] - Whether polling should be active initially.
 * @returns {{ isPolling: boolean, startPolling: Function, stopPolling: Function }}
 */
export const usePolling = (callback, interval, enabled = false) => {
  const [isPolling, setIsPolling] = useState(enabled);
  const savedCallback = useRef(callback);
  const timerRef = useRef(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  useEffect(() => {
    // If enabled prop changes, update state
    setIsPolling(enabled);
  }, [enabled]);

  useEffect(() => {
    if (!isPolling) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const tick = () => {
      savedCallback.current();
    };

    timerRef.current = setInterval(tick, interval);
    
    // Cleanup on unmount or when polling stops
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPolling, interval]);

  return { isPolling, startPolling, stopPolling };
};

export default usePolling;
