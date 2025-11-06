import axios from "axios";
import http from "./http";
import type { Stop } from "../types/stop.types";

export type StopPayload = Omit<Stop, "id">;
export type StopRecord = Stop;

type StopResponse = {
	id?: string;
	_id?: string;
	name?: string;
	address?: string | null;
	lat?: number | null;
	lng?: number | null;
};

const normalizeStop = (
	stop: StopResponse,
	fallback?: StopPayload,
): StopRecord => ({
	id: stop.id ?? stop._id ?? "",
	name: stop.name ?? fallback?.name ?? "",
	address: stop.address ?? fallback?.address ?? "",
	lat: typeof stop.lat === "number" ? stop.lat : fallback?.lat ?? 0,
	lng: typeof stop.lng === "number" ? stop.lng : fallback?.lng ?? 0,
});

const buildRequestBody = (payload: StopPayload) => ({
	name: payload.name,
	address: payload.address,
	lat: payload.lat,
	lng: payload.lng,
});

export const listStops = async (): Promise<StopRecord[]> => {
	const { data } = await http.get<StopResponse[]>("/api/paradas");
	return data.map((stop) => normalizeStop(stop));
};

export const getStopById = async (id: string): Promise<StopRecord> => {
	const { data } = await http.get<StopResponse>(`/api/paradas/${id}`);
	return normalizeStop(data);
};

export const createStop = async (
	payload: StopPayload,
): Promise<StopRecord> => {
	const { data } = await http.post<StopResponse>(
		"/api/paradas",
		buildRequestBody(payload),
	);
	return normalizeStop(data, payload);
};

export const updateStop = async (
	id: string,
	payload: StopPayload,
): Promise<StopRecord> => {
	const { data } = await http.put<StopResponse>(
		`/api/paradas/${id}`,
		buildRequestBody(payload),
	);
	return normalizeStop(data, payload);
};

export const deleteStop = async (id: string): Promise<void> => {
	await http.delete(`/api/paradas/${id}`);
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
