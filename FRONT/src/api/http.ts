import axios from "axios";
import { API_CONFIG } from "../config/api.config";

export const http = axios.create({
	baseURL: API_CONFIG.baseURL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

export default http;
