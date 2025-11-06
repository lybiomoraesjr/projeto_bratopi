const DEFAULT_API_BASE_URL = "http://localhost:3456";

export const API_CONFIG = {
	baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
};
