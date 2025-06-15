// app/(dashboard)/users/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { UserFilterState } from "@/features/user-management/types";
import { getAllUsers } from "@/features/user-management/api/user-api";
import { UserFilters } from "@/features/user-management/components/UserFilters";
import { UserListTable } from "@/features/user-management/components/UserListTable";
import { UserEditDrawer } from "@/features/user-management/components/UserEditDrawer";
import { User } from "@/features/auth/model/types";
import { Button } from "@/shared/ui/button";

export default function UserManagementPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [filter, setFilter] = useState<UserFilterState>({
		role: "all",
		firstName: "",
		lastName: "",
	});

	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);

	// Пример списка доступных ролей (в реальном приложении это может приходить с бэкенда)
	const allAvailableRoles = useMemo(() => {
		const roles = new Set(users.map((u) => u.role.name));
		return Array.from(roles).sort(); // Сортируем для отображения
	}, [users]);

	const fetchUsers = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const fetchedUsers = await getAllUsers();
			setUsers(fetchedUsers);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Failed to load users.");
				toast.error("Ошибка загрузки пользователей", {
					description: err.message,
				});
			}
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleFilterChange = useCallback(
		(newFilter: Partial<UserFilterState>) => {
			setFilter((prev) => ({ ...prev, ...newFilter }));
		},
		[]
	);

	const handleEditUser = useCallback((user: User) => {
		setEditingUser(user);
		setIsEditDrawerOpen(true);
	}, []);

	const handleCloseDrawer = useCallback(() => {
		setIsEditDrawerOpen(false);
		setEditingUser(null);
	}, []);

	const handleUserUpdated = useCallback(() => {
		fetchUsers(); // Перезагружаем список пользователей после успешного обновления
	}, [fetchUsers]);

	// Применяем фильтры и сортировку к списку пользователей
	const filteredAndSortedUsers = useMemo(() => {
		let filteredUsers = users;

		if (filter.role !== "all") {
			filteredUsers = filteredUsers.filter(
				(user) => user.role.name === filter.role
			);
		}

		if (filter.firstName) {
			filteredUsers = filteredUsers.filter((user) =>
				user.firstName
					.toLowerCase()
					.includes(filter.firstName.toLowerCase())
			);
		}

		if (filter.lastName) {
			filteredUsers = filteredUsers.filter((user) =>
				user.lastName
					.toLowerCase()
					.includes(filter.lastName.toLowerCase())
			);
		}

		// Сортировка (например, по имени и фамилии)
		filteredUsers.sort((a, b) => {
			const nameComparison = a.firstName.localeCompare(b.firstName);
			if (nameComparison !== 0) return nameComparison;
			return a.lastName.localeCompare(b.lastName);
		});

		return filteredUsers;
	}, [users, filter]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-muted-foreground">
					Загрузка пользователей...
				</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center p-8 text-destructive-foreground bg-destructive rounded-lg">
				<p className="font-semibold">Ошибка:</p>
				<p>{error}</p>
				<Button onClick={fetchUsers} className="mt-4">
					Повторить попытку
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6 text-foreground">
				Управление пользователями
			</h1>

			<UserFilters
				filter={filter}
				onFilterChange={handleFilterChange}
				availableRoles={allAvailableRoles}
			/>

			<UserListTable
				users={filteredAndSortedUsers}
				onEditUser={handleEditUser}
			/>

			<UserEditDrawer
				user={editingUser}
				isOpen={isEditDrawerOpen}
				onClose={handleCloseDrawer}
				onUserUpdated={handleUserUpdated}
				availableRoles={allAvailableRoles}
			/>
		</div>
	);
}
