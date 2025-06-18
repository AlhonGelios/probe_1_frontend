"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Role } from "../types";
import { getAllRoles } from "../api/user-api";

interface RoleState {
	roles: Role[];
	isLoading: boolean;
	error: string | null;
	fetchRoles: () => Promise<void>;
	getRoleDisplayName: (name: string) => string;
	getRoleNameByDisplayName: (displayName: string) => string | undefined;
}

export const useRoleStore = create<RoleState>()(
	devtools(
		(set, get) => ({
			roles: [],
			isLoading: false,
			error: null,

			fetchRoles: async () => {
				set({ isLoading: true, error: null });
				try {
					const fetchedRoles = await getAllRoles();
					set({ roles: fetchedRoles, isLoading: false });
				} catch (err: unknown) {
					if (err instanceof Error) {
						set({ error: err.message, isLoading: false });
						console.error("Failed to fetch roles:", err);
					}
				}
			},

			getRoleDisplayName: (name: string) => {
				const role = get().roles.find((r) => r.name === name);
				return role ? role.displayName : name;
			},

			getRoleNameByDisplayName: (displayName: string) => {
				const role = get().roles.find(
					(r) => r.displayName === displayName
				);
				return role ? role.name : undefined;
			},
		}),
		{
			name: "Role Store",
		}
	)
);
