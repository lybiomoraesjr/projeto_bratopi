import { useCallback } from 'react';
import { useRoutesApi } from './useRoutesApi';
import { useStopsApi } from './useStopsApi';
import { useStudentsApi } from './useStudentsApi';
import type {
    DashboardRouteFilters,
    DashboardRouteRecord,
    DashboardSummary,
} from '../types/dashboard.types';
import type { RouteRecord } from '../api/routesApi';
import type { StopRecord } from '../api/stopsApi';
import type { StudentRecord } from '../api/studentsApi';

type ClassifiedRoute = {
    record: DashboardRouteRecord;
    statusKey: string;
    isAlert: boolean;
    searchText: string;
};

export type DashboardData = {
    summary: DashboardSummary;
    routes: DashboardRouteRecord[];
};

const parseTimeToDate = (time: string): Date | null => {
    if (!time) return null;
    const [hoursPart, minutesPart] = time.split(':');
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    const date = new Date();
    date.setSeconds(0, 0);
    date.setHours(hours, minutes, 0, 0);
    return date;
};

const classifyRoute = (route: RouteRecord, now: Date) => {
    const start = parseTimeToDate(route.startTime);
    const end = parseTimeToDate(route.endTime);

    if (!start || !end) {
        return {
            label: 'Sem horário',
            color: 'gray',
            key: 'alerta',
            isAlert: true,
            actions: ['view'],
        } as const;
    }

    if (now < start) {
        return {
            label: 'Agendada',
            color: 'gray',
            key: 'agendada',
            isAlert: false,
            actions: ['view', 'start'],
        } as const;
    }

    if (now >= start && now <= end) {
        return {
            label: 'Em andamento',
            color: 'yellow',
            key: 'andamento',
            isAlert: false,
            actions: ['view'],
        } as const;
    }

    const minutesAfterEnd = (now.getTime() - end.getTime()) / 60000;
    if (minutesAfterEnd > 15) {
        return {
            label: 'Atrasada',
            color: 'red',
            key: 'atrasado',
            isAlert: true,
            actions: ['view', 'start'],
        } as const;
    }

    return {
        label: 'Concluída',
        color: 'green',
        key: 'concluido',
        isAlert: false,
        actions: ['view'],
    } as const;
};

const createStopLookup = (stops: StopRecord[]) => {
    const map = new Map<string, StopRecord>();
    for (const stop of stops) {
        map.set(stop.id, stop);
    }
    return map;
};

const createStudentLookup = (students: StudentRecord[]) => {
    const set = new Set<string>();
    for (const student of students) {
        set.add(student.id);
    }
    return set;
};

const buildDashboardRecord = (
    route: RouteRecord,
    classification: ReturnType<typeof classifyRoute>,
): DashboardRouteRecord => ({
    id: route.id,
    name: route.name || 'Rota sem nome',
    vehicle: '—',
    driver: '—',
    status: classification.label,
    statusColor: classification.color,
    partida: route.startTime || '—',
    chegada: route.endTime || '—',
    actions: classification.actions.slice(),
});

const computeSummary = (items: ClassifiedRoute[]): DashboardSummary => {
    const summary: DashboardSummary = {
        totalRoutes: items.length,
        inProgress: 0,
        finished: 0,
        alerts: 0,
    };

    for (const item of items) {
        if (item.statusKey === 'andamento') {
            summary.inProgress += 1;
        }
        if (item.statusKey === 'concluido') {
            summary.finished += 1;
        }
        if (item.isAlert) {
            summary.alerts += 1;
        }
    }

    return summary;
};

const applyFilters = (
    items: ClassifiedRoute[],
    filters?: DashboardRouteFilters,
): ClassifiedRoute[] => {
    if (!filters) return items;
    let result = items;

    if (filters.status && filters.status !== 'todos') {
        result = result.filter((item) => item.statusKey === filters.status);
    }

    if (filters.search) {
        const term = filters.search.trim().toLowerCase();
        if (term) {
            result = result.filter((item) => item.searchText.includes(term));
        }
    }

    return result;
};

export const useDashboard = () => {
    const { listRoutes } = useRoutesApi();
    const { listStops } = useStopsApi();
    const { listStudents } = useStudentsApi();

    const loadDashboard = useCallback(
    async (filters?: DashboardRouteFilters): Promise<DashboardData> => {
            const [routes, stops, students] = await Promise.all([
                listRoutes(),
                listStops(),
                listStudents(),
            ]);

            const stopLookup = createStopLookup(stops);
            const studentLookup = createStudentLookup(students);
            const now = new Date();

            const classified: ClassifiedRoute[] = routes.map((route) => {
                const classification = classifyRoute(route, now);
                const startStopName = stopLookup.get(route.startStopId)?.name ?? '';
                const endStopName = stopLookup.get(route.endStopId)?.name ?? '';
                const record = buildDashboardRecord(route, classification);
                const searchText = [
                    record.name,
                    startStopName,
                    endStopName,
                    record.vehicle,
                    record.driver,
                ]
                    .join(' ')
                    .toLowerCase();

                const missingStops = !startStopName || !endStopName;
                const missingStudents = route.selectedStudents.some(
                    (studentId) => !studentLookup.has(studentId),
                );

                return {
                    record,
                    statusKey: classification.key,
                    isAlert: classification.isAlert || missingStops || missingStudents,
                    searchText,
                };
            });

            const filtered = applyFilters(classified, filters);
            const summary = computeSummary(filtered);

            return {
                summary,
                routes: filtered.map((item) => item.record),
            };
        },
        [listRoutes, listStops, listStudents],
    );

    return {
        loadDashboard,
    };
};

export type {
    DashboardRouteFilters,
    DashboardRouteRecord,
    DashboardSummary,
} from '../types/dashboard.types';
