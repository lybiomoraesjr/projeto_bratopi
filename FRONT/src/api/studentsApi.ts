import axios from "axios";
import http from "./http";
import type { Student } from "../types/student.types";

export type StudentPayload = Student;
export type StudentRecord = Student & { id: string };

type StudentResponse = Partial<Student> & {
	_id: string;
	turno?: string;
	turma?: string;
	status?: Student["status"];
};

const DEFAULT_STATUS: Student["status"] = "Ativo";

const normalizeStudent = (
	student: StudentResponse,
	fallback?: StudentPayload,
): StudentRecord => ({
	id: student._id,
	name: student.name ?? fallback?.name ?? "",
	email: student.email ?? fallback?.email ?? "",
	cpf: student.cpf ?? fallback?.cpf ?? "",
	matricula: student.matricula ?? fallback?.matricula ?? "",
	turno: student.turno ?? student.turma ?? fallback?.turno ?? "",
	escola: student.escola ?? fallback?.escola ?? "",
	endereco: student.endereco ?? fallback?.endereco ?? "",
	telefone: student.telefone ?? fallback?.telefone ?? "",
	status: student.status ?? fallback?.status ?? DEFAULT_STATUS,
});

const buildRequestBody = (payload: StudentPayload) => ({
	name: payload.name,
	email: payload.email,
	cpf: payload.cpf,
	matricula: payload.matricula,
	turno: payload.turno,
	escola: payload.escola,
	endereco: payload.endereco,
	telefone: payload.telefone,
	status: payload.status,
});

export const listStudents = async (): Promise<StudentRecord[]> => {
	const { data } = await http.get<StudentResponse[]>("/api/alunos");
	return data.map((student) => normalizeStudent(student));
};

export const getStudentById = async (id: string): Promise<StudentRecord> => {
	const { data } = await http.get<StudentResponse>(`/api/alunos/${id}`);
	return normalizeStudent(data);
};

export const createStudent = async (
	payload: StudentPayload,
): Promise<StudentRecord> => {
	const { data } = await http.post<StudentResponse>(
		"/api/alunos",
		buildRequestBody(payload),
	);
	return normalizeStudent(data, payload);
};

export const updateStudent = async (
	id: string,
	payload: StudentPayload,
): Promise<StudentRecord> => {
	const { data } = await http.put<StudentResponse>(
		`/api/alunos/${id}`,
		buildRequestBody(payload),
	);
	return normalizeStudent(data, payload);
};

export const deleteStudent = async (id: string): Promise<void> => {
	await http.delete(`/api/alunos/${id}`);
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
