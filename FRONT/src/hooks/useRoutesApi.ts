import { useCallback } from "react";
import {
	listRoutes as listRoutesRequest,
	getRouteById as getRouteByIdRequest,
	createRoute as createRouteRequest,
	updateRoute as updateRouteRequest,
	deleteRoute as deleteRouteRequest,
	unwrapAxiosError,
	type RoutePayload,
	type RouteRecord,
} from "../api/routesApi";

export const useRoutesApi = () => {
	const listRoutes = useCallback(async (): Promise<RouteRecord[]> => {
		try {
			return await listRoutesRequest();
		} catch (error) {
			throw unwrapAxiosError(error);
		}
	}, []);

	const getRouteById = useCallback(
		async (id: string): Promise<RouteRecord> => {
			try {
				return await getRouteByIdRequest(id);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const createRoute = useCallback(
		async (payload: RoutePayload): Promise<RouteRecord> => {
			try {
				return await createRouteRequest(payload);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const updateRoute = useCallback(
		async (id: string, payload: RoutePayload): Promise<RouteRecord> => {
			try {
				return await updateRouteRequest(id, payload);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const deleteRoute = useCallback(async (id: string): Promise<void> => {
		try {
			await deleteRouteRequest(id);
		} catch (error) {
			throw unwrapAxiosError(error);
		}
	}, []);

	return {
		listRoutes,
		getRouteById,
		createRoute,
		updateRoute,
		deleteRoute,
	};
};

export type { RoutePayload, RouteRecord } from "../api/routesApi";
