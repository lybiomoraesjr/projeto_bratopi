import axios from 'axios';
import http from './http';
import type {
    DashboardRouteFilters,
    DashboardRouteRecord,
    DashboardSummary,
} from '../types/dashboard.types';

const DEFAULT_SUMMARY: DashboardSummary = {
    totalRoutes: 0,
    inProgress: 0,
    finished: 0,
    alerts: 0,
};

type DashboardSummaryResponse = Partial<DashboardSummary> & {
    totalRoutes?: number;
    inProgress?: number;
    finished?: number;
    alerts?: number;
};

type DashboardRouteResponse = {
    _id?: string;
    id?: string;
    name?: string;
    vehicle?: string;
    vehicleName?: string;
    driver?: string;
    motorista?: string;
    status?: string;
    statusColor?: string;
    partida?: string;
    inicio?: string;
    chegada?: string;
    fimPrevisto?: string;
    actions?: string[];
};

const fallbackRouteId = (route: DashboardRouteResponse): string => {
    if (route._id) return route._id;
    if (route.id) return route.id;
    if (route.name) return route.name;
    return `dashboard-route-${Math.random().toString(36).slice(2, 10)}`;
};

const inferStatusColor = (status?: string, explicitColor?: string): string => {
    if (explicitColor) return explicitColor;
    if (!status) return 'gray';

    const normalized = status.toLowerCase();
    if (normalized.includes('andamento') || normalized.includes('inici')) {
        return 'yellow';
    }
    if (normalized.includes('concl') || normalized.includes('finaliz')) {
        return 'green';
    }
    if (normalized.includes('atras') || normalized.includes('alert')) {
        return 'red';
    }
    return 'gray';
};

const normalizeDashboardRoute = (route: DashboardRouteResponse): DashboardRouteRecord => ({
    id: fallbackRouteId(route),
    name: route.name ?? '',
    vehicle: route.vehicle ?? route.vehicleName ?? '',
    driver: route.driver ?? route.motorista ?? '',
    status: route.status ?? '',
    statusColor: inferStatusColor(route.status, route.statusColor),
    partida: route.partida ?? route.inicio ?? '',
    chegada: route.chegada ?? route.fimPrevisto ?? '',
    actions: Array.isArray(route.actions) ? route.actions : [],
});

const normalizeDashboardSummary = (
    summary?: DashboardSummaryResponse,
): DashboardSummary => ({
    totalRoutes: summary?.totalRoutes ?? DEFAULT_SUMMARY.totalRoutes,
    inProgress: summary?.inProgress ?? DEFAULT_SUMMARY.inProgress,
    finished: summary?.finished ?? DEFAULT_SUMMARY.finished,
    alerts: summary?.alerts ?? DEFAULT_SUMMARY.alerts,
});

export const fetchDashboardSummary = async (
    filters?: DashboardRouteFilters,
): Promise<DashboardSummary> => {
    const { data } = await http.get<DashboardSummaryResponse>(
        '/api/dashboard/summary',
        { params: filters },
    );
    return normalizeDashboardSummary(data);
};

export const fetchDashboardRoutes = async (
    filters?: DashboardRouteFilters,
): Promise<DashboardRouteRecord[]> => {
    const { data } = await http.get<DashboardRouteResponse[]>(
        '/api/dashboard/routes',
        { params: filters },
    );
    return data.map(normalizeDashboardRoute);
};

export const unwrapAxiosError = (error: unknown): Error => {
    if (axios.isAxiosError(error)) {
        const message =
            typeof error.response?.data === 'object' &&
            error.response?.data !== null
                ? (error.response.data as { error?: string }).error
                : undefined;
        return new Error(message || 'Ocorreu um erro ao se comunicar com a API');
    }
    if (error instanceof Error) return error;
    return new Error('Erro inesperado ao executar requisição');
};
