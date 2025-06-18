import { UserEditFormValues } from "../model/schemas";
import { Role } from "../types";
import { User } from "@/features/auth/model/types";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const getAllUsers = async (): Promise<User[]> => {
	const response = await fetch(`${BACKEND_URL}/api/users/all-users`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to fetch users.");
	}

	const data = await response.json();
	return data;
	// // Преобразуем строковые даты в объекты Date, если они не приходят таковыми
	// return data.map((user: User) => ({
	//   ...user,
	//   roleExpiration: user.roleExpiration ? new Date(user.roleExpiration) : null,
	//   createdAt: new Date(user.createdAt),
	//   updatedAt: new Date(user.updatedAt),
	// }));
};

export const changeUser = async (
	userData: UserEditFormValues
): Promise<{ message: string; user: User }> => {
	const payload = {
		userId: userData.userId,
		firstName: userData.firstName,
		lastName: userData.lastName,
		role: userData.role,
		// Форматируем дату для отправки на бэкенд, если она есть
		expirationDate: userData.roleExpiration
			? userData.roleExpiration
			: null,
	};

	const response = await fetch(`${BACKEND_URL}/api/users/change-user`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to update user.");
	}

	const data = await response.json();
	// Преобразуем строковые даты в объекты Date для возвращаемого пользователя
	// data.user = {
	//   ...data.user,
	//   roleExpiration: data.user.roleExpiration ? new Date(data.user.roleExpiration) : null,
	//   createdAt: new Date(data.user.createdAt),
	//   updatedAt: new Date(data.user.updatedAt),
	// };
	return data.user;
};

export const getAllRoles = async (): Promise<Role[]> => {
	const response = await fetch(`${BACKEND_URL}/api/roles/all`, {
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
		credentials: "include",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to fetch roles.");
	}

	const data = await response.json();
	return data;
};
