export const ROUTE_PERIODICITY = {
    DAILY: 'daily',
    WEEKDAYS: 'weekdays',
    WEEKENDS: 'weekends',
} as const;

export type RoutePeriodicityValue = typeof ROUTE_PERIODICITY[keyof typeof ROUTE_PERIODICITY];

export const ROUTE_PERIODICITY_OPTIONS: ReadonlyArray<{
    value: RoutePeriodicityValue;
    label: string;
}> = Object.freeze([
    { value: ROUTE_PERIODICITY.DAILY, label: 'Diariamente' },
    { value: ROUTE_PERIODICITY.WEEKDAYS, label: 'Segunda a Sexta' },
    { value: ROUTE_PERIODICITY.WEEKENDS, label: 'Fins de Semana' },
]);

export const ROUTE_PERIODICITY_LABELS: ReadonlyMap<RoutePeriodicityValue, string> = new Map(
    ROUTE_PERIODICITY_OPTIONS.map(option => [option.value, option.label])
);
