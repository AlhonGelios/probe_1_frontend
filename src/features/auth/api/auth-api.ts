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
