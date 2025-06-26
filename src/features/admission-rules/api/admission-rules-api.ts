import { EducationLevel } from "../types";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function findAllEducationLevels(): Promise<EducationLevel[]> {
	const response = await fetch(`${BACKEND_URL}/api/education-levels`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
		cache: "no-store",
		credentials: "include",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.message || "Failed to fetch get All education-levels."
		);
	}

	const data = await response.json();
	return data;
}

export async function addEducationLevels(name: string) {
	const response = await fetch(`${BACKEND_URL}/api/education-levels`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
		credentials: "include",
		body: JSON.stringify({ name }),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			errorData.message || "Failed to fetch add education-levels."
		);
	}
	const data = await response.json();
	return data;
}
