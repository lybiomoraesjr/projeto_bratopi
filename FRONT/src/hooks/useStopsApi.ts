import { useCallback } from "react";
import {
	listStops as listStopsRequest,
	getStopById as getStopByIdRequest,
	createStop as createStopRequest,
	updateStop as updateStopRequest,
	deleteStop as deleteStopRequest,
	unwrapAxiosError,
	type StopPayload,
	type StopRecord,
} from "../api/stopsApi";

export const useStopsApi = () => {
	const listStops = useCallback(async (): Promise<StopRecord[]> => {
		try {
			return await listStopsRequest();
		} catch (error) {
			throw unwrapAxiosError(error);
		}
	}, []);

	const getStopById = useCallback(
		async (id: string): Promise<StopRecord> => {
			try {
				return await getStopByIdRequest(id);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const createStop = useCallback(
		async (payload: StopPayload): Promise<StopRecord> => {
			try {
				return await createStopRequest(payload);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const updateStop = useCallback(
		async (id: string, payload: StopPayload): Promise<StopRecord> => {
			try {
				return await updateStopRequest(id, payload);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const deleteStop = useCallback(async (id: string): Promise<void> => {
		try {
			await deleteStopRequest(id);
		} catch (error) {
			throw unwrapAxiosError(error);
		}
	}, []);

	return {
		listStops,
		getStopById,
		createStop,
		updateStop,
		deleteStop,
	};
};

export type { StopPayload, StopRecord } from "../api/stopsApi";
