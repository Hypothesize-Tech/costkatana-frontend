import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types';

interface UseApiOptions {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

export function useApi<T = any>(
    apiFunction: (...args: any[]) => Promise<T>,
    options?: UseApiOptions
) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(
        async (...args: any[]) => {
            try {
                setLoading(true);
                setError(null);
                const result = await apiFunction(...args);
                setData(result);
                options?.onSuccess?.(result);
                return result;
            } catch (err) {
                const error = err as AxiosError<ApiResponse>;
                const errorMessage = error.response?.data?.message || 'An error occurred';
                setError(errorMessage);
                options?.onError?.(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [apiFunction, options]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, error, loading, execute, reset };
}