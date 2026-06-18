import { useCallback } from "react";
import * as authApi from "../api/authApi";

export const useAuthApi = () => {
	const login = useCallback(async (payload: authApi.LoginPayload) => {
		try {
			return await authApi.login(payload);
		} catch (error) {
			throw authApi.unwrapAxiosError(error);
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			await authApi.logout();
		} catch (error) {
			throw authApi.unwrapAxiosError(error);
		}
	}, []);

	return { login, logout };
};
