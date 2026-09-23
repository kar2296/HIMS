/**
 * Loads data once per `fetcher` identity and exposes { data, loading, error, reload }.
 *
 * State is only set inside the promise callbacks (never synchronously in the effect body),
 * and a stale response from a previous fetcher/reload is ignored.
 * `fetcher` must be memoized (useCallback) on the values it depends on.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { errorText } from './emrHelpers';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  options?: { errorMessage?: string; onSuccess?: (data: T) => void },
) {
  const [state, setState] = useState<AsyncState<T>>({ data: initialData, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  // Latest options without re-triggering the fetch when an inline callback changes identity.
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    let active = true;
    fetcher()
      .then((data) => {
        if (!active) return;
        optionsRef.current?.onSuccess?.(data);
        setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (!active) return;
        setState((prev) => ({ ...prev, loading: false, error: errorText(err, optionsRef.current?.errorMessage) }));
      });
    return () => {
      active = false;
    };
  }, [fetcher, reloadKey]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, reload };
}
