import { useState, useCallback } from 'react';
import { Pagination } from '@/types';

interface UsePaginationOptions {
    initialPage?: number;
    initialLimit?: number;
    onPageChange?: (page: number) => void;
}

export function usePagination(options?: UsePaginationOptions) {
    const [page, setPage] = useState(options?.initialPage || 1);
    const [limit, setLimit] = useState(options?.initialLimit || 20);

    const goToPage = useCallback((newPage: number) => {
        setPage(newPage);
        options?.onPageChange?.(newPage);
    }, [options]);

    const nextPage = useCallback(() => {
        goToPage(page + 1);
    }, [page, goToPage]);

    const previousPage = useCallback(() => {
        if (page > 1) {
            goToPage(page - 1);
        }
    }, [page, goToPage]);

    const changeLimit = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1); // Reset to first page when changing limit
    }, []);

    const getPaginationProps = (paginationData?: Pagination) => {
        if (!paginationData) return null;

        return {
            currentPage: page,
            totalPages: paginationData.pages,
            totalItems: paginationData.total,
            itemsPerPage: limit,
            hasNext: paginationData.hasNext || false,
            hasPrev: paginationData.hasPrev || false,
            canGoNext: page < paginationData.pages,
            canGoPrev: page > 1,
        };
    };

    return {
        page,
        limit,
        setPage: goToPage,
        setLimit: changeLimit,
        nextPage,
        previousPage,
        getPaginationProps,
    };
}