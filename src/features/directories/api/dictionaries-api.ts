import { Directory, DirectoryValue } from "../types";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export const getAllDirectories = async (
	year?: string
): Promise<Directory[]> => {
	let url = `${BACKEND_URL}/api/directories`;
	if (year) {
		url += `?year=${encodeURIComponent(year)}`;
	}
	const response = await fetch(url, {
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
	const response = await fetch(`${BACKEND_URL}/api/directories`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
		credentials: "include",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to fetch directories.");
	}

	const result = await response.json();
	return result;
};

export const getDirectoryById = async (id: string): Promise<Directory> => {
	const response = await fetch(`${BACKEND_URL}/api/directories/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to fetch directory.");
	}

	const result = await response.json();
	return result;
};

export const createField = async (
	directoryId: string,
	data: { name: string; type: string }
) => {
	const response = await fetch(
		`${BACKEND_URL}/api/directories/${directoryId}/fields`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
			credentials: "include",
		}
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to create field.");
	}

	const result = await response.json();
	return result;
};

export const deleteField = async (directoryId: string, fieldId: string) => {
	const response = await fetch(
		`${BACKEND_URL}/api/directories/${directoryId}/fields/${fieldId}`,
		{
			method: "DELETE",
			credentials: "include",
		}
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to delete field.");
	}

	return;
};

export const upsertFieldValue = async (
	fieldId: string,
	value: unknown
): Promise<DirectoryValue> => {
	const response = await fetch(`${BACKEND_URL}/api/field-values/upsert`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ fieldId, value }),
		credentials: "include",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to upsert field value.");
	}

	return await response.json();
};

export const updateDirectoryValues = async (
	directoryId: string,
	values: DirectoryValue[]
) => {
	const response = await fetch(
		`${BACKEND_URL}/api/directories/${directoryId}/values`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ values }),
			credentials: "include",
		}
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.message || "Failed to update directory values."
		);
	}

	return;
};
