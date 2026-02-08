import { useState, useCallback } from 'react';

interface UseFetchOptions {
  skip?: boolean;
  refetchInterval?: number;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (options.skip) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, options.skip]);

  const refetch = useCallback(async () => {
    await fetch();
  }, [fetch]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetch,
    refetch,
    reset,
    setData,
    setError,
  };
}
