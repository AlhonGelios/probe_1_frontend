import { LoginCredentials, RegisterCredentials, User } from "../model/types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function registerUser(
	credentials: RegisterCredentials
): Promise<User> {
	try {
		const response = await fetch(`${BASE_URL}/api/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Ошибка регистрации");
		}

		const userData: User = await response.json();
		return userData;
	} catch (error) {
		console.error("Ошибка при регистрации:", error);
		throw error;
	}
}

export async function loginUser(credentials: LoginCredentials): Promise<User> {
	try {
		const response = await fetch(`${BASE_URL}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
			credentials: "include", // Это важно для отправки и получения кук
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Ошибка авторизации");
		}

		const userData: User = await response.json();
		return userData;
	} catch (error) {
		console.error("Ошибка при авторизации:", error);
		throw error;
	}
}

export async function checkSession(): Promise<User | null> {
	try {
		const response = await fetch(`${BASE_URL}/api/auth/session-status`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include", // Важно для отправки кук с запросом
		});

		if (response.ok) {
			const userData: User = await response.json();
			return userData;
		} else if (response.status === 403) {
			return null;
		} else {
			const errorData = await response.json();
			throw new Error(
				errorData.message || "Ошибка проверки сессии на сервере."
			);
		}
	} catch (error) {
		console.error("Ошибка при проверке сессии:", error);
		return null;
	}
}
