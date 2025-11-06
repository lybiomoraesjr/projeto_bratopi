import axios from "axios";
import http from "./http";
import type { Route, RouteForm } from "../types/route.types";

type MongoId = string;

export type RoutePayload = RouteForm;
export type RouteRecord = Route;

type RouteResponse = {
	_id?: MongoId;
	id?: MongoId;
	name?: string;
	paradas?: Array<MongoId | { _id: MongoId }>;
	alunos?: Array<MongoId | { _id: MongoId }>;
	dataHoraInicio?: string | null;
	dataHoraFim?: string | null;
	frequenciaDias?: string[] | null;
	status?: string | null;
};

const DEFAULT_PERIODICITY = "daily";
const DAYS_OF_WEEK = [
	"Segunda",
	"Terça",
	"Quarta",
	"Quinta",
	"Sexta",
	"Sábado",
	"Domingo",
];
const FREQUENCY_PRESETS: Record<string, string[]> = {
	daily: [...DAYS_OF_WEEK],
	weekdays: DAYS_OF_WEEK.slice(0, 5),
	weekends: DAYS_OF_WEEK.slice(5),
};

const normalizeFrequencyList = (values?: string[] | null): string[] => {
	if (!Array.isArray(values)) return [];
	const seen = new Set<string>();
	const ordered: string[] = [];
	for (const value of values) {
		if (typeof value !== "string") continue;
		if (!DAYS_OF_WEEK.includes(value)) continue;
		if (seen.has(value)) continue;
		seen.add(value);
		ordered.push(value);
	}
	ordered.sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b));
	return ordered;
};

const inferPeriodicity = (
	frequenciaDias?: string[] | null,
	status?: string | null,
	fallback?: string,
): string => {
	const normalized = normalizeFrequencyList(frequenciaDias);
	if (normalized.length) {
		for (const [key, preset] of Object.entries(FREQUENCY_PRESETS)) {
			if (
				preset.length === normalized.length &&
				preset.every((dia, index) => dia === normalized[index])
			) {
				return key;
			}
		}
	}
	if (status === "inativa") {
		return fallback ?? DEFAULT_PERIODICITY;
	}
	return fallback ?? DEFAULT_PERIODICITY;
};

const toTimeString = (value?: string | null): string => {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
};

const toISODate = (time: string | undefined): string | undefined => {
	if (!time) return undefined;
	const [hours, minutes] = time.split(":").map(Number);
	if (
		Number.isNaN(hours) ||
		hours === undefined ||
		Number.isNaN(minutes) ||
		minutes === undefined
	) {
		return undefined;
	}
	const date = new Date();
	date.setHours(hours, minutes, 0, 0);
	return date.toISOString();
};

const normalizeRoute = (
	route: RouteResponse,
	fallback?: RoutePayload,
): RouteRecord => {
	const stopSequence = Array.isArray(route.paradas)
		? route.paradas.map((item) =>
			typeof item === "string"
				? item
				: typeof item === "object" && item && "_id" in item
					? String(item._id)
					: "",
		  ).filter(Boolean)
		: fallback?.stopSequence ?? [];
	const selectedStudents = Array.isArray(route.alunos)
		? route.alunos.map((item) =>
			typeof item === "string"
				? item
				: typeof item === "object" && item && "_id" in item
					? String(item._id)
					: "",
		  ).filter(Boolean)
		: fallback?.selectedStudents ?? [];
	const periodicity = inferPeriodicity(
		route.frequenciaDias,
		route.status,
		fallback?.periodicity ?? DEFAULT_PERIODICITY,
	);

	return {
		id: route._id ?? route.id ?? "",
		name: route.name ?? fallback?.name ?? "",
		startStopId:
			stopSequence[0] ?? fallback?.startStopId ?? fallback?.stopSequence?.[0] ?? "",
		endStopId:
			stopSequence[stopSequence.length - 1] ??
			fallback?.endStopId ??
			fallback?.stopSequence?.[fallback.stopSequence.length - 1] ??
			"",
		startTime: toTimeString(route.dataHoraInicio) ?? fallback?.startTime ?? "",
		endTime: toTimeString(route.dataHoraFim) ?? fallback?.endTime ?? "",
		periodicity,
		selectedStudents,
		stopSequence,
	};
};

const buildRequestBody = (payload: RoutePayload) => {
	const stopSequence = payload.stopSequence.length
		? payload.stopSequence
		: [payload.startStopId, payload.endStopId].filter(Boolean);
	const frequenciaDiasPreset = FREQUENCY_PRESETS[payload.periodicity] ?? FREQUENCY_PRESETS[DEFAULT_PERIODICITY];

	return {
		name: payload.name,
		paradas: stopSequence,
		alunos: payload.selectedStudents,
		frequenciaDias: [...frequenciaDiasPreset],
		dataHoraInicio: toISODate(payload.startTime),
		dataHoraFim: toISODate(payload.endTime),
	};
};

export const listRoutes = async (): Promise<RouteRecord[]> => {
	const { data } = await http.get<RouteResponse[]>("/api/rotas");
	return data.map((route) => normalizeRoute(route));
};

export const getRouteById = async (id: string): Promise<RouteRecord> => {
	const { data } = await http.get<RouteResponse>(`/api/rotas/${id}`);
	return normalizeRoute(data);
};

export const createRoute = async (
	payload: RoutePayload,
): Promise<RouteRecord> => {
	const { data } = await http.post<RouteResponse>(
		"/api/rotas",
		buildRequestBody(payload),
	);
	return normalizeRoute(data, payload);
};

export const updateRoute = async (
	id: string,
	payload: RoutePayload,
): Promise<RouteRecord> => {
	const { data } = await http.put<RouteResponse>(
		`/api/rotas/${id}`,
		buildRequestBody(payload),
	);
	return normalizeRoute(data, payload);
};

export const deleteRoute = async (id: string): Promise<void> => {
	await http.delete(`/api/rotas/${id}`);
};

export const unwrapAxiosError = (error: unknown): Error => {
	if (axios.isAxiosError(error)) {
		const message =
			typeof error.response?.data === "object" &&
			error.response?.data !== null
				? (error.response.data as { error?: string }).error
				: undefined;
		return new Error(message || "Ocorreu um erro ao se comunicar com a API");
	}
	if (error instanceof Error) return error;
	return new Error("Erro inesperado ao executar requisição");
};
