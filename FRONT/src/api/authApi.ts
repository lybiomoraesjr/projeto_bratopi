import axios from "axios";
import http from "./http";

export type LoginPayload = {
	email: string;
	password: string;
};

type LoginResponseUser = {
	name: string;
	email: string;
	role?: string;
};

type LoginResponse = {
	message: string;
	user: LoginResponseUser;
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
	const { data } = await http.post<LoginResponse>("/api/auth/login", payload);
	return data;
};

export const logout = async (): Promise<void> => {
	await http.post("/api/auth/logout");
};

export const unwrapAxiosError = (error: unknown): Error => {
	if (axios.isAxiosError(error)) {
		const message =
			typeof error.response?.data === "object" && error.response?.data !== null
				? (error.response.data as { error?: string }).error
				: undefined;
		return new Error(message || "Ocorreu um erro ao se comunicar com a API");
	}
	if (error instanceof Error) return error;
	return new Error("Erro inesperado ao executar requisição");
};
