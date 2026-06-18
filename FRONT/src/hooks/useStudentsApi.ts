import { useCallback } from "react";
import {
	listStudents as listStudentsRequest,
	getStudentById as getStudentByIdRequest,
	createStudent as createStudentRequest,
	updateStudent as updateStudentRequest,
	deleteStudent as deleteStudentRequest,
	unwrapAxiosError,
	type StudentPayload,
	type StudentRecord,
} from "../api/studentsApi";

export const useStudentsApi = () => {
	const listStudents = useCallback(async (): Promise<StudentRecord[]> => {
		try {
			return await listStudentsRequest();
		} catch (error) {
			throw unwrapAxiosError(error);
		}
	}, []);

	const getStudentById = useCallback(
		async (id: string): Promise<StudentRecord> => {
			try {
				return await getStudentByIdRequest(id);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const createStudent = useCallback(
		async (payload: StudentPayload): Promise<StudentRecord> => {
			try {
				return await createStudentRequest(payload);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const updateStudent = useCallback(
		async (id: string, payload: StudentPayload): Promise<StudentRecord> => {
			try {
				return await updateStudentRequest(id, payload);
			} catch (error) {
				throw unwrapAxiosError(error);
			}
		},
		[],
	);

	const deleteStudent = useCallback(async (id: string): Promise<void> => {
		try {
			await deleteStudentRequest(id);
		} catch (error) {
			throw unwrapAxiosError(error);
		}
	}, []);

	return {
		listStudents,
		getStudentById,
		createStudent,
		updateStudent,
		deleteStudent,
	};
};

export type { StudentPayload, StudentRecord } from "../api/studentsApi";
