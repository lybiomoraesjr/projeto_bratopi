import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { LOCAL_STORAGE_KEYS } from "../config/storage.config";
import { API_CONFIG } from "../config/api.config";

export type AuthUser = {
	id: string;
	name: string;
	email: string;
};

type SignInParams = {
	email: string;
	password: string;
};

type AuthContextDataProps = {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoadingUserStorageData: boolean;
	signIn: (params: SignInParams) => Promise<void>;
	signOut: () => void;
};

export const AuthContext = createContext<AuthContextDataProps | undefined>(
	undefined,
);

type AuthContextProviderProps = {
	children: ReactNode;
};

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

	useEffect(() => {
		try {
			const storedUserRaw = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
			if (storedUserRaw) {
				const parsedUser = JSON.parse(storedUserRaw) as AuthUser;
				setUser(parsedUser);
			}
		} catch (error) {
			console.warn("Failed to restore auth session", error);
			localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
		} finally {
			setIsLoadingUserStorageData(false);
		}
	}, []);

	const signIn = async ({ email, password }: SignInParams) => {
		setIsLoadingUserStorageData(true);
		try {
			const response = await fetch(`${API_CONFIG.baseURL}/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Credenciais inválidas");
			}

			const { user } = await response.json();

			localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
			setUser(user);
		} finally {
			setIsLoadingUserStorageData(false);
		}
	};

	const signOut = async () => {
		try {
			await fetch(`${API_CONFIG.baseURL}/api/auth/logout`, {
				method: 'POST',
			});
		} catch (error) {
			console.error("Failed to logout from API", error);
		} finally {
			localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
			setUser(null);
		}
	};

	const value = useMemo(
		() => ({
			user,
			isAuthenticated: Boolean(user),
			isLoadingUserStorageData,
			signIn,
			signOut,
		}),
		[user, isLoadingUserStorageData],
	);

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthContextProvider");
	}
	return context;
};
