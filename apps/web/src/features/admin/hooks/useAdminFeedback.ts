import { useState, useCallback } from 'react';

export interface AdminFeedbackState {
  error: string | null;
  success: string | null;
  loading: boolean;
}

export interface UseAdminFeedbackReturn extends AdminFeedbackState {
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
  setLoading: (val: boolean) => void;
  clearFeedback: () => void;
  /** Wraps an async operation: sets loading, clears error, shows success or error on completion */
  run: (fn: () => Promise<void>, successMsg?: string) => Promise<void>;
}

export function useAdminFeedback(successDurationMs = 3000): UseAdminFeedbackReturn {
  const [state, setState] = useState<AdminFeedbackState>({
    error: null,
    success: null,
    loading: false,
  });

  const setError = useCallback((msg: string | null) => {
    setState((s) => ({ ...s, error: msg, success: null }));
  }, []);

  const setSuccess = useCallback(
    (msg: string | null) => {
      setState((s) => ({ ...s, success: msg, error: null }));
      if (msg && successDurationMs > 0) {
        setTimeout(() => setState((s) => ({ ...s, success: null })), successDurationMs);
      }
    },
    [successDurationMs],
  );

  const setLoading = useCallback((val: boolean) => {
    setState((s) => ({ ...s, loading: val }));
  }, []);

  const clearFeedback = useCallback(() => {
    setState({ error: null, success: null, loading: false });
  }, []);

  const run = useCallback(
    async (fn: () => Promise<void>, successMsg = 'Хадгалагдлаа') => {
      setState((s) => ({ ...s, loading: true, error: null, success: null }));
      try {
        await fn();
        setState({ loading: false, error: null, success: successMsg });
        if (successDurationMs > 0) {
          setTimeout(() => setState((s) => ({ ...s, success: null })), successDurationMs);
        }
      } catch (err: unknown) {
        setState({
          loading: false,
          error: err instanceof Error ? err.message : 'Алдаа гарлаа',
          success: null,
        });
      }
    },
    [successDurationMs],
  );

  return { ...state, setError, setSuccess, setLoading, clearFeedback, run };
}
