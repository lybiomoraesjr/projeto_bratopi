import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { LOCAL_STORAGE_KEYS } from "../config/storage.config";
import { useAuthApi } from "../hooks/useAuthApi";

export type AuthUser = {
	name: string;
	email: string;
	role?: string;
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
	const { login, logout } = useAuthApi();

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
			const { user: apiUser } = await login({ email, password });
			const normalizedUser: AuthUser = {
				name: apiUser.name,
				email: apiUser.email,
				role: apiUser.role,
			};
			localStorage.setItem(
				LOCAL_STORAGE_KEYS.USER,
				JSON.stringify(normalizedUser),
			);
			setUser(normalizedUser);
		} finally {
			setIsLoadingUserStorageData(false);
		}
	};

	const signOut = async () => {
		try {
			await logout();
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
