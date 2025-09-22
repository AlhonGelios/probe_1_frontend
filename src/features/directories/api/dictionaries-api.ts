import {
	CreateFieldDto,
	UpdateFieldDto,
} from "../components/edit-fields-dialog";
import { Directory, DirectoryField } from "../types";
import { useState, useEffect, useCallback } from "react";

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
	data: CreateFieldDto
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

export const updateField = async (
	directoryId: string,
	fieldId: string,
	data: UpdateFieldDto
) => {
	const response = await fetch(
		`${BACKEND_URL}/api/directories/${directoryId}/fields/${fieldId}`,
		{
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
			credentials: "include",
		}
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to update field.");
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

export const useGetDirectoryFields = (directoryId: string) => {
	const [fields, setFields] = useState<DirectoryField[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchFields = useCallback(async () => {
		if (!directoryId) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		try {
			const directory = await getDirectoryById(directoryId);
			setFields(directory.fields || []);
		} catch (error) {
			console.error("Failed to fetch fields:", error);
			setFields([]);
		} finally {
			setIsLoading(false);
		}
	}, [directoryId]);

	useEffect(() => {
		fetchFields();
	}, [fetchFields]);

	return { data: fields, isLoading, refetch: fetchFields };
};

export const deleteDirectory = async (directoryId: string) => {
	const response = await fetch(
		`${BACKEND_URL}/api/directories/${directoryId}`,
		{
			method: "DELETE",
			credentials: "include",
		}
	);

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "Failed to delete directory.");
	}

	return;
};
