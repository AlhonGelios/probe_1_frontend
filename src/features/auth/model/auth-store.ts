import { create } from "zustand";
import { User } from "./types";
import { checkSession, logoutUser } from "../api/auth-api";

interface AuthState {
	user: User | null;
	isLoggedIn: boolean;
	isLoading: boolean;
	error: string | null;
	isInitialized: boolean;

	setUser: (user: User | null) => void;
	updateUser: (user: Partial<User>) => void;
	login: (user: User) => void;
	logout: () => Promise<void>;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
	user: null,
	isLoggedIn: false,
	isLoading: false,
	error: null,
	isInitialized: false,

	setUser: (user) =>
		set(() => ({
			user: user,
			isLoggedIn: !!user,
		})),

	updateUser: (userData) => {
		set((state) => ({
			user: state.user ? { ...state.user, ...userData } : null,
		}));
	},

	login: (user) =>
		set(() => ({
			user: user,
			isLoggedIn: true,
			error: null,
		})),

	logout: async () => {
		const { setLoading, setError } = get();
		setLoading(true);
		setError(null);
		try {
			await logoutUser();
		} catch (err: unknown) {
			console.error("Ошибка при выходе из системы:", err);
			if (err instanceof Error) {
				setError(err.message || "Произошла ошибка при выходе.");
			} else {
				setError("Произошла неизвестная ошибка при выходе.");
			}
		} finally {
			set(() => ({
				user: null,
				isLoggedIn: false,
				isInitialized: false,
				error: null,
			}));
			setLoading(false);
		}
	},

	setLoading: (loading) => set(() => ({ isLoading: loading })),

	setError: (error) => set(() => ({ error: error })),

	checkAuth: async () => {
		const { setLoading, setUser, setError } = get();
		setLoading(true);
		setError(null);
		try {
			const user = await checkSession();
			setUser(user);
		} catch (err: unknown) {
			console.error("Failed to check auth:", err);
			if (err instanceof Error) {
				setError(
					err.message || "Не удалось проверить статус авторизации."
				);
			} else {
				setError(
					"Произошла неизвестная ошибка при проверке авторизации."
				);
			}
			setUser(null);
		} finally {
			setLoading(false);
			set(() => ({ isInitialized: true }));
		}
	},
}));
