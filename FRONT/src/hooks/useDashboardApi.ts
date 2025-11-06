import { useCallback } from 'react';
import {
    fetchDashboardRoutes,
    fetchDashboardSummary,
    unwrapAxiosError,
} from '../api/dashboardApi';
import type {
    DashboardRouteFilters,
    DashboardRouteRecord,
    DashboardSummary,
} from '../types/dashboard.types';

export const useDashboardApi = () => {
    const getRoutes = useCallback(
        async (filters?: DashboardRouteFilters): Promise<DashboardRouteRecord[]> => {
            try {
                return await fetchDashboardRoutes(filters);
            } catch (error) {
                throw unwrapAxiosError(error);
            }
        },
        [],
    );

    const getSummary = useCallback(
        async (filters?: DashboardRouteFilters): Promise<DashboardSummary> => {
            try {
                return await fetchDashboardSummary(filters);
            } catch (error) {
                throw unwrapAxiosError(error);
            }
        },
        [],
    );

    return {
        getRoutes,
        getSummary,
    };
};

export type {
    DashboardRouteFilters,
    DashboardRouteRecord,
    DashboardSummary,
} from '../types/dashboard.types';
