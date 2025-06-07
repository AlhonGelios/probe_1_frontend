import {
	LoginCredentials,
	LoginResponse,
	RegisterCredentials,
	RequestPasswordResetCredentials,
	ResetPasswordCredentials,
	User,
	VerifyStatusResponse,
} from "../model/types";

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

		const result = await response.json();
		const userData = result.user;

		console.log(result.message);

		return userData;
	} catch (error) {
		console.error("Ошибка при регистрации:", error);
		throw error;
	}
}

export async function loginUser(
	credentials: LoginCredentials
): Promise<LoginResponse> {
	try {
		const response = await fetch(`${BASE_URL}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
			credentials: "include", // Это важно для отправки и получения кук
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				user: undefined,
				requiresCaptcha: data.requiresCaptcha || false,
				message: data.message || "Неизвестная ошибка входа.",
			};
		}

		return {
			user: data.user as User,
			message: data.message || "Вход выполнен успешно!",
		};
	} catch (error: unknown) {
		console.error("Ошибка при входе:", error);
		if (error instanceof Error) {
			return {
				user: undefined,
				message: error.message || "Ошибка сети. Попробуйте еще раз.",
			};
		}
		return { user: undefined, message: "Ошибка сети. Попробуйте еще раз." };
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
			const responseData = await response.json();
			const userData: User = responseData.user;
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

export async function checkVerificationStatus(
	userId: string
): Promise<VerifyStatusResponse> {
	try {
		const response = await fetch(
			`${BASE_URL}/api/auth/verify-status?id=${userId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.message || "Ошибка проверки статуса верификации."
			);
		}

		const data = await response.json();
		return data as VerifyStatusResponse;
	} catch (error) {
		console.error(
			`Ошибка при проверке статуса верификации для пользователя ${userId}:`,
			error
		);
		throw error;
	}
}

export async function logoutUser(): Promise<void> {
	try {
		const response = await fetch(`${BASE_URL}/api/auth/logout`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			console.warn(
				"Backend responded with non-OK status during logout, but proceeding with frontend logout.",
				response.status
			);
		}
		const data = await response.json();
		console.log("Logout response from backend:", data);
	} catch (error) {
		console.error("Ошибка при запросе на выход:", error);
	}
}

export async function requestPasswordReset(
	credentials: RequestPasswordResetCredentials
): Promise<{ message: string }> {
	try {
		const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.message || "Ошибка при запросе сброса пароля."
			);
		}

		const data = await response.json();
		return data; // Ожидаем { message: "Ссылка для сброса пароля отправлена на ваш email." }
	} catch (error) {
		console.error("Ошибка при запросе сброса пароля:", error);
		throw error;
	}
}

export async function resetPassword(
	credentials: ResetPasswordCredentials
): Promise<{ message: string }> {
	try {
		const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Ошибка при сбросе пароля.");
		}

		const data = await response.json();
		return data; // Ожидаем { message: "Пароль успешно сброшен." }
	} catch (error) {
		console.error("Ошибка при сбросе пароля:", error);
		throw error;
	}
}
