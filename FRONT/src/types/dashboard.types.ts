export type DashboardSummary = {
    totalRoutes: number;
    inProgress: number;
    finished: number;
    alerts: number;
};

export type DashboardRouteAction = 'view' | 'start' | 'notify' | string;

export type DashboardRouteRecord = {
    id: string;
    name: string;
    vehicle: string;
    driver: string;
    status: string;
    statusColor: string;
    partida: string;
    chegada: string;
    actions: DashboardRouteAction[];
};

export type DashboardRouteFilters = {
    date?: string;
    status?: string;
    search?: string;
};
