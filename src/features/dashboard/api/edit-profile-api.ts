import { EditProfileResponse } from "../model/types";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function changePassword(data: {
	currentPassword: string;
	newPassword: string;
}): Promise<void> {
	const response = await fetch(`${BACKEND_URL}/api/users/change-password`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
		credentials: "include",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.message ||
				"Не удалось сменить пароль. Пожалуйста, попробуйте еще раз."
		);
	}
}

export async function updateProfile(data: {
	firstName: string;
	lastName: string;
}): Promise<EditProfileResponse> {
	const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
		credentials: "include",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Не удалось обновить профиль.");
	}
	return response.json();
}
