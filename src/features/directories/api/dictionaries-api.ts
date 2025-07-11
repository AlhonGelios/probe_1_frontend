import { Directory } from "../types";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export const getAllDirectories = async (): Promise<Directory[]> => {
	const response = await fetch(`${BACKEND_URL}/api/directories`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to fetch directories.");
	}

	const result = await response.json();
	return result;
};

export const createDirectory = async (
	data: Partial<Directory>
): Promise<Directory> => {
	const response = await fetch("/api/directories", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to fetch directories.");
	}

	const result = await response.json();
	return result;
};
